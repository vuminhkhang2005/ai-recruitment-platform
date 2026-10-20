package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu đăng nhập hoặc liên kết bằng OAuth2 (Google / LinkedIn)")
public class OAuth2LoginRequestDto {

    @NotBlank(message = "Nhà cung cấp OAuth2 không được để trống (GOOGLE hoặc LINKEDIN)")
    @Schema(description = "Nhà cung cấp OAuth2: GOOGLE hoặc LINKEDIN", example = "GOOGLE")
    private String provider;

    @Schema(description = "Google ID Token hoặc OAuth2 Access Token nhận từ Frontend", example = "eyJhbGciOiJSUzI1NiIs...")
    private String token;

    @Schema(description = "OAuth2 Authorization Code (nếu dùng Authorization Code flow)", example = "4/0AeanS0b...")
    private String authCode;

    @Schema(description = "Redirect URI dùng trong Authorization Code flow", example = "http://localhost:5173/login")
    private String redirectUri;

    @Schema(description = "Vai trò khi đăng ký lần đầu qua OAuth2 (ROLE_CANDIDATE hoặc ROLE_RECRUITER)", example = "ROLE_CANDIDATE")
    private String role;

    @Schema(description = "Email từ OAuth2 Account Chooser (Sandbox/Dev mode)", example = "candidate.google@gmail.com")
    private String email;

    @Schema(description = "Họ tên từ OAuth2 Account Chooser (Sandbox/Dev mode)", example = "Vũ Minh Khang")
    private String fullName;

    @Schema(description = "Avatar URL", example = "https://lh3.googleusercontent.com/a/default-user")
    private String avatarUrl;
}
