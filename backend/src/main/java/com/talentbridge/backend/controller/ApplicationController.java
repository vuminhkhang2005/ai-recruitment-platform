package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.ApplicationCreateRequestDto;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.dto.ApplicationStatusUpdateRequestDto;
import com.talentbridge.backend.dto.QuickApplyRequestDto;
import com.talentbridge.backend.dto.QuickApplyResponseDto;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "3. Applications Management", description = "Nộp hồ sơ (Ứng viên), Xem danh sách đơn nộp, Cập nhật trạng thái duyệt (Nhà tuyển dụng)")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/quick-apply")
    @Operation(summary = "Quick Apply for Job (Public/Demo)", description = "Submit a fast application with candidate info and cover letter for a specific job.")
    public ResponseEntity<ApiResponse<QuickApplyResponseDto>> quickApply(
            @Valid @RequestBody QuickApplyRequestDto request
    ) {
        QuickApplyResponseDto response = applicationService.quickApply(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Nộp hồ sơ ứng tuyển thành công", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Submit Application (Candidate)", description = "Candidate submits application with resume and cover letter.")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> apply(
            @Valid @RequestBody ApplicationCreateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        ApplicationResponseDto response = applicationService.apply(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Nộp hồ sơ ứng tuyển thành công", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Get My Submitted Applications (Candidate)", description = "Retrieve list of all applications submitted by currently logged-in candidate.")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        List<ApplicationResponseDto> applications = applicationService.getMyApplications(userId);
        return ResponseEntity.ok(ApiResponse.ok(applications));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Get Application Details", description = "View details of an application. Candidate sees their own, Recruiter sees applications for their job, Admin sees all.")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> getApplicationById(
            @Parameter(description = "Application ID", example = "1")
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        boolean isRecruiter = userPrincipal != null && userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECRUITER"));
        boolean isAdmin = userPrincipal != null && userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        ApplicationResponseDto response = applicationService.getApplicationById(id, userId, isRecruiter, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Get Candidate Applications for Job (Recruiter / Admin)", description = "View all submitted applications for a specific job posting.")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getApplicationsForJob(
            @Parameter(description = "Job ID", example = "1")
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        boolean isAdmin = userPrincipal != null && userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<ApplicationResponseDto> applications = applicationService.getApplicationsForJob(jobId, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(applications));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Update Application Stage (Recruiter / Admin)", description = "Update candidate application status (e.g. REVIEWING, INTERVIEW, OFFERED, REJECTED).")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        boolean isAdmin = userPrincipal != null && userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        ApplicationResponseDto updated = applicationService.updateApplicationStatus(id, request, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái ứng viên thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Withdraw Application (Candidate / Admin)", description = "Candidate withdraws their submitted job application.")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        boolean isAdmin = userPrincipal != null && userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        applicationService.withdrawApplication(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
