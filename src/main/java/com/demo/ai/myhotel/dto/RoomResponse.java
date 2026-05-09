package com.demo.ai.myhotel.dto;

import java.math.BigDecimal;

public record RoomResponse(
        String id,
        String name,
        String desc,
        BigDecimal price,
        String bed,
        String size,
        String image
) {
}
