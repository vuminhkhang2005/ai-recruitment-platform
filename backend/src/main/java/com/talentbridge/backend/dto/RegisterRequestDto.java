package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu đăng ký tài khoản mới")
public class RegisterRequestDto {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng hợp lệ")
    @Schema(description = "Email đăng nhập", example = "candidate.new@gmail.com")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu phải từ 6 ký tự")
    @Schema(description = "Mật khẩu bảo mật", example = "Pass@123456")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn Tuấn")
    private String fullName;

    @Schema(description = "Số điện thoại liên hệ", example = "0912345678")
    private String phone;

    @Schema(description = "Vai trò: ROLE_CANDIDATE hoặc ROLE_RECRUITER", example = "ROLE_CANDIDATE")
    @Builder.Default
    private String role = "ROLE_CANDIDATE";

    @Schema(description = "ID công ty liên kết nếu đăng ký vai trò Recruiter", example = "2")
    private Long companyId;
}
