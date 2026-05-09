package com.demo.ai.myhotel.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.demo.ai.myhotel.entity.BookingOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BookingOrderMapper extends BaseMapper<BookingOrder> {
}
