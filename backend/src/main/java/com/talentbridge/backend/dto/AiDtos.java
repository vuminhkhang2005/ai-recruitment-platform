package com.talentbridge.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

public class AiDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParseCvTextRequest {
        @Schema(description = "Nội dung CV dạng văn bản thô", example = "Nguyễn Văn A\nSenior Java Developer\nEmail: a@example.com...")
        private String text;

        @Schema(description = "ID của file CV đã tải lên trong hệ thống (tùy chọn)")
        private Long cvId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExtractedSkillItem {
        private String name;
        private String proficiency; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
        private Integer yearsExperience;
        private Double confidenceScore;
        private Boolean isCore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExtractedExperienceItem {
        private String role;
        private String company;
        private String period;
        private String location;
        @Builder.Default
        private List<String> highlights = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExtractedEducationItem {
        private String school;
        private String degree;
        private String year;
        private String details;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiResumeParseResultDto {
        private String fullName;
        private String email;
        private String phone;
        private String city;
        private String headline;
        private String summary;
        @Builder.Default
        private List<ExtractedSkillItem> skills = new ArrayList<>();
        @Builder.Default
        private List<ExtractedExperienceItem> experiences = new ArrayList<>();
        @Builder.Default
        private List<ExtractedEducationItem> educations = new ArrayList<>();
        @Builder.Default
        private List<String> suggestedJobRoles = new ArrayList<>();
        private Integer overallQualityScore; // 0-100
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SyncSkillsRequest {
        @NotNull
        private List<CandidateDtos.SkillItem> skills;
        @Builder.Default
        private Boolean replaceExisting = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoverLetterGenerateRequest {
        @NotNull
        private Long jobId;

        @Schema(description = "Tone giọng viết: PROFESSIONAL, CONFIDENT, ENTHUSIASTIC, CONCISE", example = "PROFESSIONAL")
        @Builder.Default
        private String tone = "PROFESSIONAL";

        @Schema(description = "Điểm mạnh hoặc ghi chú riêng của ứng viên muốn đưa vào thư")
        private String candidateHighlights;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoverLetterResponseDto {
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private String tone;
        private String subject;
        private String coverLetter;
        @Builder.Default
        private List<String> highlightedSkills = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtsSkillBreakdownItem {
        private String name;
        private Integer requiredYears;
        private Integer candidateYears;
        private Boolean isMatched;
        private Boolean isRequired;
        private String recommendation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JdCriterionComparisonItem {
        private String criterion;
        private String cvValue;
        private String jdValue;
        private String status; // MATCH, PARTIAL, GAP
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtsMatchAnalysisResponseDto {
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private Long analyzedCvId;
        private String analyzedCvName;
        private Integer matchScore; // 0 - 100
        private Integer skillMatchScore; // 0 - 100
        private Integer experienceMatchScore; // 0 - 100
        private Integer keywordMatchScore; // 0 - 100
        private String modelName;
        private String modelVersion;
        private Double semanticSimilarity;
        private Double inferenceTimeMs;
        private String matchRating; // XUẤT SẮC, PHÙ HỢP, TIỀM NĂNG, CẦN BỔ SUNG
        private String ratingColor; // emerald, sky, amber, rose
        @Builder.Default
        private List<AtsSkillBreakdownItem> matchedSkills = new ArrayList<>();
        @Builder.Default
        private List<AtsSkillBreakdownItem> missingSkills = new ArrayList<>();
        @Builder.Default
        private List<JdCriterionComparisonItem> jdCriteriaComparison = new ArrayList<>();
        @Builder.Default
        private List<String> keyStrengths = new ArrayList<>();
        @Builder.Default
        private List<String> preparationTips = new ArrayList<>();
        private String summaryComment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedJobDto {
        private JobResponseDto job;
        private Integer matchScore;
        private Integer skillMatchScore;
        private Integer experienceMatchScore;
        private Integer domainMatchScore;
        private String matchRating;
        private String ratingColor;
        private Boolean levelMatched;
        private Boolean locationMatched;
        /** SAME_CITY | REMOTE | UNKNOWN | OTHER_CITY */
        private String locationStatus;
        private String candidateCity;
        private Boolean alreadyApplied;
        private Long analyzedCvId;
        private String analyzedCvName;
        @Builder.Default
        private List<String> matchedSkills = new ArrayList<>();
        @Builder.Default
        private List<String> missingSkills = new ArrayList<>();
        @Builder.Default
        private List<String> matchReasons = new ArrayList<>();
        private String recommendationReason;
        private String improvementTip;
    }
}
