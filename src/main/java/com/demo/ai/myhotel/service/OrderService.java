package com.demo.ai.myhotel.service;

import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.dto.PageResponse;

public interface OrderService {

    PageResponse<OrderResponse> listOrders(String keyword, int page, int size);

    OrderResponse getOrder(String orderNo);
}
