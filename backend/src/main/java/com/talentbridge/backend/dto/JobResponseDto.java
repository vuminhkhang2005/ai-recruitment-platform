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
@Schema(description = "Response DTO representing job details and listing card")
public class JobResponseDto {

    @Schema(description = "Internal database ID", example = "1")
    private Long id;

    @Schema(description = "Public UUID identifier", example = "a38e029d-a854-11f1-b7ae-005056c00001")
    private String uuid;

    @Schema(description = "Job title", example = "Senior Fullstack Engineer (React & Golang)")
    private String title;

    @Schema(description = "URL friendly slug", example = "senior-fullstack-engineer-react-golang")
    private String slug;

    @Schema(description = "Company ID", example = "2")
    private Long companyId;

    @Schema(description = "Company Name", example = "VNG Corporation")
    private String companyName;

    @Schema(description = "Company Logo URL", example = "/logos/vng.svg")
    private String companyLogo;

    @Schema(description = "Company City", example = "TP. Hồ Chí Minh")
    private String companyCity;

    @Schema(description = "Work Location City", example = "TP. Hồ Chí Minh")
    private String locationCity;

    @Schema(description = "Work Location Detail Address", example = "Z06 Đường số 13, Tân Thuận Đông, Quận 7")
    private String locationAddress;

    @Schema(description = "Employment Type", example = "HYBRID")
    private String jobType;

    @Schema(description = "Experience Level", example = "SENIOR")
    private String expLevel;

    @Schema(description = "Minimum Salary", example = "35000000.00")
    private BigDecimal minSalary;

    @Schema(description = "Maximum Salary", example = "55000000.00")
    private BigDecimal maxSalary;

    @Schema(description = "Currency", example = "VND")
    private String currency;

    @Schema(description = "Pre-formatted localized salary string", example = "35 - 55 Triệu VNĐ")
    private String salaryFormatted;

    @Schema(description = "Job Description (Markdown / HTML)")
    private String description;

    @Schema(description = "Candidate Requirements")
    private String requirements;

    @Schema(description = "Employee Benefits & Compensation")
    private String benefits;

    @Schema(description = "Listing Status", example = "PUBLISHED")
    private String status;

    @Schema(description = "Application Deadline")
    private LocalDateTime deadline;

    @Schema(description = "Number of views", example = "124")
    private Integer viewsCount;

    @Schema(description = "Number of submitted applications", example = "34")
    private Integer applicationsCount;

    @Schema(description = "Required tech stack & skills", example = "[\"React\", \"Golang\", \"Redis\", \"Docker\"]")
    private List<String> skills;

    @Schema(description = "Relative posted time string", example = "2 giờ trước")
    private String postedTimeAgo;

    @Schema(description = "Simulated or computed AI match percentage", example = "96")
    private Integer aiMatchScore;

    @Schema(description = "Whether the position is marked as urgent", example = "true")
    private Boolean urgent;

    @Schema(description = "Bonus description", example = "Thưởng tháng 13-15")
    private String bonus;
}
