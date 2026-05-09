package com.demo.ai.myhotel.service.impl;

import com.demo.ai.myhotel.dto.CheckinRequest;
import com.demo.ai.myhotel.entity.BookingOrder;
import com.demo.ai.myhotel.entity.OrderStatus;
import com.demo.ai.myhotel.exception.BusinessException;
import com.demo.ai.myhotel.exception.ResourceNotFoundException;
import com.demo.ai.myhotel.mapper.BookingOrderMapper;
import com.demo.ai.myhotel.mapper.OrderDtoMapper;
import com.demo.ai.myhotel.util.RoomNumberGenerator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CheckinServiceImplTest {

    private final BookingOrderMapper bookingOrderMapper = mock(BookingOrderMapper.class);
    private final RoomNumberGenerator roomNumberGenerator = mock(RoomNumberGenerator.class);
    private final CheckinServiceImpl service = new CheckinServiceImpl(
            bookingOrderMapper,
            roomNumberGenerator,
            new OrderDtoMapper()
    );

    @Test
    void checkin_givenValidOrderAndIdTail_expectedCheckedInOrder() {
        when(bookingOrderMapper.selectOne(any())).thenReturn(order(OrderStatus.BOOKED.value(), null));
        when(roomNumberGenerator.generate()).thenReturn("1208");

        var response = service.checkin(new CheckinRequest("HT1234567890", "1234"));

        assertThat(response.status()).isEqualTo("checked_in");
        assertThat(response.roomNumber()).isEqualTo("1208");
        verify(bookingOrderMapper).updateById(any(BookingOrder.class));
    }

    @Test
    void checkin_givenAlreadyCheckedInOrder_expectedExistingRoomReturned() {
        when(bookingOrderMapper.selectOne(any())).thenReturn(order(OrderStatus.CHECKED_IN.value(), "0901"));

        var response = service.checkin(new CheckinRequest("HT1234567890", "1234"));

        assertThat(response.status()).isEqualTo("checked_in");
        assertThat(response.roomNumber()).isEqualTo("0901");
    }

    @Test
    void checkin_givenIdTailMismatch_expectedBusinessException() {
        when(bookingOrderMapper.selectOne(any())).thenReturn(order(OrderStatus.BOOKED.value(), null));

        assertThatThrownBy(() -> service.checkin(new CheckinRequest("HT1234567890", "9999")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ID number tail does not match");
    }

    @Test
    void checkin_givenMissingOrder_expectedResourceNotFound() {
        when(bookingOrderMapper.selectOne(any())).thenReturn(null);

        assertThatThrownBy(() -> service.checkin(new CheckinRequest("HT404", "1234")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void checkin_givenCancelledOrder_expectedBusinessException() {
        when(bookingOrderMapper.selectOne(any())).thenReturn(order(OrderStatus.CANCELLED.value(), null));

        assertThatThrownBy(() -> service.checkin(new CheckinRequest("HT1234567890", "1234")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Order status cannot check in");
    }

    private BookingOrder order(String status, String roomNumber) {
        var order = new BookingOrder();
        order.setId(1L);
        order.setOrderNo("HT1234567890");
        order.setGuestName("张三");
        order.setPhone("13800138000");
        order.setIdNumber("110101199001011234");
        order.setRoomTypeCode("deluxe");
        order.setRoomTypeName("豪华大床房");
        order.setCheckInDate(LocalDate.now().plusDays(1));
        order.setCheckOutDate(LocalDate.now().plusDays(2));
        order.setNights(1);
        order.setGuests(2);
        order.setTotalPrice(new BigDecimal("888.00"));
        order.setStatus(status);
        order.setRoomNumber(roomNumber);
        return order;
    }
}
