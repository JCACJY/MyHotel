package com.demo.ai.myhotel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.demo.ai.myhotel.dto.BookingRequest;
import com.demo.ai.myhotel.dto.OrderResponse;
import com.demo.ai.myhotel.entity.BookingOrder;
import com.demo.ai.myhotel.entity.OrderStatus;
import com.demo.ai.myhotel.entity.Room;
import com.demo.ai.myhotel.exception.BusinessException;
import com.demo.ai.myhotel.exception.ResourceNotFoundException;
import com.demo.ai.myhotel.mapper.BookingOrderMapper;
import com.demo.ai.myhotel.mapper.OrderDtoMapper;
import com.demo.ai.myhotel.mapper.RoomMapper;
import com.demo.ai.myhotel.service.BookingService;
import com.demo.ai.myhotel.util.OrderNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class BookingServiceImpl implements BookingService {

    private final RoomMapper roomMapper;
    private final BookingOrderMapper bookingOrderMapper;
    private final OrderNumberGenerator orderNumberGenerator;
    private final OrderDtoMapper orderDtoMapper;

    public BookingServiceImpl(
            RoomMapper roomMapper,
            BookingOrderMapper bookingOrderMapper,
            OrderNumberGenerator orderNumberGenerator,
            OrderDtoMapper orderDtoMapper
    ) {
        this.roomMapper = roomMapper;
        this.bookingOrderMapper = bookingOrderMapper;
        this.orderNumberGenerator = orderNumberGenerator;
        this.orderDtoMapper = orderDtoMapper;
    }

    @Override
    @Transactional
    public OrderResponse createBooking(BookingRequest request) {
        validateDates(request.checkIn(), request.checkOut());
        Room room = findRoom(request.roomTypeId());
        int nights = Math.toIntExact(ChronoUnit.DAYS.between(request.checkIn(), request.checkOut()));

        var now = LocalDateTime.now();
        var order = new BookingOrder();
        order.setOrderNo(orderNumberGenerator.generate());
        order.setGuestName(request.guestName());
        order.setPhone(request.phone());
        order.setIdNumber(request.idNumber());
        order.setRoomTypeCode(room.getCode());
        order.setRoomTypeName(room.getName());
        order.setCheckInDate(request.checkIn());
        order.setCheckOutDate(request.checkOut());
        order.setNights(nights);
        order.setGuests(request.guests());
        order.setTotalPrice(room.getPrice().multiply(java.math.BigDecimal.valueOf(nights)));
        order.setStatus(OrderStatus.BOOKED.value());
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        bookingOrderMapper.insert(order);
        return orderDtoMapper.toResponse(order);
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BusinessException("Check-in date cannot be before today");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new BusinessException("Check-out date must be after check-in date");
        }
    }

    private Room findRoom(String roomTypeId) {
        var wrapper = new LambdaQueryWrapper<Room>().eq(Room::getCode, roomTypeId);
        var room = roomMapper.selectOne(wrapper);
        if (room == null) {
            throw new ResourceNotFoundException("Room type not found: " + roomTypeId);
        }
        return room;
    }
}
