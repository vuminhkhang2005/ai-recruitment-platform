package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.dto.*;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "1. Authentication & Security", description = "Đăng ký, Đăng nhập, Quản lý Token HttpOnly Cookie, Bảo vệ CSRF, Đăng xuất, OAuth2 Google & LinkedIn")
public class AuthController {

    private final AuthService authService;
    private final JwtCookieHelper cookieHelper;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới", description = "Đăng ký tài khoản Ứng viên (ROLE_CANDIDATE) hoặc Nhà tuyển dụng (ROLE_RECRUITER). Mật khẩu được băm BCrypt, tự động thiết lập Cookie HttpOnly và trả về JWT Access Token.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Đăng ký thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc email đã tồn tại")
    })
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthResponseDto authResponse = authService.register(request, ipAddress, userAgent);

        ResponseCookie accessCookie = cookieHelper.createAccessTokenCookie(authResponse.getAccessToken());
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(authResponse.getRefreshToken());

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.<AuthResponseDto>builder()
                        .success(true)
                        .message("Đăng ký tài khoản thành công")
                        .data(authResponse)
                        .build());
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Xác thực email & mật khẩu qua BCrypt. Thiết lập HttpOnly Cookie `accessToken` và `refreshToken` với SameSite=Lax chống tấn công CSRF.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email hoặc mật khẩu không chính xác")
    })
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthResponseDto authResponse = authService.login(request, ipAddress, userAgent);

        ResponseCookie accessCookie = cookieHelper.createAccessTokenCookie(authResponse.getAccessToken());
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(authResponse.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.<AuthResponseDto>builder()
                        .success(true)
                        .message("Đăng nhập thành công")
                        .data(authResponse)
                        .build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới Access Token (Refresh Token Rotation)", description = "Cấp mới Access Token từ Refresh Token đọc từ HttpOnly Cookie hoặc Request Body. Tự động thu hồi Refresh Token cũ để bảo mật.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cấp mới token thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Refresh token không hợp lệ hoặc đã hết hạn")
    })
    public ResponseEntity<ApiResponse<AuthResponseDto>> refreshToken(
            @RequestBody(required = false) RefreshTokenRequestDto requestDto,
            HttpServletRequest httpRequest) {

        String rawRefreshToken = cookieHelper.extractRefreshToken(httpRequest);
        if (!StringUtils.hasText(rawRefreshToken) && requestDto != null) {
            rawRefreshToken = requestDto.getRefreshToken();
        }

        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthResponseDto authResponse = authService.refreshToken(rawRefreshToken, ipAddress, userAgent);

        ResponseCookie accessCookie = cookieHelper.createAccessTokenCookie(authResponse.getAccessToken());
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(authResponse.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.<AuthResponseDto>builder()
                        .success(true)
                        .message("Cấp mới Access Token thành công")
                        .data(authResponse)
                        .build());
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất tài khoản", description = "Thu hồi Refresh Token trong cơ sở dữ liệu, hủy sạch HttpOnly Cookies trên trình duyệt.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng xuất thành công")
    })
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest httpRequest) {

        String rawRefreshToken = cookieHelper.extractRefreshToken(httpRequest);
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;

        authService.logout(rawRefreshToken, userId);

        ResponseCookie cleanAccess = cookieHelper.createCleanAccessTokenCookie();
        ResponseCookie cleanRefresh = cookieHelper.createCleanRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanAccess.toString())
                .header(HttpHeaders.SET_COOKIE, cleanRefresh.toString())
                .body(ApiResponse.<Void>builder()
                        .success(true)
                        .message("Đăng xuất thành công")
                        .build());
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng đang đăng nhập", description = "Yêu cầu đăng nhập. Trả về thông tin cá nhân và vai trò hiện tại.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc token không hợp lệ")
    })
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để xem thông tin"));
        }

        UserSummaryDto user = authService.getCurrentUser(userPrincipal);
        return ResponseEntity.ok(ApiResponse.<UserSummaryDto>builder()
                .success(true)
                .message("Lấy thông tin người dùng thành công")
                .data(user)
                .build());
    }

    @PostMapping("/oauth2/{provider}")
    @Operation(summary = "Đăng nhập OAuth2 (Google / LinkedIn)", description = "Xác thực qua nhà cung cấp danh tính Google hoặc LinkedIn, tự động liên kết hoặc tạo tài khoản và thiết lập HttpOnly Cookies.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác thực OAuth2 thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Provider không được hỗ trợ hoặc token không hợp lệ")
    })
    public ResponseEntity<ApiResponse<AuthResponseDto>> loginOAuth2(
            @PathVariable String provider,
            @Valid @RequestBody OAuth2LoginRequestDto request,
            HttpServletRequest httpRequest) {

        request.setProvider(provider.toUpperCase());
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthResponseDto authResponse = authService.loginWithOAuth2(request, ipAddress, userAgent);

        ResponseCookie accessCookie = cookieHelper.createAccessTokenCookie(authResponse.getAccessToken());
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(authResponse.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.<AuthResponseDto>builder()
                        .success(true)
                        .message("Đăng nhập bằng " + provider.toUpperCase() + " thành công")
                        .data(authResponse)
                        .build());
    }
}
