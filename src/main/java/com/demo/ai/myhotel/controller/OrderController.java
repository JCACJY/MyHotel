package com.demo.ai.myhotel.controller;

import com.demo.ai.myhotel.dto.ApiResponse;
import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.dto.PageResponse;
import com.demo.ai.myhotel.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderResponse>> listOrders(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(orderService.listOrders(q, page, size));
    }

    @GetMapping("/{orderNo}")
    public ApiResponse<OrderResponse> getOrder(@PathVariable String orderNo) {
        return ApiResponse.success(orderService.getOrder(orderNo));
    }
}
