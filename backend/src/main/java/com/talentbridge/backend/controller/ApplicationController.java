package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.dto.QuickApplyRequestDto;
import com.talentbridge.backend.dto.QuickApplyResponseDto;
import com.talentbridge.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications Management", description = "APIs for candidate application submission and tracking")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/quick-apply")
    @Operation(summary = "Quick Apply for Job", description = "Submit a fast application with candidate info and cover letter for a specific job.")
    public ResponseEntity<ApiResponse<QuickApplyResponseDto>> quickApply(
            @Valid @RequestBody QuickApplyRequestDto request
    ) {
        QuickApplyResponseDto response = applicationService.quickApply(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Nộp hồ sơ ứng tuyển thành công", response));
    }
}
