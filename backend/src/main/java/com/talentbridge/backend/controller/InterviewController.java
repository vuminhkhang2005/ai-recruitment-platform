package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.InterviewDtos;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.InterviewService;
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
@Tag(name = "Interviews & Evaluations", description = "Lên lịch phỏng vấn, cập nhật lịch, gửi phiếu đánh giá rubric")
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping("/api/v1/applications/{applicationId}/interviews")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy danh sách các vòng phỏng vấn của một hồ sơ")
    public ResponseEntity<ApiResponse<List<InterviewDtos.InterviewDto>>> listInterviews(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return ResponseEntity.ok(ApiResponse.ok(
                interviewService.listForApplication(applicationId, userPrincipal.getId(), isAdmin)
        ));
    }

    @PostMapping("/api/v1/applications/{applicationId}/interviews")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Lên lịch phỏng vấn mới cho hồ sơ")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewDto>> scheduleInterview(
            @PathVariable Long applicationId,
            @Valid @RequestBody InterviewDtos.ScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        InterviewDtos.InterviewDto created = interviewService.schedule(applicationId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã lên lịch phỏng vấn thành công", created));
    }

    @PatchMapping("/api/v1/interviews/{interviewId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Cập nhật, dời lịch hoặc huỷ buổi phỏng vấn")
    public ResponseEntity<ApiResponse<InterviewDtos.InterviewDto>> updateInterview(
            @PathVariable Long interviewId,
            @RequestBody InterviewDtos.UpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        InterviewDtos.InterviewDto updated = interviewService.update(interviewId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật lịch phỏng vấn", updated));
    }

    @PostMapping("/api/v1/interviews/{interviewId}/evaluations")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Gửi phiếu đánh giá phỏng vấn (Scorecard)")
    public ResponseEntity<ApiResponse<InterviewDtos.EvaluationDto>> evaluateInterview(
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewDtos.EvaluationRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        InterviewDtos.EvaluationDto evaluation = interviewService.evaluate(interviewId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đã lưu kết quả đánh giá", evaluation));
    }

    @GetMapping("/api/v1/interviews/upcoming")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy lịch phỏng vấn sắp tới của tài khoản hiện tại")
    public ResponseEntity<ApiResponse<List<InterviewDtos.InterviewDto>>> getUpcomingInterviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.upcoming(userPrincipal.getId())));
    }
}
