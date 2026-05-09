package com.demo.ai.myhotel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.dto.PageResponse;
import com.demo.ai.myhotel.entity.BookingOrder;
import com.demo.ai.myhotel.exception.ResourceNotFoundException;
import com.demo.ai.myhotel.mapper.BookingOrderMapper;
import com.demo.ai.myhotel.mapper.OrderDtoMapper;
import com.demo.ai.myhotel.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class OrderServiceImpl implements OrderService {

    private static final int MIN_SIZE = 1;
    private static final int MAX_SIZE = 100;

    private final BookingOrderMapper bookingOrderMapper;
    private final OrderDtoMapper orderDtoMapper;

    public OrderServiceImpl(BookingOrderMapper bookingOrderMapper, OrderDtoMapper orderDtoMapper) {
        this.bookingOrderMapper = bookingOrderMapper;
        this.orderDtoMapper = orderDtoMapper;
    }

    @Override
    public PageResponse<OrderResponse> listOrders(String keyword, int page, int size) {
        int normalizedPage = Math.max(0, page);
        int normalizedSize = Math.max(MIN_SIZE, Math.min(size, MAX_SIZE));
        var wrapper = new LambdaQueryWrapper<BookingOrder>()
                .orderByDesc(BookingOrder::getCreatedAt);
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim();
            wrapper.and(query -> query
                    .like(BookingOrder::getOrderNo, kw)
                    .or()
                    .like(BookingOrder::getGuestName, kw)
                    .or()
                    .like(BookingOrder::getPhone, kw));
        }
        var result = bookingOrderMapper.selectPage(new Page<>(normalizedPage + 1L, normalizedSize), wrapper);
        var items = result.getRecords().stream()
                .map(orderDtoMapper::toResponse)
                .toList();
        return new PageResponse<>(items, normalizedPage, normalizedSize, result.getTotal());
    }

    @Override
    public OrderResponse getOrder(String orderNo) {
        var order = bookingOrderMapper.selectOne(new LambdaQueryWrapper<BookingOrder>()
                .eq(BookingOrder::getOrderNo, orderNo));
        if (order == null) {
            throw new ResourceNotFoundException("Order not found: " + orderNo);
        }
        return orderDtoMapper.toResponse(order);
    }
}
