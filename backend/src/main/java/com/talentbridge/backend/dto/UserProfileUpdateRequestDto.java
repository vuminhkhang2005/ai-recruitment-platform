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
@Schema(description = "Request DTO for updating user profile")
public class UserProfileUpdateRequestDto {

    @Schema(description = "Full name", example = "Nguyễn Văn An")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Schema(description = "Avatar Image URL", example = "/avatars/candidate.png")
    private String avatarUrl;

    @Schema(description = "Professional Headline", example = "Senior Fullstack Developer")
    private String headline;

    @Schema(description = "City", example = "TP. Hồ Chí Minh")
    private String city;

    @Schema(description = "Country", example = "Vietnam")
    private String country;

    @Schema(description = "Is open to work", example = "true")
    private Boolean isOpenToWork;

    @Schema(description = "Job Title for Recruiter", example = "Talent Acquisition Lead")
    private String jobTitle;
}
