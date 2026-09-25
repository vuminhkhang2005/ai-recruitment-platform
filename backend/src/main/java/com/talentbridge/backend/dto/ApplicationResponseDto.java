package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO representing job application details")
public class ApplicationResponseDto {

    @Schema(description = "Application ID", example = "1")
    private Long id;

    @Schema(description = "Unique application tracking UUID", example = "b58e029d-b854-11f1-b7ae-005056c00002")
    private String uuid;

    @Schema(description = "Target Job ID", example = "1")
    private Long jobId;

    @Schema(description = "Job Title", example = "Senior Fullstack Engineer (React & Golang)")
    private String jobTitle;

    @Schema(description = "Company Name", example = "VNG Corporation")
    private String companyName;

    @Schema(description = "Company Logo URL", example = "/logos/vng.svg")
    private String companyLogo;

    @Schema(description = "Candidate Profile ID", example = "1")
    private Long candidateProfileId;

    @Schema(description = "Candidate Name", example = "Vũ Minh Khang")
    private String candidateName;

    @Schema(description = "Candidate Email", example = "khang.vu@example.com")
    private String candidateEmail;

    @Schema(description = "Candidate Phone", example = "0987654321")
    private String candidatePhone;

    @Schema(description = "Cover Letter")
    private String coverLetter;

    @Schema(description = "Current Stage ('APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED')", example = "APPLIED")
    private String currentStage;

    @Schema(description = "AI Match score percentage", example = "95.00")
    private BigDecimal matchScore;

    @Schema(description = "Rejection Reason if any")
    private String rejectionReason;

    @Schema(description = "Applied timestamp")
    private LocalDateTime appliedAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
