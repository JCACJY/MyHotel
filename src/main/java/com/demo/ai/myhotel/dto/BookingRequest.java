package com.demo.ai.myhotel.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record BookingRequest(
        @NotBlank String guestName,
        @NotBlank @Pattern(regexp = "^1[3-9]\\d{9}$", message = "phone must be a valid mainland China mobile number") String phone,
        @NotBlank String idNumber,
        @NotBlank String roomTypeId,
        @NotNull @FutureOrPresent LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @NotNull @Min(1) @Max(4) Integer guests
) {
}
