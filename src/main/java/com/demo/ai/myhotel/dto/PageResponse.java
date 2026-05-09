package com.demo.ai.myhotel.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        long page,
        long size,
        long total
) {
}
