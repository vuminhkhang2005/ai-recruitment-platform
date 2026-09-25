package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.JobCreateRequestDto;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.dto.JobStatusUpdateRequestDto;
import com.talentbridge.backend.dto.JobUpdateRequestDto;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.JobService;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "2. Jobs Management", description = "Toàn diện CRUD việc làm, Lọc đa tiêu chí, Phân trang, Phân quyền Recruiter/Admin")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(summary = "Search & Filter Jobs", description = "Query job postings with multi-criteria filters including keyword, city, experience level, salary range, and pagination.")
    public ResponseEntity<ApiResponse<PageResponse<JobResponseDto>>> searchJobs(
            @Parameter(description = "Keyword searching in job title, company name, or description")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Work location city ('All', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Remote')")
            @RequestParam(required = false, defaultValue = "All") String city,
            @Parameter(description = "Experience level ('All', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD')")
            @RequestParam(required = false, defaultValue = "All") String expLevel,
            @Parameter(description = "Job type ('All', 'FULL_TIME', 'REMOTE', 'HYBRID')")
            @RequestParam(required = false, defaultValue = "All") String jobType,
            @Parameter(description = "Category filter ('All', 'Tech', 'Marketing', 'Finance')")
            @RequestParam(required = false, defaultValue = "All") String category,
            @Parameter(description = "Minimum salary in VND")
            @RequestParam(required = false) BigDecimal minSalary,
            @Parameter(description = "Maximum salary in VND")
            @RequestParam(required = false) BigDecimal maxSalary,
            @Parameter(description = "Zero-indexed page number")
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @Parameter(description = "Number of items per page")
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @Parameter(description = "Sort order ('newest', 'salary', 'views')")
            @RequestParam(required = false, defaultValue = "newest") String sortBy
    ) {
        JobFilterRequestDto filter = JobFilterRequestDto.builder()
                .keyword(keyword)
                .city(city)
                .expLevel(expLevel)
                .jobType(jobType)
                .category(category)
                .minSalary(minSalary)
                .maxSalary(maxSalary)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .build();

        PageResponse<JobResponseDto> result = jobService.searchJobs(filter);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Job Details by ID", description = "Retrieve complete job specifications, company info, and requirements by database ID.")
    public ResponseEntity<ApiResponse<JobResponseDto>> getJobById(
            @Parameter(description = "Numeric ID of the job", example = "1")
            @PathVariable Long id
    ) {
        JobResponseDto job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.ok(job));
    }

    @GetMapping("/uuid/{uuid}")
    @Operation(summary = "Get Job Details by UUID", description = "Retrieve job details using public external UUID to avoid IDOR vulnerability.")
    public ResponseEntity<ApiResponse<JobResponseDto>> getJobByUuid(
            @Parameter(description = "Public UUID identifier", example = "a38e029d-a854-11f1-b7ae-005056c00001")
            @PathVariable String uuid
    ) {
        JobResponseDto job = jobService.getJobByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.ok(job));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get Featured Recommended Jobs", description = "Get top 6 curated high-match jobs for homepage showcase.")
    public ResponseEntity<ApiResponse<List<JobResponseDto>>> getFeaturedJobs() {
        List<JobResponseDto> featured = jobService.getFeaturedJobs();
        return ResponseEntity.ok(ApiResponse.ok(featured));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Create Job Posting (Recruiter / Admin)", description = "Post a brand new job opening. Only accessible by authorized RECRUITER or ADMIN accounts.")
    public ResponseEntity<ApiResponse<JobResponseDto>> createJob(
            @Valid @RequestBody JobCreateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        JobResponseDto created = jobService.createJob(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng tin tuyển dụng thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Update Job Posting (Recruiter / Admin)", description = "Modify an existing job posting. Recruiters can only modify their own posts; Admins can edit any.")
    public ResponseEntity<ApiResponse<JobResponseDto>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobUpdateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        JobResponseDto updated = jobService.updateJob(id, request, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tin tuyển dụng thành công", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Change Job Status (Recruiter / Admin)", description = "Update the operational state of a job (e.g. PUBLISHED, CLOSED, DRAFT).")
    public ResponseEntity<ApiResponse<JobResponseDto>> updateJobStatus(
            @PathVariable Long id,
            @Valid @RequestBody JobStatusUpdateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        JobResponseDto updated = jobService.updateJobStatus(id, request.getStatus(), userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Close / Archive Job (Recruiter / Admin)", description = "Soft delete / close a job posting.")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        jobService.deleteJob(id, userPrincipal.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
