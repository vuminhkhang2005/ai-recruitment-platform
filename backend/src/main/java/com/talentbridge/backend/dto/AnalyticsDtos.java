package com.talentbridge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FunnelMetricsDto {
        private int appliedCount;
        private int screeningCount;
        private int interviewCount;
        private int offeredCount;
        private int hiredCount;
        private int rejectedCount;

        // Stage conversion rates (%)
        private double screeningRate;   // screening / applied
        private double interviewRate;   // interview / screening
        private double offerRate;       // offered / interview
        private double hireRate;        // hired / offered
        private double overallHireRate; // hired / applied
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiMetricsDto {
        private int totalJobs;
        private int activeJobs;
        private int totalApplications;
        private int freshApplications;
        private int scheduledInterviews;
        private double avgDaysToReview;
        private double avgDaysToHire;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QualityDistributionDto {
        private int highMatchCount;    // >= 75%
        private int mediumMatchCount;  // 50% - 74%
        private int lowMatchCount;     // < 50%
        private double highMatchPct;
        private double mediumMatchPct;
        private double lowMatchPct;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopJobMetricDto {
        private Long jobId;
        private String jobTitle;
        private String status;
        private int viewsCount;
        private int applicationsCount;
        private int interviewCount;
        private int hiredCount;
        private Double avgMatchScore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelinePointDto {
        private String periodLabel; // e.g., "Tuần 1", "Tuần 2", "Tuần 3", "Tuần này"
        private int applicationsCount;
        private int interviewsCount;
        private int hiresCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruitmentAnalyticsResponseDto {
        private Long companyId;
        private String companyName;
        private KpiMetricsDto kpis;
        private FunnelMetricsDto funnel;
        private QualityDistributionDto quality;
        @Builder.Default
        private List<TopJobMetricDto> topJobs = new ArrayList<>();
        @Builder.Default
        private List<TimelinePointDto> weeklyTrend = new ArrayList<>();
    }
}
