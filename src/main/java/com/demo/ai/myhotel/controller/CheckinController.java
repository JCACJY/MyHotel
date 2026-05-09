package com.demo.ai.myhotel.controller;

import com.demo.ai.myhotel.dto.ApiResponse;
import com.demo.ai.myhotel.dto.CheckinRequest;
import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.service.CheckinService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkins")
public class CheckinController {

    private final CheckinService checkinService;

    public CheckinController(CheckinService checkinService) {
        this.checkinService = checkinService;
    }

    @PostMapping
    public ApiResponse<OrderResponse> checkin(@Valid @RequestBody CheckinRequest request) {
        return ApiResponse.success(checkinService.checkin(request));
    }
}
