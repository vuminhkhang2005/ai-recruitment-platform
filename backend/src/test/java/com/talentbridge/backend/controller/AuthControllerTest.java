package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.AuthResponseDto;
import com.talentbridge.backend.dto.LoginRequestDto;
import com.talentbridge.backend.dto.RegisterRequestDto;
import com.talentbridge.backend.dto.UserSummaryDto;
import com.talentbridge.backend.security.CustomAccessDeniedHandler;
import com.talentbridge.backend.security.JwtAuthenticationEntryPoint;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserDetailsServiceImpl;
import com.talentbridge.backend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

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
    @DisplayName("POST /api/v1/auth/register - Should return 201 Created and user information")
    void testRegister_Success() throws Exception {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .email("newcandidate@talentbridge.vn")
                .password("Password@123")
                .fullName("Nguyen Van Test")
                .role("CANDIDATE")
                .build();

        AuthResponseDto responseDto = AuthResponseDto.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .tokenType("Bearer")
                .expiresIn(1800L)
                .user(UserSummaryDto.builder()
                        .id(10L)
                        .uuid("u-mock-uuid")
                        .email("newcandidate@talentbridge.vn")
                        .fullName("Nguyen Van Test")
                        .roles(List.of("ROLE_CANDIDATE"))
                        .build())
                .build();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "mock-access-token")
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "mock-refresh-token")
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        when(authService.register(any(RegisterRequestDto.class), any(), any())).thenReturn(responseDto);
        when(jwtCookieHelper.createAccessTokenCookie(eq("mock-access-token"))).thenReturn(accessCookie);
        when(jwtCookieHelper.createRefreshTokenCookie(eq("mock-refresh-token"))).thenReturn(refreshCookie);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("newcandidate@talentbridge.vn"))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 200 OK and set HttpOnly cookies")
    void testLogin_Success() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
                .email("candidate@talentbridge.vn")
                .password("Candidate@123")
                .build();

        AuthResponseDto responseDto = AuthResponseDto.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .tokenType("Bearer")
                .expiresIn(1800L)
                .user(UserSummaryDto.builder()
                        .id(1L)
                        .email("candidate@talentbridge.vn")
                        .fullName("Nguyen Van An")
                        .roles(List.of("ROLE_CANDIDATE"))
                        .build())
                .build();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "mock-access-token")
                .httpOnly(true)
                .path("/")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "mock-refresh-token")
                .httpOnly(true)
                .path("/")
                .build();

        when(authService.login(any(LoginRequestDto.class), any(), any())).thenReturn(responseDto);
        when(jwtCookieHelper.createAccessTokenCookie(eq("mock-access-token"))).thenReturn(accessCookie);
        when(jwtCookieHelper.createRefreshTokenCookie(eq("mock-refresh-token"))).thenReturn(refreshCookie);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("candidate@talentbridge.vn"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout - Should return 200 OK and clear authentication cookies")
    void testLogout_Success() throws Exception {
        ResponseCookie cleanAccess = ResponseCookie.from("accessToken", "").maxAge(0).path("/").build();
        ResponseCookie cleanRefresh = ResponseCookie.from("refreshToken", "").maxAge(0).path("/").build();

        when(jwtCookieHelper.createCleanAccessTokenCookie()).thenReturn(cleanAccess);
        when(jwtCookieHelper.createCleanRefreshTokenCookie()).thenReturn(cleanRefresh);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng xuất thành công"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }
}
