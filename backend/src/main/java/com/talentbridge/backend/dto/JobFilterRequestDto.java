package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO containing filter, search, and pagination parameters")
public class JobFilterRequestDto {

    @Schema(description = "Keyword searching in job title, company name, or description", example = "React")
    private String keyword;

    @Schema(description = "Work location city filter ('All', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Remote')", example = "All")
    private String city;

    @Schema(description = "Experience level filter ('All', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD')", example = "All")
    private String expLevel;

    @Schema(description = "Job type filter ('All', 'FULL_TIME', 'REMOTE', 'HYBRID')", example = "All")
    private String jobType;

    @Schema(description = "Category filter ('All', 'Tech', 'Marketing', 'Finance')", example = "All")
    private String category;

    @Schema(description = "Minimum salary filter in VND", example = "20000000")
    private BigDecimal minSalary;

    @Schema(description = "Maximum salary filter in VND", example = "60000000")
    private BigDecimal maxSalary;

    @Builder.Default
    @Schema(description = "Zero-indexed page number", example = "0", defaultValue = "0")
    private Integer page = 0;

    @Builder.Default
    @Schema(description = "Page size (records per page)", example = "10", defaultValue = "10")
    private Integer size = 10;

    @Builder.Default
    @Schema(description = "Sort criteria ('newest', 'salary', 'views')", example = "newest", defaultValue = "newest")
    private String sortBy = "newest";
}
