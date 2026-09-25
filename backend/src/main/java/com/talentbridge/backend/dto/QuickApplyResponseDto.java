package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO confirming successful application submission")
public class QuickApplyResponseDto {

    @Schema(description = "Unique application tracking UUID", example = "b58e029d-b854-11f1-b7ae-005056c00002")
    private String applicationUuid;

    @Schema(description = "Applied Job Title", example = "Senior Fullstack Engineer (React & Golang)")
    private String jobTitle;

    @Schema(description = "Company Name", example = "VNG Corporation")
    private String companyName;

    @Schema(description = "Status confirmation message", example = "Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.")
    private String message;

    @Schema(description = "Timestamp when application was submitted")
    private LocalDateTime appliedAt;
}
