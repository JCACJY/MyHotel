package com.demo.ai.myhotel.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.demo.ai.myhotel.entity.BookingOrder;
import com.demo.ai.myhotel.entity.OrderStatus;
import com.demo.ai.myhotel.exception.ResourceNotFoundException;
import com.demo.ai.myhotel.mapper.BookingOrderMapper;
import com.demo.ai.myhotel.mapper.OrderDtoMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderServiceImplTest {

    private final BookingOrderMapper bookingOrderMapper = mock(BookingOrderMapper.class);
    private final OrderServiceImpl service = new OrderServiceImpl(bookingOrderMapper, new OrderDtoMapper());

    @Test
    void listOrders_givenKeyword_expectedPaginatedOrders() {
        var page = new Page<BookingOrder>(1, 10);
        page.setTotal(1);
        page.setRecords(List.of(order("HT1234567890")));
        when(bookingOrderMapper.selectPage(any(), any())).thenReturn(page);

        var response = service.listOrders("张三", 0, 10);

        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.total()).isEqualTo(1);
        assertThat(response.items()).extracting("id").containsExactly("HT1234567890");
    }

    @Test
    void getOrder_givenMissingOrderNo_expectedResourceNotFound() {
        when(bookingOrderMapper.selectOne(any())).thenReturn(null);

        assertThatThrownBy(() -> service.getOrder("HT404"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    private BookingOrder order(String orderNo) {
        var order = new BookingOrder();
        order.setOrderNo(orderNo);
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
        order.setStatus(OrderStatus.BOOKED.value());
        return order;
    }
}
