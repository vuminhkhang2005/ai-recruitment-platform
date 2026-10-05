package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.common.SalaryFormatter;
import com.talentbridge.backend.dto.ApplicationCreateRequestDto;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.dto.ApplicationStatusUpdateRequestDto;
import com.talentbridge.backend.dto.MatchScoreDto;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import com.talentbridge.backend.service.ApplicationService;
import com.talentbridge.backend.service.CandidateService;
import com.talentbridge.backend.service.MatchingService;
import com.talentbridge.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private static final Set<String> STAGES = Set.of("APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED");
    private static final Set<String> WITHDRAWABLE = Set.of("APPLIED", "SCREENING");
    private static final Map<String, String> STAGE_LABELS = Map.of(
            "APPLIED", "Đã nộp hồ sơ",
            "SCREENING", "Đang xem xét hồ sơ",
            "INTERVIEW", "Mời phỏng vấn",
            "OFFERED", "Đề nghị nhận việc",
            "HIRED", "Đã trúng tuyển",
            "REJECTED", "Chưa phù hợp"
    );

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final CvRepository cvRepository;
    private final ApplicationStageHistoryRepository stageHistoryRepository;
    private final CandidateService candidateService;
    private final MatchingService matchingService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ApplicationResponseDto apply(ApplicationCreateRequestDto request, Long candidateUserId) {
        Job job = jobRepository.findByIdWithCompany(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin tuyển dụng #" + request.getJobId()));

        if (!"PUBLISHED".equals(job.getStatus()) || job.getDeletedAt() != null) {
            throw new BadRequestException("Tin tuyển dụng này đã ngừng nhận hồ sơ.");
        }
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Tin tuyển dụng đã hết hạn nộp hồ sơ.");
        }

        CandidateProfile candidateProfile = candidateService.requireProfile(candidateUserId);

        if (jobApplicationRepository.existsByJobIdAndCandidateProfileId(job.getId(), candidateProfile.getId())) {
            throw new BadRequestException("Bạn đã ứng tuyển vị trí này rồi.");
        }

        Cv cv = candidateService.resolveCvForApplication(candidateProfile, request.getCvId());
        MatchScoreDto match = matchingService.computeForJob(candidateProfile.getId(), job.getId());

        String coverLetter = StringUtils.hasText(request.getCoverLetter()) ? request.getCoverLetter().trim() : null;
        if (coverLetter != null && coverLetter.length() > 5000) {
            throw new BadRequestException("Thư giới thiệu tối đa 5000 ký tự.");
        }

        LocalDateTime now = LocalDateTime.now();
        JobApplication saved = jobApplicationRepository.save(JobApplication.builder()
                .uuid(UUID.randomUUID().toString())
                .job(job)
                .candidateProfileId(candidateProfile.getId())
                .cvId(cv.getId())
                .coverLetter(coverLetter)
                .currentStage("APPLIED")
                .matchScore(match != null && match.getScore() != null ? BigDecimal.valueOf(match.getScore()) : null)
                .appliedAt(now)
                .updatedAt(now)
                .build());

        stageHistoryRepository.save(ApplicationStageHistory.builder()
                .applicationId(saved.getId())
                .fromStage(null)
                .toStage("APPLIED")
                .changedByUserId(candidateUserId)
                .note("Ứng viên nộp hồ sơ")
                .build());

        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        String candidateName = userRepository.findById(candidateUserId).map(User::getFullName).orElse("Ứng viên");
        recruiterProfileRepository.findById(job.getRecruiterId()).ifPresent(rp ->
                notificationService.notify(rp.getUserId(), "NEW_APPLICATION",
                        "Hồ sơ mới cho " + job.getTitle(),
                        candidateName + " vừa ứng tuyển vị trí " + job.getTitle() + ".",
                        "APPLICATION", saved.getId()));

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMyApplications(Long candidateUserId) {
        return candidateProfileRepository.findByUserId(candidateUserId)
                .map(profile -> jobApplicationRepository.findByCandidateProfileId(profile.getId()).stream()
                        .sorted((a, b) -> b.getAppliedAt().compareTo(a.getAppliedAt()))
                        .map(this::mapToDto)
                        .toList())
                .orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponseDto getApplicationById(Long applicationId, Long userId, boolean isRecruiter, boolean isAdmin) {
        JobApplication application = findApplication(applicationId);

        if (!isAdmin) {
            if (isRecruiter) {
                assertOwnsJob(application.getJob(), userId, "Bạn không có quyền xem đơn ứng tuyển này");
            } else {
                CandidateProfile profile = candidateProfileRepository.findByUserId(userId).orElse(null);
                if (profile == null || !profile.getId().equals(application.getCandidateProfileId())) {
                    throw new AccessDeniedException("Bạn không có quyền xem đơn ứng tuyển này");
                }
            }
        }
        return mapToDto(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getApplicationsForJob(Long jobId, Long recruiterUserId, boolean isAdmin) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin tuyển dụng #" + jobId));
        if (!isAdmin) {
            assertOwnsJob(job, recruiterUserId, "Bạn không có quyền xem ứng viên của tin này");
        }
        return jobApplicationRepository.findByJobId(jobId).stream()
                .sorted((a, b) -> b.getAppliedAt().compareTo(a.getAppliedAt()))
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getApplicationsForRecruiter(Long recruiterUserId) {
        RecruiterProfile rp = recruiterProfileRepository.findByUserId(recruiterUserId)
                .orElseThrow(() -> new AccessDeniedException("Tài khoản chưa có hồ sơ nhà tuyển dụng"));
        return jobApplicationRepository.findAllForRecruiter(rp.getId()).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public ApplicationResponseDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequestDto request, Long recruiterUserId, boolean isAdmin) {
        JobApplication application = findApplication(applicationId);
        if (!isAdmin) {
            assertOwnsJob(application.getJob(), recruiterUserId, "Bạn không có quyền cập nhật đơn ứng tuyển này");
        }

        String stage = request.getCurrentStage() == null ? "" : request.getCurrentStage().trim().toUpperCase();
        if ("REVIEWING".equals(stage)) {
            stage = "SCREENING";
        }
        if (!STAGES.contains(stage)) {
            throw new BadRequestException("Trạng thái không hợp lệ: " + request.getCurrentStage());
        }

        String from = application.getCurrentStage();
        if (stage.equals(from)) {
            return mapToDto(application);
        }

        application.setCurrentStage(stage);
        if ("REJECTED".equals(stage)) {
            application.setRejectionReason(StringUtils.hasText(request.getRejectionReason()) ? request.getRejectionReason().trim() : null);
        } else {
            application.setRejectionReason(null);
        }
        application.setUpdatedAt(LocalDateTime.now());
        JobApplication updated = jobApplicationRepository.save(application);

        stageHistoryRepository.save(ApplicationStageHistory.builder()
                .applicationId(updated.getId())
                .fromStage(from)
                .toStage(stage)
                .changedByUserId(recruiterUserId)
                .note(updated.getRejectionReason())
                .build());

        CandidateProfile cp = candidateProfileRepository.findById(updated.getCandidateProfileId()).orElse(null);
        if (cp != null) {
            Job job = updated.getJob();
            String company = job.getCompany() != null ? job.getCompany().getName() : "Nhà tuyển dụng";
            notificationService.notify(cp.getUserId(), "APPLICATION_STATUS",
                    job.getTitle() + ": " + STAGE_LABELS.get(stage),
                    company + " đã cập nhật trạng thái hồ sơ của bạn thành \"" + STAGE_LABELS.get(stage) + "\".",
                    "APPLICATION", updated.getId());
        }

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long candidateUserId, boolean isAdmin) {
        JobApplication application = findApplication(applicationId);

        if (!isAdmin) {
            CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId).orElse(null);
            if (profile == null || !profile.getId().equals(application.getCandidateProfileId())) {
                throw new AccessDeniedException("Bạn không có quyền rút đơn ứng tuyển này");
            }
            if (!WITHDRAWABLE.contains(application.getCurrentStage())) {
                throw new BadRequestException("Không thể rút hồ sơ khi nhà tuyển dụng đã xử lý đến bước \"" + STAGE_LABELS.get(application.getCurrentStage()) + "\".");
            }
        }

        Job job = application.getJob();
        if (job != null && job.getApplicationsCount() > 0) {
            job.setApplicationsCount(job.getApplicationsCount() - 1);
            jobRepository.save(job);
        }
        jobApplicationRepository.delete(application);
    }

    // ------------------------------------------------------------------ helpers

    private JobApplication findApplication(Long id) {
        return jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển #" + id));
    }

    private void assertOwnsJob(Job job, Long recruiterUserId, String message) {
        Long recruiterProfileId = recruiterProfileRepository.findByUserId(recruiterUserId)
                .map(RecruiterProfile::getId)
                .orElseThrow(() -> new AccessDeniedException(message));
        if (!job.getRecruiterId().equals(recruiterProfileId)) {
            throw new AccessDeniedException(message);
        }
    }

    private ApplicationResponseDto mapToDto(JobApplication app) {
        Job job = app.getJob();
        Company company = job != null ? job.getCompany() : null;

        ApplicationResponseDto.ApplicationResponseDtoBuilder b = ApplicationResponseDto.builder()
                .id(app.getId())
                .uuid(app.getUuid())
                .jobId(job != null ? job.getId() : null)
                .jobTitle(job != null ? job.getTitle() : null)
                .jobStatus(job != null ? job.getStatus() : null)
                .jobLocation(job != null ? job.getLocationCity() : null)
                .jobDeadline(job != null ? job.getDeadline() : null)
                .jobSalary(job != null ? SalaryFormatter.format(job.getMinSalary(), job.getMaxSalary(), job.getCurrency(), job.getIsSalaryNegotiable()) : null)
                .companyName(company != null ? company.getName() : null)
                .companyLogo(company != null ? company.getLogoUrl() : null)
                .candidateProfileId(app.getCandidateProfileId())
                .coverLetter(app.getCoverLetter())
                .currentStage(app.getCurrentStage())
                .matchScore(app.getMatchScore())
                .rejectionReason(app.getRejectionReason())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt());

        if (app.getCandidateProfileId() != null) {
            candidateProfileRepository.findById(app.getCandidateProfileId()).ifPresent(cp -> {
                b.candidateUserId(cp.getUserId())
                        .candidateHeadline(cp.getHeadline())
                        .candidateCity(cp.getCity())
                        .candidateSkills(candidateSkillRepository.findByCandidateProfileId(cp.getId()).stream()
                                .map(cs -> cs.getSkill().getName())
                                .toList());
                userRepository.findById(cp.getUserId()).ifPresent(user -> b
                        .candidateName(user.getFullName())
                        .candidateEmail(user.getEmail())
                        .candidatePhone(user.getPhone()));
            });
        }

        if (app.getCvId() != null) {
            cvRepository.findById(app.getCvId()).ifPresent(cv -> b
                    .cvId(cv.getId())
                    .cvTitle(cv.getTitle())
                    .cvFileName(cv.getFileName())
                    .cvDownloadable(cv.getFileUrl() != null && cv.getFileUrl().startsWith(CandidateService.LOCAL_PREFIX)));
        }

        b.history(stageHistoryRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(app.getId()).stream()
                .map(h -> ApplicationResponseDto.StageHistoryItem.builder()
                        .fromStage(h.getFromStage())
                        .toStage(h.getToStage())
                        .note(h.getNote())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList());

        return b.build();
    }
}
