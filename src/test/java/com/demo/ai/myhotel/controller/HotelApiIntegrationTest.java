package com.demo.ai.myhotel.controller;

import com.demo.ai.myhotel.dto.BookingRequest;
import com.demo.ai.myhotel.dto.CheckinRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HotelApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void rooms_givenSeedData_expectedUnifiedEnvelope() throws Exception {
        mockMvc.perform(get("/api/rooms")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"))
                .andExpect(jsonPath("$.data.total").value(3))
                .andExpect(jsonPath("$.data.items[0].id").value("deluxe"));
    }

    @Test
    void bookingOrderAndCheckin_givenValidFlow_expectedUnifiedEnvelope() throws Exception {
        var bookingRequest = new BookingRequest(
                "李四",
                "13900139000",
                "110101199001011234",
                "deluxe",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                2
        );

        var bookingResult = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("success"))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("booked"))
                .andExpect(jsonPath("$.data.nights").value(2))
                .andReturn();

        JsonNode bookingJson = objectMapper.readTree(bookingResult.getResponse().getContentAsString());
        String orderNo = bookingJson.at("/data/id").asText();
        assertThat(orderNo).startsWith("HT");

        mockMvc.perform(get("/api/orders/{orderNo}", orderNo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(orderNo));

        mockMvc.perform(get("/api/orders")
                        .param("q", "13900139000")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1));

        var checkinRequest = new CheckinRequest(orderNo, "1234");
        mockMvc.perform(post("/api/checkins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkinRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("checked_in"))
                .andExpect(jsonPath("$.data.roomNumber").isNotEmpty());
    }

    @Test
    void booking_givenInvalidRequest_expectedUnifiedErrorEnvelope() throws Exception {
        var request = new BookingRequest(
                "",
                "bad-phone",
                "",
                "missing",
                LocalDate.now().plusDays(1),
                LocalDate.now(),
                9
        );

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
