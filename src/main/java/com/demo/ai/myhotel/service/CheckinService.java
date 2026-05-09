package com.demo.ai.myhotel.service;

import com.demo.ai.myhotel.dto.CheckinRequest;
import com.demo.ai.myhotel.dto.OrderResponse;

public interface CheckinService {

    OrderResponse checkin(CheckinRequest request);
}
