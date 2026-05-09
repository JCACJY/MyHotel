package com.demo.ai.myhotel.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.demo.ai.myhotel.dto.PageResponse;
import com.demo.ai.myhotel.dto.RoomResponse;
import com.demo.ai.myhotel.entity.Room;
import com.demo.ai.myhotel.mapper.RoomDtoMapper;
import com.demo.ai.myhotel.mapper.RoomMapper;
import com.demo.ai.myhotel.service.RoomService;
import org.springframework.stereotype.Service;

@Service
public class RoomServiceImpl implements RoomService {

    private static final int MIN_SIZE = 1;
    private static final int MAX_SIZE = 100;

    private final RoomMapper roomMapper;
    private final RoomDtoMapper roomDtoMapper;

    public RoomServiceImpl(RoomMapper roomMapper, RoomDtoMapper roomDtoMapper) {
        this.roomMapper = roomMapper;
        this.roomDtoMapper = roomDtoMapper;
    }

    @Override
    public PageResponse<RoomResponse> listRooms(int page, int size) {
        int normalizedPage = Math.max(0, page);
        int normalizedSize = Math.max(MIN_SIZE, Math.min(size, MAX_SIZE));
        var result = roomMapper.selectPage(new Page<>(normalizedPage + 1L, normalizedSize), null);
        var items = result.getRecords().stream()
                .map(roomDtoMapper::toResponse)
                .toList();
        return new PageResponse<>(items, normalizedPage, normalizedSize, result.getTotal());
    }
}
