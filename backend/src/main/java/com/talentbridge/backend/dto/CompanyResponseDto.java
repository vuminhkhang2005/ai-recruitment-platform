package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO representing hiring company profile")
public class CompanyResponseDto {

    @Schema(description = "Internal database ID", example = "1")
    private Long id;

    @Schema(description = "Public UUID identifier", example = "a38ca7ea-a854-11f1-b7ae-005056c00001")
    private String uuid;

    @Schema(description = "Company Name", example = "FPT Software")
    private String name;

    @Schema(description = "Company Slug", example = "fpt-software")
    private String slug;

    @Schema(description = "Logo URL", example = "/logos/fpt.svg")
    private String logoUrl;

    @Schema(description = "Banner Cover URL", example = "/companies/fpt-campus.png")
    private String bannerUrl;

    @Schema(description = "Official Website", example = "https://fptsoftware.com")
    private String website;

    @Schema(description = "Industry domain", example = "Công nghệ phần mềm & Dịch vụ IT")
    private String industry;

    @Schema(description = "Company workforce size", example = "10,000+ nhân viên")
    private String companySize;

    @Schema(description = "Short Description")
    private String description;

    @Schema(description = "Headquarters Address", example = "FPT Tower, 10 Phạm Văn Bạch, Cầu Giấy")
    private String address;

    @Schema(description = "City", example = "Hà Nội")
    private String city;

    @Schema(description = "Verification Status", example = "VERIFIED")
    private String verificationStatus;

    @Schema(description = "Number of active job openings", example = "8")
    private Long openJobsCount;
}
