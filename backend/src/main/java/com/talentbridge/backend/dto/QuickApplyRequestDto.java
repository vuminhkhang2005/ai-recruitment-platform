package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for quick job application submission")
public class QuickApplyRequestDto {

    @NotNull(message = "Job ID cannot be null")
    @Schema(description = "Target Job ID", example = "1")
    private Long jobId;

    @NotBlank(message = "Candidate full name is required")
    @Schema(description = "Full name of candidate", example = "Vũ Minh Khang")
    private String fullName;

    @NotBlank(message = "Candidate email is required")
    @Email(message = "Email format is invalid")
    @Schema(description = "Contact Email", example = "khang.vu@example.com")
    private String email;

    @Schema(description = "Phone number", example = "0987654321")
    private String phone;

    @Schema(description = "AI-generated or custom cover letter content")
    private String coverLetter;
}
