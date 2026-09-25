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
@Schema(description = "Request DTO for registering a company profile")
public class CompanyCreateRequestDto {

    @NotBlank(message = "Tên công ty không được để trống")
    @Schema(description = "Company Name", example = "VinAI Research")
    private String name;

    @Schema(description = "Logo URL", example = "/logos/vinai.svg")
    private String logoUrl;

    @Schema(description = "Banner image URL", example = "/banners/vinai-banner.jpg")
    private String bannerUrl;

    @Schema(description = "Official Website", example = "https://vinai.io")
    private String website;

    @Schema(description = "Industry domain", example = "Trí tuệ nhân tạo (AI)")
    private String industry;

    @Schema(description = "Company employee size", example = "500-1000 nhân viên")
    private String companySize;

    @Schema(description = "Tax code", example = "0108923456")
    private String taxCode;

    @Schema(description = "Company description")
    private String description;

    @Schema(description = "Office address", example = "Tòa nhà Symphony, Chu Huy Mân, Long Biên")
    private String address;

    @Schema(description = "City", example = "Hà Nội")
    private String city;
}
