package com.demo.ai.myhotel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.demo.ai.myhotel.dto.CheckinRequest;
import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.entity.BookingOrder;
import com.demo.ai.myhotel.entity.OrderStatus;
import com.demo.ai.myhotel.exception.BusinessException;
import com.demo.ai.myhotel.exception.ResourceNotFoundException;
import com.demo.ai.myhotel.mapper.BookingOrderMapper;
import com.demo.ai.myhotel.mapper.OrderDtoMapper;
import com.demo.ai.myhotel.service.CheckinService;
import com.demo.ai.myhotel.util.RoomNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CheckinServiceImpl implements CheckinService {

    private final BookingOrderMapper bookingOrderMapper;
    private final RoomNumberGenerator roomNumberGenerator;
    private final OrderDtoMapper orderDtoMapper;

    public CheckinServiceImpl(
            BookingOrderMapper bookingOrderMapper,
            RoomNumberGenerator roomNumberGenerator,
            OrderDtoMapper orderDtoMapper
    ) {
        this.bookingOrderMapper = bookingOrderMapper;
        this.roomNumberGenerator = roomNumberGenerator;
        this.orderDtoMapper = orderDtoMapper;
    }

    @Override
    @Transactional
    public OrderResponse checkin(CheckinRequest request) {
        var order = bookingOrderMapper.selectOne(new LambdaQueryWrapper<BookingOrder>()
                .eq(BookingOrder::getOrderNo, request.orderNo()));
        if (order == null) {
            throw new ResourceNotFoundException("Order not found: " + request.orderNo());
        }
        if (OrderStatus.CHECKED_IN.value().equals(order.getStatus())) {
            return orderDtoMapper.toResponse(order);
        }
        if (!OrderStatus.BOOKED.value().equals(order.getStatus())) {
            throw new BusinessException("Order status cannot check in: " + order.getStatus());
        }
        if (!order.getIdNumber().toLowerCase().endsWith(request.idNumberTail().toLowerCase())) {
            throw new BusinessException("ID number tail does not match");
        }

        order.setStatus(OrderStatus.CHECKED_IN.value());
        order.setRoomNumber(roomNumberGenerator.generate());
        order.setUpdatedAt(LocalDateTime.now());
        bookingOrderMapper.updateById(order);
        return orderDtoMapper.toResponse(order);
    }
}
