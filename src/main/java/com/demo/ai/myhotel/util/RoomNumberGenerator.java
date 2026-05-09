package com.demo.ai.myhotel.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class RoomNumberGenerator {

    private final int minFloor;
    private final int maxFloor;
    private final int maxRoomPerFloor;
    private final SecureRandom random = new SecureRandom();

    public RoomNumberGenerator(
            @Value("${myhotel.room-number.min-floor:8}") int minFloor,
            @Value("${myhotel.room-number.max-floor:19}") int maxFloor,
            @Value("${myhotel.room-number.max-room-per-floor:20}") int maxRoomPerFloor
    ) {
        this.minFloor = minFloor;
        this.maxFloor = maxFloor;
        this.maxRoomPerFloor = maxRoomPerFloor;
    }

    public String generate() {
        var floor = random.nextInt(maxFloor - minFloor + 1) + minFloor;
        var room = random.nextInt(maxRoomPerFloor) + 1;
        return "%d%02d".formatted(floor, room);
    }
}
