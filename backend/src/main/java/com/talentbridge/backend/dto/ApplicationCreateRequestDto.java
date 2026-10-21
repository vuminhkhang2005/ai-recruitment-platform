package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for candidate job application")
public class ApplicationCreateRequestDto {

    @NotNull(message = "Job ID cannot be null")
    @Schema(description = "Target Job ID", example = "1")
    private Long jobId;

    @Schema(description = "Cover letter content or AI tailored statement")
    private String coverLetter;

    @Schema(description = "CV or Resume Document ID", example = "1")
    private Long cvId;

    @Schema(description = "Whether candidate opted in to AI CV-vs-JD match analysis", example = "true")
    private Boolean allowAiMatching;

    @Schema(description = "Pre-computed AI CV-vs-JD match score when opted in", example = "86")
    private Integer aiMatchScore;
}
