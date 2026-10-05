package com.talentbridge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** DTOs for the candidate self-service area (/api/v1/candidates/me). */
public final class CandidateDtos {

    private CandidateDtos() {
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillItem {
        private Long skillId;
        private String name;
        private String proficiency;
        private Integer yearsExperience;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillsUpdateRequest {
        private List<SkillItem> skills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CvItem {
        private Long id;
        private String title;
        private String fileName;
        private Integer fileSizeBytes;
        private Boolean isDefault;
        /** False for legacy seeded rows whose file is not stored on this server. */
        private Boolean downloadable;
        private LocalDateTime createdAt;
    }
}
