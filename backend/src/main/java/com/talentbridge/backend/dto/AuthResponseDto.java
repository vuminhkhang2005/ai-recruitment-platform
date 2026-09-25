package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Kết quả phản hồi sau khi xác thực thành công")
public class AuthResponseDto {

    @Schema(description = "JWT Access Token dùng để đính kèm Authorization Header nếu không dùng Cookie", example = "eyJhbGciOiJIUzUxMiJ9...")
    private String accessToken;

    @Schema(description = "Refresh Token dạng chuỗi đục (opaque string)", example = "8465f36784e9481c9a9d25d48d4ef68a...")
    private String refreshToken;

    @Schema(description = "Loại token", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @Schema(description = "Thời gian hiệu lực của Access Token tính bằng giây", example = "1800")
    private Long expiresIn;

    @Schema(description = "Thông tin người dùng đăng nhập")
    private UserSummaryDto user;
}
