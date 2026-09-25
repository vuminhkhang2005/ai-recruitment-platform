package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.dto.CompanyResponseDto;
import com.talentbridge.backend.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
@Tag(name = "Companies Management", description = "APIs for browsing partner companies and their profiles")
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
            @Parameter(description = "URL friendly slug of company", example = "fpt-software")
            @PathVariable String slug
    ) {
        CompanyResponseDto company = companyService.getCompanyBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(company));
    }
}
