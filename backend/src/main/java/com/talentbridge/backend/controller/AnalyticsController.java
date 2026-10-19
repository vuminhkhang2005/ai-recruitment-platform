package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.AnalyticsDtos.RecruitmentAnalyticsResponseDto;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/employer/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "10. Recruitment Analytics", description = "Thống kê tuyển dụng, Phễu chuyển đổi ứng viên và Chỉ số hiệu suất tuyển dụng")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get Company Recruitment Analytics (Recruiter / Admin)",
            description = "Trả về biểu đồ phễu tuyển dụng 5 giai đoạn, các chỉ số KPI, phân bổ điểm tương thích ATS và top tin tuyển dụng.")
    public ResponseEntity<ApiResponse<RecruitmentAnalyticsResponseDto>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        boolean isAdmin = userPrincipal != null && userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        RecruitmentAnalyticsResponseDto response = analyticsService.getCompanyAnalytics(userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
