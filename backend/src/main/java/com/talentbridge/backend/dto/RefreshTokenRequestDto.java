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
@Schema(description = "Yêu cầu cấp mới Access Token từ Refresh Token (nếu không đính kèm cookie)")
public class RefreshTokenRequestDto {

    @Schema(description = "Refresh token chuỗi đục", example = "8465f36784e9481c9a9d25d48d4ef68a...")
    private String refreshToken;
}
