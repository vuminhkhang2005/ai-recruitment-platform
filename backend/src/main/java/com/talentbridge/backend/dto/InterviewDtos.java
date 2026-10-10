package com.talentbridge.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** Interview scheduling + rubric scorecards. */
public final class InterviewDtos {

    private InterviewDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleRequest {
        @NotNull(message = "Vui lòng chọn thời gian bắt đầu")
        private LocalDateTime scheduledStart;
        @NotNull(message = "Vui lòng chọn thời gian kết thúc")
        private LocalDateTime scheduledEnd;
        /** ONLINE or OFFLINE */
        @NotBlank(message = "Vui lòng chọn hình thức phỏng vấn")
        private String format;
        @Size(max = 500, message = "Link họp / địa điểm tối đa 500 ký tự")
        private String location;
        @Size(max = 3000, message = "Ghi chú tối đa 3000 ký tự")
        private String notesToCandidate;
        private List<Long> panelistUserIds;
    }

    /** Partial update: reschedule (times/location), change panel, or set status COMPLETED / CANCELLED. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private LocalDateTime scheduledStart;
        private LocalDateTime scheduledEnd;
        private String format;
        @Size(max = 500)
        private String location;
        @Size(max = 3000)
        private String notesToCandidate;
        private List<Long> panelistUserIds;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluationRequest {
        @NotNull @Min(value = 1, message = "Điểm từ 1 đến 5") @Max(value = 5, message = "Điểm từ 1 đến 5")
        private Integer technicalScore;
        @NotNull @Min(value = 1, message = "Điểm từ 1 đến 5") @Max(value = 5, message = "Điểm từ 1 đến 5")
        private Integer communicationScore;
        @NotNull @Min(value = 1, message = "Điểm từ 1 đến 5") @Max(value = 5, message = "Điểm từ 1 đến 5")
        private Integer problemSolvingScore;
        @NotNull @Min(value = 1, message = "Điểm từ 1 đến 5") @Max(value = 5, message = "Điểm từ 1 đến 5")
        private Integer cultureFitScore;
        @NotBlank(message = "Vui lòng chọn đề xuất tuyển dụng")
        private String recommendation;
        @Size(max = 3000, message = "Nhận xét tối đa 3000 ký tự")
        private String feedbackNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PanelistDto {
        private Long userId;
        private String fullName;
        private String jobTitle;
        private boolean evaluated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluationDto {
        private Long id;
        private Long interviewId;
        private Long interviewerUserId;
        private String interviewerName;
        private Integer technicalScore;
        private Integer communicationScore;
        private Integer problemSolvingScore;
        private Integer cultureFitScore;
        private Double averageScore;
        private String recommendation;
        private String feedbackNotes;
        private LocalDateTime submittedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewDto {
        private Long id;
        private String uuid;
        private Long applicationId;
        private Integer roundNumber;
        private LocalDateTime scheduledStart;
        private LocalDateTime scheduledEnd;
        private String format;
        private String location;
        private String status;
        private String notesToCandidate;
        // context
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private String companyLogo;
        private String candidateName;
        // hiring-team only (null for candidates)
        private List<PanelistDto> panelists;
        private List<EvaluationDto> evaluations;
        private Double averageScore;
        private Boolean canEvaluate;
        private Boolean evaluatedByMe;
    }
}
