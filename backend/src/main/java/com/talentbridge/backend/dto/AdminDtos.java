package com.talentbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlatformOverviewDto {
        private long totalUsers;
        private long activeUsers;
        private long suspendedOrBannedUsers;
        private long totalCandidates;
        private long totalRecruiters;
        private long totalCompanies;
        private long verifiedCompanies;
        private long pendingCompanies;
        private long totalJobs;
        private long publishedJobs;
        private long pendingOrDraftJobs;
        private long totalApplications;
        private long totalInterviews;
        private long totalSkills;
        private double overallHireRate;
        private double averagePlatformMatchScore;
        private List<StageCountDto> applicationsByStage;
        private List<TopCompanyMetricDto> topCompanies;
        private List<TopSkillMetricDto> topSkills;
        private AiSystemMetricsDto aiMetrics;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StageCountDto {
        private String stage;
        private String label;
        private long count;
        private double percentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopCompanyMetricDto {
        private Long companyId;
        private String companyName;
        private String logoUrl;
        private String industry;
        private String verificationStatus;
        private long jobCount;
        private long applicationCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopSkillMetricDto {
        private Long skillId;
        private String skillName;
        private String category;
        private long jobCount;
        private long candidateCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiSystemMetricsDto {
        private String activeModelName;
        private long totalScoredApplications;
        private double averageAtsScore;
        private long highMatchCount;
        private long openToWorkCandidates;
        private int averageLatencyMs;
        private double uptimePercentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminUserDto {
        private Long id;
        private String uuid;
        private String email;
        private String fullName;
        private String phone;
        private String avatarUrl;
        private String status;
        private Boolean isEmailVerified;
        private List<String> roles;
        private String companyName;
        private String candidateHeadline;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserStatusRequestDto {
        @NotBlank(message = "Trạng thái không được để trống")
        private String status;
        private String reason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserRolesRequestDto {
        @NotEmpty(message = "Danh sách vai trò không được để trống")
        private List<String> roles;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminCompanyDto {
        private Long id;
        private String uuid;
        private String name;
        private String slug;
        private String logoUrl;
        private String website;
        private String industry;
        private String companySize;
        private String taxCode;
        private String city;
        private String verificationStatus;
        private long jobCount;
        private long recruiterCount;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyCompanyRequestDto {
        @NotBlank(message = "Trạng thái xác minh không được để trống")
        private String verificationStatus;
        private String note;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminJobDto {
        private Long id;
        private String uuid;
        private String title;
        private String slug;
        private Long companyId;
        private String companyName;
        private String companyLogo;
        private String jobType;
        private String expLevel;
        private String locationCity;
        private BigDecimal minSalary;
        private BigDecimal maxSalary;
        private String currency;
        private String status;
        private Integer viewsCount;
        private Integer applicationsCount;
        private LocalDateTime publishedAt;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModerateJobRequestDto {
        @NotBlank(message = "Trạng thái tin tuyển dụng không được để trống")
        private String status;
        private String reason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminSkillDto {
        private Long id;
        private String name;
        private String slug;
        private String category;
        private String description;
        private Boolean isActive;
        private long jobCount;
        private long candidateCount;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SaveSkillRequestDto {
        @NotBlank(message = "Tên kỹ năng không được để trống")
        private String name;
        @NotBlank(message = "Danh mục kỹ năng không được để trống")
        private String category;
        private String description;
        private Boolean isActive;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuditLogDto {
        private Long id;
        private Long userId;
        private String actorName;
        private String actorEmail;
        private String action;
        private String entityName;
        private String entityId;
        private String oldValues;
        private String newValues;
        private String ipAddress;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmailLogDto {
        private Long id;
        private String toEmail;
        private String subject;
        private String template;
        private String status;
        private String errorMessage;
        private String referenceType;
        private Long referenceId;
        private LocalDateTime createdAt;
    }
}
