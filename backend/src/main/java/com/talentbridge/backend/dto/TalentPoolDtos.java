package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class TalentPoolDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateSkillSummaryDto {
        private String name;
        private String proficiency;
        private Integer yearsExperience;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TalentPoolCandidateDto {
        private Long candidateProfileId;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String avatarUrl;
        private String headline;
        private String city;
        private String bio;
        private BigDecimal expectedSalaryMin;
        private BigDecimal expectedSalaryMax;
        private Boolean isOpenToWork;
        @Builder.Default
        private List<CandidateSkillSummaryDto> skills = new ArrayList<>();
        private Integer matchScore;
        private String matchRating;
        @Builder.Default
        private List<String> matchedSkills = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InviteCandidateRequestDto {
        @NotNull(message = "Candidate user ID is required")
        private Long candidateUserId;

        @NotNull(message = "Target job ID is required")
        private Long jobId;

        private String customMessage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InviteCandidateResponseDto {
        private Long candidateUserId;
        private Long jobId;
        private String jobTitle;
        private String candidateName;
        private String status;
        private String message;
    }
}
