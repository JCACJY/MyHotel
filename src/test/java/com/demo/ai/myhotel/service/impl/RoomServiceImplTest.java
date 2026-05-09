package com.demo.ai.myhotel.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.demo.ai.myhotel.entity.Room;
import com.demo.ai.myhotel.mapper.RoomDtoMapper;
import com.demo.ai.myhotel.mapper.RoomMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RoomServiceImplTest {

    private final RoomMapper roomMapper = mock(RoomMapper.class);
    private final RoomServiceImpl service = new RoomServiceImpl(roomMapper, new RoomDtoMapper());

    @Test
    void listRooms_givenPageRequest_expectedPaginatedRooms() {
        var page = new Page<Room>(1, 2);
        page.setTotal(3);
        page.setRecords(List.of(room("deluxe"), room("twin")));
        when(roomMapper.selectPage(any(), any())).thenReturn(page);

        var response = service.listRooms(0, 2);

        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(2);
        assertThat(response.total()).isEqualTo(3);
        assertThat(response.items()).extracting("id").containsExactly("deluxe", "twin");
    }

    private Room room(String code) {
        var room = new Room();
        room.setCode(code);
        room.setName(code);
        room.setDescription(code + " description");
        room.setPrice(new BigDecimal("100.00"));
        room.setBed("bed");
        room.setSize("42㎡");
        room.setImageKey("image-" + code);
        return room;
    }
}
