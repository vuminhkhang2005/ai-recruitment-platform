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
@Schema(description = "Request DTO for recruiter to update candidate application stage")
public class ApplicationStatusUpdateRequestDto {

    @NotBlank(message = "Trạng thái giai đoạn không được để trống")
    @Schema(description = "Application stage ('APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED')", example = "INTERVIEW")
    private String currentStage;

    @Schema(description = "Rejection feedback reason if candidate is rejected", example = "Chưa đáp ứng đủ kinh nghiệm yêu cầu")
    private String rejectionReason;
}
