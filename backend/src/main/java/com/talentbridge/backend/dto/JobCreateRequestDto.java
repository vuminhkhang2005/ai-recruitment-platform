package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Request DTO for creating a new job posting")
public class JobCreateRequestDto {

    @NotBlank(message = "Tiêu đề việc làm không được để trống")
    @Schema(description = "Job title", example = "Senior Backend Engineer (Java & Spring Boot)")
    private String title;

    @Schema(description = "Company ID (Tùy chọn nếu nhà tuyển dụng đã thuộc về 1 công ty)", example = "2")
    private Long companyId;

    @NotBlank(message = "Mô tả công việc không được để trống")
    @Schema(description = "Full job description")
    private String description;

    @NotBlank(message = "Yêu cầu ứng viên không được để trống")
    @Schema(description = "Job requirements and qualifications")
    private String requirements;

    @Schema(description = "Benefits & perks")
    private String benefits;

    @Schema(description = "Job employment type", example = "HYBRID")
    private String jobType;

    @Schema(description = "Experience level", example = "SENIOR")
    private String expLevel;

    @Schema(description = "Minimum salary in VND", example = "30000000.00")
    private BigDecimal minSalary;

    @Schema(description = "Maximum salary in VND", example = "50000000.00")
    private BigDecimal maxSalary;

    @Schema(description = "Salary currency", example = "VND")
    @Builder.Default
    private String currency = "VND";

    @Schema(description = "Is salary negotiable", example = "false")
    @Builder.Default
    private Boolean isSalaryNegotiable = false;

    @Schema(description = "Work location city", example = "TP. Hồ Chí Minh")
    @Builder.Default
    private String locationCity = "TP. Hồ Chí Minh";

    @Schema(description = "Work location address", example = "Tòa nhà VNG Campus, Tân Thuận Đông, Quận 7")
    private String locationAddress;

    @Schema(description = "Application deadline")
    private LocalDateTime deadline;

    @Schema(description = "List of required skills", example = "[\"Java\", \"Spring Boot\", \"MySQL\"]")
    private List<String> skills;
}
