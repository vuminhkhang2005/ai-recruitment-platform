package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin tóm tắt người dùng trả về sau xác thực")
public class UserSummaryDto {

    @Schema(description = "ID người dùng", example = "1")
    private Long id;

    @Schema(description = "Public UUID", example = "a38e029d-a854-11f1-b7ae-005056c00001")
    private String uuid;

    @Schema(description = "Email", example = "admin@talentbridge.vn")
    private String email;

    @Schema(description = "Họ và tên", example = "Nguyễn Quản Trị")
    private String fullName;

    @Schema(description = "Số điện thoại", example = "0901234567")
    private String phone;

    @Schema(description = "Avatar URL", example = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d")
    private String avatarUrl;

    @Schema(description = "Trạng thái tài khoản", example = "ACTIVE")
    private String status;

    @Schema(description = "Danh sách vai trò", example = "[\"ROLE_CANDIDATE\"]")
    private List<String> roles;
}
