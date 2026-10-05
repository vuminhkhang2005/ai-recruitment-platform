package com.talentbridge.backend.controller;

import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.entity.Cv;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.CvRepository;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.CandidateService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/cvs")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@Tag(name = "8. CV Files", description = "Tải file CV (chủ sở hữu hoặc nhà tuyển dụng nhận hồ sơ)")
public class CvController {

    private final CvRepository cvRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateService candidateService;

    @GetMapping("/{id}/file")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> download(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        Cv cv = cvRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV"));

        boolean isAdmin = hasRole(user, "ROLE_ADMIN");
        boolean isOwner = candidateProfileRepository.findByUserId(user.getId())
                .map(p -> p.getId().equals(cv.getCandidateProfileId())).orElse(false);
        boolean isRecruiterOfApplication = hasRole(user, "ROLE_RECRUITER") && recruiterProfileRepository.findByUserId(user.getId())
                .map(rp -> jobApplicationRepository.existsByCvIdAndJobRecruiterId(cv.getId(), rp.getId())).orElse(false);

        if (!isAdmin && !isOwner && !isRecruiterOfApplication) {
            throw new AccessDeniedException("Bạn không có quyền xem CV này");
        }

        Path file = candidateService.resolveLocalFile(cv);
        if (file == null) {
            throw new ResourceNotFoundException("File CV này không được lưu trên hệ thống (dữ liệu mẫu).");
        }

        String name = cv.getFileName().toLowerCase();
        MediaType type = name.endsWith(".pdf") ? MediaType.APPLICATION_PDF : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(type)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(cv.getFileName(), StandardCharsets.UTF_8).build().toString())
                .body(new FileSystemResource(file));
    }

    private static boolean hasRole(UserPrincipal user, String role) {
        return user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }
}
