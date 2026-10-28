package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.CompanyReviewDtos.*;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.CompanyReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "14. Company Reviews", description = "Đánh giá công ty của ứng viên (đã ứng tuyển) & kiểm duyệt bởi Quản trị viên")
public class CompanyReviewController {

    private final CompanyReviewService reviewService;

    @GetMapping("/api/v1/companies/{companyId}/reviews")
    @Operation(summary = "Public: published reviews of a company + rating summary",
            description = "sort = newest | highest | lowest. Anonymous reviews never expose the author.")
    public ResponseEntity<ApiResponse<ReviewPageDto>> list(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long uid = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(reviewService.listPublished(companyId, sort, page, size, uid)));
    }

    @GetMapping("/api/v1/companies/{companyId}/reviews/summary")
    @Operation(summary = "Public: rating summary (average, count, 5→1 star distribution)")
    public ResponseEntity<ApiResponse<ReviewSummaryDto>> summary(@PathVariable Long companyId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.summary(companyId)));
    }

    @GetMapping("/api/v1/companies/{companyId}/reviews/eligibility")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate: can I review this company? (must have applied; one review per company)")
    public ResponseEntity<ApiResponse<ReviewEligibilityDto>> eligibility(
            @PathVariable Long companyId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.eligibility(companyId, principal.getId())));
    }

    @PostMapping("/api/v1/companies/{companyId}/reviews")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate: write a review for a company you applied to")
    public ResponseEntity<ApiResponse<ReviewDto>> create(
            @PathVariable Long companyId,
            @Valid @RequestBody ReviewRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ReviewDto created = reviewService.create(companyId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Cảm ơn bạn đã chia sẻ đánh giá!", created));
    }

    @PutMapping("/api/v1/companies/{companyId}/reviews/mine")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate: edit my review")
    public ResponseEntity<ApiResponse<ReviewDto>> updateMine(
            @PathVariable Long companyId,
            @Valid @RequestBody ReviewRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật đánh giá", reviewService.updateMine(companyId, principal.getId(), request)));
    }

    @DeleteMapping("/api/v1/companies/{companyId}/reviews/mine")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Candidate: delete my review")
    public ResponseEntity<ApiResponse<Void>> deleteMine(
            @PathVariable Long companyId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        reviewService.deleteMine(companyId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá đánh giá", null));
    }

    @GetMapping("/api/v1/admin/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: list reviews for moderation (status = ALL | PUBLISHED | HIDDEN, keyword)")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> listForModeration(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.listForModeration(status, keyword)));
    }

    @PatchMapping("/api/v1/admin/reviews/{reviewId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: hide (with reason) or re-publish a review — recorded in the audit log")
    public ResponseEntity<ApiResponse<ReviewDto>> moderate(
            @PathVariable Long reviewId,
            @Valid @RequestBody ModerateReviewRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật trạng thái đánh giá",
                reviewService.moderate(reviewId, principal.getId(), request)));
    }
}
