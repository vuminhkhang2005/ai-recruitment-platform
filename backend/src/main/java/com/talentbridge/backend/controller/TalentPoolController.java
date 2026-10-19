package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.dto.TalentPoolDtos.*;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.TalentPoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employer/talent-pool")
@RequiredArgsConstructor
@Tag(name = "7. Employer Talent Pool", description = "Tìm kiếm và chủ động săn ứng viên mở (Proactive Sourcing & Talent Matching)")
public class TalentPoolController {

    private final TalentPoolService talentPoolService;

    @GetMapping
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Search public talent pool with skill and ATS matching")
    public ResponseEntity<ApiResponse<List<TalentPoolCandidateDto>>> searchTalentPool(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "All") String city,
            @RequestParam(required = false) Long jobId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long recruiterUserId = userPrincipal != null ? userPrincipal.getId() : 1L;
        List<TalentPoolCandidateDto> candidates = talentPoolService.searchTalentPool(recruiterUserId, keyword, city, jobId);
        return ResponseEntity.ok(ApiResponse.ok(candidates));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Invite candidate to apply for a job posting")
    public ResponseEntity<ApiResponse<InviteCandidateResponseDto>> inviteCandidate(
            @Valid @RequestBody InviteCandidateRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long recruiterUserId = userPrincipal != null ? userPrincipal.getId() : 1L;
        InviteCandidateResponseDto response = talentPoolService.inviteCandidate(recruiterUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi lời mời ứng tuyển thành công", response));
    }
}
