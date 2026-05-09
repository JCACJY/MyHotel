package com.demo.ai.myhotel.mapper;

import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.entity.BookingOrder;
import org.springframework.stereotype.Component;

@Component
public class OrderDtoMapper {

    public OrderResponse toResponse(BookingOrder order) {
        return new OrderResponse(
                order.getOrderNo(),
                order.getGuestName(),
                order.getPhone(),
                order.getIdNumber(),
                order.getRoomTypeCode(),
                order.getRoomTypeName(),
                order.getCheckInDate(),
                order.getCheckOutDate(),
                order.getNights(),
                order.getGuests(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getRoomNumber(),
                order.getCreatedAt()
        );
    }
}
