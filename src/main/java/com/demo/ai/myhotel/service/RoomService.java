package com.demo.ai.myhotel.service;

import com.demo.ai.myhotel.dto.PageResponse;
import com.demo.ai.myhotel.dto.RoomResponse;

public interface RoomService {

    PageResponse<RoomResponse> listRooms(int page, int size);
}
