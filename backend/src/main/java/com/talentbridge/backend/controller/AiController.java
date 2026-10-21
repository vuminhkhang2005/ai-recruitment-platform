package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.AiDtos.*;
import com.talentbridge.backend.dto.CandidateDtos.SkillItem;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "9. AI & Smart Recruitment", description = "Bóc tách CV bằng AI, Tính điểm tương thích ATS, Sinh thư giới thiệu tự động")
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/parse-cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Parse CV File using AI (PDF, DOCX, TXT)")
    public ResponseEntity<ApiResponse<AiResumeParseResultDto>> parseCvFile(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        AiResumeParseResultDto result = aiService.parseCv(userId, file, null, null);
        return ResponseEntity.ok(ApiResponse.ok("Bóc tách thông tin CV thành công", result));
    }

    @PostMapping(value = "/parse-cv-text")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Parse CV from raw text or uploaded cvId")
    public ResponseEntity<ApiResponse<AiResumeParseResultDto>> parseCvText(
            @RequestBody ParseCvTextRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        AiResumeParseResultDto result = aiService.parseCv(userId, null, request != null ? request.getText() : null, request != null ? request.getCvId() : null);
        return ResponseEntity.ok(ApiResponse.ok("Bóc tách thông tin CV thành công", result));
    }

    @PostMapping("/sync-parsed-skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Sync AI-extracted skills into candidate profile")
    public ResponseEntity<ApiResponse<List<SkillItem>>> syncSkills(
            @Valid @RequestBody SyncSkillsRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        List<SkillItem> updated = aiService.syncSkills(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã đồng bộ kỹ năng vào hồ sơ", updated));
    }

    @PostMapping("/generate-cover-letter")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Generate tailored cover letter using AI")
    public ResponseEntity<ApiResponse<CoverLetterResponseDto>> generateCoverLetter(
            @Valid @RequestBody CoverLetterGenerateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        CoverLetterResponseDto response = aiService.generateCoverLetter(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo thư giới thiệu thành công", response));
    }

    @GetMapping("/match-analysis")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Deep ATS Match Analysis & Skill Gap comparing Candidate CV vs Job JD")
    public ResponseEntity<ApiResponse<AtsMatchAnalysisResponseDto>> analyzeAtsMatch(
            @RequestParam Long jobId,
            @RequestParam(required = false) Long cvId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        AtsMatchAnalysisResponseDto analysis = cvId != null
                ? aiService.analyzeAtsMatch(userId, jobId, cvId, null)
                : aiService.analyzeAtsMatch(userId, jobId);
        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }

    @PostMapping(value = "/match-analysis", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Deep ATS Match Analysis comparing an uploaded or selected CV file against Job JD")
    public ResponseEntity<ApiResponse<AtsMatchAnalysisResponseDto>> analyzeAtsMatchWithCv(
            @RequestParam Long jobId,
            @RequestParam(required = false) Long cvId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        AtsMatchAnalysisResponseDto analysis = aiService.analyzeAtsMatch(userId, jobId, cvId, file);
        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }

    @GetMapping("/recommended-jobs")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get personalized recommended jobs based on ATS skill matching")
    public ResponseEntity<ApiResponse<List<RecommendedJobDto>>> getRecommendedJobs(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1L;
        List<RecommendedJobDto> recommended = aiService.getRecommendedJobsForCandidate(userId, limit);
        return ResponseEntity.ok(ApiResponse.ok(recommended));
    }
}
