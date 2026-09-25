package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.CompanyCreateRequestDto;
import com.talentbridge.backend.dto.CompanyResponseDto;
import com.talentbridge.backend.dto.CompanyUpdateRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
@Tag(name = "4. Companies Management", description = "CRUD hồ sơ công ty tuyển dụng, Danh sách việc làm theo công ty")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @Operation(summary = "List Top Hiring Companies", description = "Retrieve list of all verified hiring enterprise employers.")
    public ResponseEntity<ApiResponse<List<CompanyResponseDto>>> getAllCompanies() {
        List<CompanyResponseDto> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(ApiResponse.ok(companies));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Company by ID", description = "Retrieve detailed company profile by database ID.")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> getCompanyById(
            @Parameter(description = "Numeric ID of company", example = "1")
            @PathVariable Long id
    ) {
        CompanyResponseDto company = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.ok(company));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get Company by Slug", description = "Retrieve detailed company profile by friendly slug.")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> getCompanyBySlug(
            @Parameter(description = "URL friendly slug of company", example = "vinai-research")
            @PathVariable String slug
    ) {
        CompanyResponseDto company = companyService.getCompanyBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(company));
    }

    @GetMapping("/{id}/jobs")
    @Operation(summary = "Get Company Job Openings", description = "List all active, published job postings from this specific company.")
    public ResponseEntity<ApiResponse<List<JobResponseDto>>> getJobsByCompany(
            @Parameter(description = "Company ID", example = "2")
            @PathVariable Long id
    ) {
        List<JobResponseDto> jobs = companyService.getJobsByCompany(id);
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Create Company (Recruiter / Admin)", description = "Register a new enterprise company profile.")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> createCompany(
            @Valid @RequestBody CompanyCreateRequestDto request
    ) {
        CompanyResponseDto created = companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo hồ sơ công ty thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Update Company Profile (Recruiter / Admin)", description = "Update enterprise company details and branding.")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyUpdateRequestDto request
    ) {
        CompanyResponseDto updated = companyService.updateCompany(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin công ty thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Delete Company (Admin only)", description = "Soft delete an enterprise company.")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
