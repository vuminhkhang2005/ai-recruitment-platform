package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO representing user profile with role details")
public class UserProfileResponseDto {

    @Schema(description = "Internal User ID", example = "1")
    private Long id;

    @Schema(description = "User UUID", example = "u18e029d-a854-11f1-b7ae-005056c00001")
    private String uuid;

    @Schema(description = "Email address", example = "candidate@talentbridge.vn")
    private String email;

    @Schema(description = "Full name", example = "Nguyễn Văn An")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Schema(description = "Avatar Image URL", example = "/avatars/candidate.png")
    private String avatarUrl;

    @Schema(description = "Account Status", example = "ACTIVE")
    private String status;

    @Schema(description = "Assigned Roles", example = "[\"ROLE_CANDIDATE\"]")
    private Set<String> roles;

    // Candidate Profile details
    @Schema(description = "Professional Headline", example = "Senior Fullstack Developer")
    private String headline;

    @Schema(description = "City", example = "TP. Hồ Chí Minh")
    private String city;

    @Schema(description = "Country", example = "Vietnam")
    private String country;

    @Schema(description = "Is open to work", example = "true")
    private Boolean isOpenToWork;

    // Recruiter Profile details
    @Schema(description = "Company ID", example = "2")
    private Long companyId;

    @Schema(description = "Company Name", example = "VNG Corporation")
    private String companyName;

    @Schema(description = "Job Title / Designation", example = "Talent Acquisition Lead")
    private String jobTitle;
}
