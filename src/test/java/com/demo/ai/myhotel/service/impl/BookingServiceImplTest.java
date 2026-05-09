package com.demo.ai.myhotel.service.impl;

import com.demo.ai.myhotel.dto.BookingRequest;
import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.entity.BookingOrder;
import com.demo.ai.myhotel.entity.Room;
import com.demo.ai.myhotel.exception.BusinessException;
import com.demo.ai.myhotel.exception.ResourceNotFoundException;
import com.demo.ai.myhotel.mapper.BookingOrderMapper;
import com.demo.ai.myhotel.mapper.OrderDtoMapper;
import com.demo.ai.myhotel.mapper.RoomMapper;
import com.demo.ai.myhotel.util.OrderNumberGenerator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingServiceImplTest {

    private final RoomMapper roomMapper = mock(RoomMapper.class);
    private final BookingOrderMapper bookingOrderMapper = mock(BookingOrderMapper.class);
    private final OrderNumberGenerator orderNumberGenerator = mock(OrderNumberGenerator.class);
    private final OrderDtoMapper orderDtoMapper = new OrderDtoMapper();
    private final BookingServiceImpl service = new BookingServiceImpl(
            roomMapper,
            bookingOrderMapper,
            orderNumberGenerator,
            orderDtoMapper
    );

    @Test
    void createBooking_givenValidRequest_expectedCalculatedOrder() {
        var room = new Room();
        room.setCode("deluxe");
        room.setName("豪华大床房");
        room.setPrice(new BigDecimal("888.00"));
        when(roomMapper.selectOne(any())).thenReturn(room);
        when(orderNumberGenerator.generate()).thenReturn("HT1234567890");

        var request = new BookingRequest(
                "张三",
                "13800138000",
                "110101199001011234",
                "deluxe",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                2
        );

        OrderResponse response = service.createBooking(request);

        assertThat(response.id()).isEqualTo("HT1234567890");
        assertThat(response.roomTypeId()).isEqualTo("deluxe");
        assertThat(response.roomTypeName()).isEqualTo("豪华大床房");
        assertThat(response.nights()).isEqualTo(2);
        assertThat(response.totalPrice()).isEqualByComparingTo("1776.00");
        assertThat(response.status()).isEqualTo("booked");
        verify(bookingOrderMapper).insert(any(BookingOrder.class));
    }

    @Test
    void createBooking_givenUnknownRoomType_expectedResourceNotFound() {
        when(roomMapper.selectOne(any())).thenReturn(null);
        var request = validRequest("missing", LocalDate.now().plusDays(1), LocalDate.now().plusDays(2));

        assertThatThrownBy(() -> service.createBooking(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Room type not found");
    }

    @Test
    void createBooking_givenCheckoutNotAfterCheckin_expectedBusinessException() {
        var request = validRequest("deluxe", LocalDate.now().plusDays(2), LocalDate.now().plusDays(2));

        assertThatThrownBy(() -> service.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Check-out date must be after check-in date");
    }

    @Test
    void createBooking_givenPastCheckinDate_expectedBusinessException() {
        var request = validRequest("deluxe", LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));

        assertThatThrownBy(() -> service.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Check-in date cannot be before today");
    }

    private BookingRequest validRequest(String roomTypeId, LocalDate checkIn, LocalDate checkOut) {
        return new BookingRequest(
                "张三",
                "13800138000",
                "110101199001011234",
                roomTypeId,
                checkIn,
                checkOut,
                2
        );
    }
}
