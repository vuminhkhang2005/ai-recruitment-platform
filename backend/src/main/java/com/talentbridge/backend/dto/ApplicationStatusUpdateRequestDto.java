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
    @Schema(description = "Application stage ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED')", example = "INTERVIEW")
    private String currentStage;

    @Schema(description = "Rejection feedback reason if candidate is rejected", example = "Chưa đáp ứng đủ kinh nghiệm yêu cầu")
    private String rejectionReason;

    @Schema(description = "Optional note for stage transition history", example = "Mời tham gia vòng phỏng vấn chuyên môn")
    private String note;

    @Schema(description = "Whether to send email notification to candidate (default true)", example = "true")
    private Boolean sendEmail;

    @Schema(description = "Optional custom or template email subject (supports {{candidate_name}}, {{job_title}}, {{company_name}})")
    private String customEmailSubject;

    @Schema(description = "Optional custom or template email body (supports {{candidate_name}}, {{job_title}}, {{company_name}})")
    private String customEmailBody;

    @Schema(description = "Whether to also post the message into the application chat thread", example = "true")
    private Boolean sendChatMessage;
}
