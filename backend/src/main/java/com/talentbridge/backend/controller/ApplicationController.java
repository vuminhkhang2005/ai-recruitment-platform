package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.ApplicationCreateRequestDto;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.dto.ApplicationStatusUpdateRequestDto;
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
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "3. Applications Management", description = "Nộp hồ sơ (Ứng viên), Xem danh sách đơn nộp, Cập nhật trạng thái duyệt (Nhà tuyển dụng)")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit Application (Candidate)", description = "Candidate applies with one of their uploaded CVs (default CV if cvId is omitted).")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> apply(
            @Valid @RequestBody ApplicationCreateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ApplicationResponseDto response = applicationService.apply(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Nộp hồ sơ ứng tuyển thành công", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get My Submitted Applications (Candidate)")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getMyApplications(userPrincipal.getId())));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "All applications for my jobs (Recruiter)")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getRecruiterApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationsForRecruiter(userPrincipal.getId())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Application Details", description = "Candidate sees their own, Recruiter sees applications for their job, Admin sees all.")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> getApplicationById(
            @Parameter(description = "Application ID", example = "1")
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ApplicationResponseDto response = applicationService.getApplicationById(
                id, userPrincipal.getId(), hasRole(userPrincipal, "ROLE_RECRUITER"), hasRole(userPrincipal, "ROLE_ADMIN"));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get Candidate Applications for Job (Recruiter / Admin)")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getApplicationsForJob(
            @Parameter(description = "Job ID", example = "1")
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<ApplicationResponseDto> applications = applicationService.getApplicationsForJob(
                jobId, userPrincipal.getId(), hasRole(userPrincipal, "ROLE_ADMIN"));
        return ResponseEntity.ok(ApiResponse.ok(applications));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update Application Stage (Recruiter / Admin)", description = "APPLIED, SCREENING, INTERVIEW, OFFERED, HIRED, REJECTED")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ApplicationResponseDto updated = applicationService.updateApplicationStatus(
                id, request, userPrincipal.getId(), hasRole(userPrincipal, "ROLE_ADMIN"));
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái ứng viên thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    @Operation(summary = "Withdraw Application (Candidate / Admin)")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        applicationService.withdrawApplication(id, userPrincipal.getId(), hasRole(userPrincipal, "ROLE_ADMIN"));
        return ResponseEntity.noContent().build();
    }

    private static boolean hasRole(UserPrincipal user, String role) {
        return user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }
}
