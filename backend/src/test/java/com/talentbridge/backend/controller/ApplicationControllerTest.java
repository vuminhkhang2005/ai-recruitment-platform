package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.dto.QuickApplyRequestDto;
import com.talentbridge.backend.dto.QuickApplyResponseDto;
import com.talentbridge.backend.security.CustomAccessDeniedHandler;
import com.talentbridge.backend.security.JwtAuthenticationEntryPoint;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserDetailsServiceImpl;
import com.talentbridge.backend.service.ApplicationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private JwtCookieHelper jwtCookieHelper;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    @Test
    @DisplayName("POST /api/v1/applications/quick-apply - Should return 201 Created")
    void testQuickApply_Success() throws Exception {
        QuickApplyRequestDto request = QuickApplyRequestDto.builder()
                .jobId(1L)
                .fullName("Nguyen Van An")
                .email("an.nguyen@example.com")
                .phone("0987654321")
                .coverLetter("Tôi rất muốn làm việc tại VNG.")
                .build();

        QuickApplyResponseDto response = QuickApplyResponseDto.builder()
                .applicationUuid("app-uuid-123")
                .jobTitle("Senior Fullstack Engineer")
                .companyName("VNG Corporation")
                .message("Ứng tuyển thành công! Nhà tuyển dụng VNG Corporation đã nhận được hồ sơ của bạn.")
                .appliedAt(LocalDateTime.now())
                .build();

        when(applicationService.quickApply(any(QuickApplyRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/applications/quick-apply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.jobTitle").value("Senior Fullstack Engineer"))
                .andExpect(jsonPath("$.data.companyName").value("VNG Corporation"));
    }
}
