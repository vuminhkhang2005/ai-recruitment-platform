package com.talentbridge.backend.controller;

import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

/**
 * CSV exports for recruiters (applicants, recruitment report) and administrators (users, companies, jobs).
 * Files are UTF-8 with BOM so they open correctly in Microsoft Excel.
 */
@RestController
@RequestMapping("/api/v1/exports")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "13. Exports", description = "Xuất báo cáo CSV cho Nhà tuyển dụng và Quản trị viên")
public class ExportController {

    private static final MediaType TEXT_CSV = new MediaType("text", "csv", StandardCharsets.UTF_8);

    private final ExportService exportService;

    private static boolean isAdmin(UserPrincipal p) {
        return p != null && p.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private static ResponseEntity<byte[]> csv(String baseName, byte[] body) {
        String fileName = "talentbridge_" + baseName + "_" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .contentType(TEXT_CSV)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fileName, StandardCharsets.UTF_8).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
    }

    @GetMapping("/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Export applicants to CSV (Recruiter / Admin)",
            description = "With jobId: applicants of that job. Without jobId (recruiter only): applicants of all jobs of the recruiter's company.")
    public ResponseEntity<byte[]> exportApplications(
            @RequestParam(required = false) Long jobId,
            @RequestParam(defaultValue = "vi") String lang,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean admin = isAdmin(principal);
        if (jobId == null && admin) {
            throw new BadRequestException("Quản trị viên cần chọn một tin tuyển dụng (jobId) để xuất danh sách ứng viên.");
        }
        byte[] body = exportService.exportApplications(jobId, principal.getId(), admin, lang);
        return csv(jobId != null ? "applicants_job-" + jobId : "applicants_all", body);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Export recruitment report (KPIs, funnel, quality, top jobs, weekly trend) to CSV")
    public ResponseEntity<byte[]> exportAnalytics(
            @RequestParam(defaultValue = "vi") String lang,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return csv("recruitment_report", exportService.exportAnalytics(principal.getId(), isAdmin(principal), lang));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export users to CSV (Admin) — same filters as GET /admin/users")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "vi") String lang
    ) {
        return csv("users", exportService.exportUsers(keyword, role, status, lang));
    }

    @GetMapping("/admin/companies")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export companies to CSV (Admin) — same filters as GET /admin/companies")
    public ResponseEntity<byte[]> exportCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(defaultValue = "vi") String lang
    ) {
        return csv("companies", exportService.exportCompanies(keyword, verificationStatus, lang));
    }

    @GetMapping("/admin/jobs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export jobs to CSV (Admin) — same filters as GET /admin/jobs")
    public ResponseEntity<byte[]> exportJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "vi") String lang
    ) {
        return csv("jobs", exportService.exportJobs(keyword, status, companyId, lang));
    }
}
