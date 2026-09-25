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
@Schema(description = "Request DTO for updating job posting status")
public class JobStatusUpdateRequestDto {

    @NotBlank(message = "Trạng thái không được để trống")
    @Schema(description = "Job status ('PUBLISHED', 'CLOSED', 'DRAFT', 'ARCHIVED')", example = "CLOSED")
    private String status;
}
