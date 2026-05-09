package com.demo.ai.myhotel.service;

import com.demo.ai.myhotel.dto.BookingRequest;
import com.demo.ai.myhotel.dto.OrderResponse;

public interface BookingService {

    OrderResponse createBooking(BookingRequest request);
}
