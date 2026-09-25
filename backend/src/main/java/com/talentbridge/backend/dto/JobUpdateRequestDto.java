package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating an existing job posting")
public class JobUpdateRequestDto {

    @Schema(description = "Job title", example = "Senior Backend Engineer (Java & Spring Boot)")
    private String title;

    @Schema(description = "Full job description")
    private String description;

    @Schema(description = "Job requirements and qualifications")
    private String requirements;

    @Schema(description = "Benefits & perks")
    private String benefits;

    @Schema(description = "Job employment type", example = "HYBRID")
    private String jobType;

    @Schema(description = "Experience level", example = "SENIOR")
    private String expLevel;

    @Schema(description = "Minimum salary in VND", example = "35000000.00")
    private BigDecimal minSalary;

    @Schema(description = "Maximum salary in VND", example = "55000000.00")
    private BigDecimal maxSalary;

    @Schema(description = "Salary currency", example = "VND")
    private String currency;

    @Schema(description = "Is salary negotiable", example = "false")
    private Boolean isSalaryNegotiable;

    @Schema(description = "Work location city", example = "TP. Hồ Chí Minh")
    private String locationCity;

    @Schema(description = "Work location address", example = "Tòa nhà VNG Campus, Tân Thuận Đông, Quận 7")
    private String locationAddress;

    @Schema(description = "Job status", example = "PUBLISHED")
    private String status;

    @Schema(description = "Application deadline")
    private LocalDateTime deadline;

    @Schema(description = "List of required skills", example = "[\"Java\", \"Spring Boot\", \"MySQL\"]")
    private List<String> skills;
}
