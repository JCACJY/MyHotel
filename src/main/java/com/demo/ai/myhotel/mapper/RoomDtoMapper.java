package com.demo.ai.myhotel.mapper;

import com.demo.ai.myhotel.dto.RoomResponse;
import com.demo.ai.myhotel.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomDtoMapper {

    public RoomResponse toResponse(Room room) {
        return new RoomResponse(
                room.getCode(),
                room.getName(),
                room.getDescription(),
                room.getPrice(),
                room.getBed(),
                room.getSize(),
                room.getImageKey()
        );
    }
}
