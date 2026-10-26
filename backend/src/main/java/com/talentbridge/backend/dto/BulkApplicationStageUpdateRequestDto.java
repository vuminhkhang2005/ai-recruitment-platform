package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for bulk updating multiple candidate applications and sending personalized emails")
public class BulkApplicationStageUpdateRequestDto {

    @NotEmpty(message = "Danh sách hồ sơ ứng viên không được để trống")
    @Schema(description = "List of application IDs to transition")
    private List<Long> applicationIds;

    @NotBlank(message = "Trạng thái giai đoạn đích không được để trống")
    @Schema(description = "Target stage ('SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED')", example = "INTERVIEW")
    private String currentStage;

    @Schema(description = "Rejection reason if target stage is REJECTED")
    private String rejectionReason;

    @Schema(description = "Optional stage transition note")
    private String note;

    @Schema(description = "Whether to send email notification to each candidate (default true)")
    private Boolean sendEmail;

    @Schema(description = "Optional custom/template email subject (supports {{candidate_name}}, {{job_title}}, {{company_name}})")
    private String customEmailSubject;

    @Schema(description = "Optional custom/template email body (supports {{candidate_name}}, {{job_title}}, {{company_name}})")
    private String customEmailBody;

    @Schema(description = "Whether to also post the message into each candidate's in-app chat thread")
    private Boolean sendChatMessage;
}
