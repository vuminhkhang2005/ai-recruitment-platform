package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.CandidateDtos.CvItem;
import com.talentbridge.backend.dto.CandidateDtos.SkillItem;
import com.talentbridge.backend.dto.CandidateDtos.SkillsUpdateRequest;
import com.talentbridge.backend.dto.MatchScoreDto;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.CandidateService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates/me")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@Tag(name = "7. Candidate Self-Service", description = "Kỹ năng, CV và mức độ phù hợp của ứng viên đang đăng nhập")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<SkillItem>>> getSkills(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getSkills(user.getId())));
    }

    @PutMapping("/skills")
    public ResponseEntity<ApiResponse<List<SkillItem>>> replaceSkills(
            @RequestBody SkillsUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật kỹ năng", candidateService.replaceSkills(user.getId(), request.getSkills())));
    }

    @GetMapping("/match-scores")
    public ResponseEntity<ApiResponse<List<MatchScoreDto>>> matchScores(
            @RequestParam List<Long> jobIds,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.matchScores(user.getId(), jobIds)));
    }

    @GetMapping("/cvs")
    public ResponseEntity<ApiResponse<List<CvItem>>> listCvs(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.listCvs(user.getId())));
    }

    @PostMapping(value = "/cvs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CvItem>> uploadCv(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã tải lên CV", candidateService.uploadCv(user.getId(), file, title)));
    }

    @PatchMapping("/cvs/{id}/default")
    public ResponseEntity<ApiResponse<List<CvItem>>> setDefault(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.setDefaultCv(user.getId(), id)));
    }

    @DeleteMapping("/cvs/{id}")
    public ResponseEntity<ApiResponse<List<CvItem>>> deleteCv(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa CV", candidateService.deleteCv(user.getId(), id)));
    }
}
