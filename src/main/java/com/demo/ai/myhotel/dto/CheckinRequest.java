package com.demo.ai.myhotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckinRequest(
        @NotBlank String orderNo,
        @NotBlank @Size(min = 4, max = 6) String idNumberTail
) {
}
