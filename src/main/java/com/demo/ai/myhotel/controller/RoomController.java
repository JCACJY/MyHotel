package com.demo.ai.myhotel.controller;

import com.demo.ai.myhotel.dto.ApiResponse;
import com.demo.ai.myhotel.dto.PageResponse;
import com.demo.ai.myhotel.dto.RoomResponse;
import com.demo.ai.myhotel.service.RoomService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ApiResponse<PageResponse<RoomResponse>> listRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(roomService.listRooms(page, size));
    }
}
