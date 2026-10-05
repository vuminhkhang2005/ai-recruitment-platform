package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.ApplicationCreateRequestDto;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.security.CustomAccessDeniedHandler;
import com.talentbridge.backend.security.JwtAuthenticationEntryPoint;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserDetailsServiceImpl;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.ApplicationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

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
    @DisplayName("POST /api/v1/applications - authenticated candidate gets 201 Created")
    void testApply_Success() throws Exception {
        ApplicationCreateRequestDto request = ApplicationCreateRequestDto.builder()
                .jobId(1L)
                .coverLetter("Tôi rất muốn làm việc tại VNG.")
                .build();

        ApplicationResponseDto response = ApplicationResponseDto.builder()
                .id(99L)
                .jobId(1L)
                .jobTitle("Senior Fullstack Engineer")
                .companyName("VNG Corporation")
                .currentStage("APPLIED")
                .appliedAt(LocalDateTime.now())
                .build();

        when(applicationService.apply(any(ApplicationCreateRequestDto.class), eq(12L))).thenReturn(response);

        UserPrincipal candidate = UserPrincipal.builder()
                .id(12L).uuid("u-12").email("nguyenvanan.it@gmail.com").password("x").fullName("Nguyen Van An")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CANDIDATE")))
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(candidate, null, candidate.getAuthorities()));
        try {
            mockMvc.perform(post("/api/v1/applications")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.jobTitle").value("Senior Fullstack Engineer"))
                    .andExpect(jsonPath("$.data.currentStage").value("APPLIED"));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}

