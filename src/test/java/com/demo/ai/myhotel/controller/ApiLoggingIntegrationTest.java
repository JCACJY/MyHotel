package com.demo.ai.myhotel.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(OutputCaptureExtension.class)
class ApiLoggingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiRequest_givenRoomsEndpoint_expectedRequestLog(CapturedOutput output) throws Exception {
        mockMvc.perform(get("/api/rooms")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk());

        assertThat(output.getOut())
                .contains("API request completed")
                .contains("method=GET")
                .contains("path=/api/rooms")
                .contains("status=200")
                .contains("durationMs=");
    }
}
