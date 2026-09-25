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
@Schema(description = "Response DTO representing career categories")
public class CategoryResponseDto {

    @Schema(description = "Category Identifier", example = "tech")
    private String id;

    @Schema(description = "Vietnamese Name", example = "Công nghệ thông tin")
    private String nameVi;

    @Schema(description = "English Name", example = "Information Technology")
    private String nameEn;

    @Schema(description = "Icon Identifier", example = "code")
    private String icon;

    @Schema(description = "Active job count", example = "15")
    private Long jobCount;
}
