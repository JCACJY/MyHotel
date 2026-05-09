package com.demo.ai.myhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record OrderResponse(
        String id,
        String guestName,
        String phone,
        String idNumber,
        String roomTypeId,
        String roomTypeName,
        LocalDate checkIn,
        LocalDate checkOut,
        int nights,
        int guests,
        BigDecimal totalPrice,
        String status,
        String roomNumber,
        LocalDateTime createdAt
) {
}
