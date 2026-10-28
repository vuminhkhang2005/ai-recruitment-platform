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
import java.util.ArrayList;
import java.util.List;

public class CompanyReviewDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewRequestDto {
        @NotNull(message = "Vui lòng chọn số sao (1–5)")
        @Min(value = 1, message = "Số sao tối thiểu là 1")
        @Max(value = 5, message = "Số sao tối đa là 5")
        private Integer rating;

        @NotBlank(message = "Vui lòng nhập tiêu đề đánh giá")
        @Size(min = 5, max = 150, message = "Tiêu đề dài từ 5 đến 150 ký tự")
        private String title;

        @Size(max = 2000, message = "Ưu điểm tối đa 2000 ký tự")
        private String pros;

        @Size(max = 2000, message = "Nhược điểm tối đa 2000 ký tự")
        private String cons;

        @Builder.Default
        private Boolean anonymous = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewDto {
        private Long id;
        private Long companyId;
        private String companyName;
        private Integer rating;
        private String title;
        private String pros;
        private String cons;
        /** APPLIED | INTERVIEWED | HIRED */
        private String experienceLevel;
        private String jobTitle;
        private Boolean anonymous;
        /** Display name: the author's name, or null when anonymous (the UI shows "Anonymous"). */
        private String authorName;
        private String authorAvatarUrl;
        /** True when the review belongs to the current user. */
        private Boolean mine;
        private String status;
        private String moderationNote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        /** Admin moderation view only. */
        private String authorEmail;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewSummaryDto {
        private Long companyId;
        private Double average;
        private Long count;
        /** Index 0 = 5 stars ... index 4 = 1 star. */
        @Builder.Default
        private List<Long> distribution = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewPageDto {
        private ReviewSummaryDto summary;
        @Builder.Default
        private List<ReviewDto> items = new ArrayList<>();
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewEligibilityDto {
        private boolean canReview;
        /** NOT_CANDIDATE | NO_APPLICATION | ALREADY_REVIEWED | OK */
        private String reason;
        private String experienceLevel;
        private ReviewDto myReview;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModerateReviewRequestDto {
        @NotBlank
        private String status;
        @Size(max = 500)
        private String note;
    }
}
