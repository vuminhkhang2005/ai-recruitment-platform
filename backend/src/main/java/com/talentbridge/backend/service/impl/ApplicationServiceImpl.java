package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.dto.ApplicationCreateRequestDto;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.dto.ApplicationStatusUpdateRequestDto;
import com.talentbridge.backend.dto.QuickApplyRequestDto;
import com.talentbridge.backend.dto.QuickApplyResponseDto;
import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.repository.UserRepository;
import com.talentbridge.backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public QuickApplyResponseDto quickApply(QuickApplyRequestDto request) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.getJobId()));

        Long candidateProfileId = 1L; // Demo candidate profile
        if (jobApplicationRepository.existsByJobIdAndCandidateProfileId(job.getId(), candidateProfileId)) {
            throw new BadRequestException("Bạn đã gửi hồ sơ ứng tuyển vào vị trí này rồi. Vui lòng theo dõi trạng thái tại mục Hồ sơ đã ứng tuyển.");
        }

        String applicationUuid = UUID.randomUUID().toString();

        JobApplication application = JobApplication.builder()
                .uuid(applicationUuid)
                .job(job)
                .candidateProfileId(candidateProfileId)
                .cvId(1L)
                .coverLetter(request.getCoverLetter())
                .currentStage("APPLIED")
                .matchScore(new BigDecimal("95.00"))
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        jobApplicationRepository.save(application);

        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Enterprise";

        return QuickApplyResponseDto.builder()
                .applicationUuid(applicationUuid)
                .jobTitle(job.getTitle())
                .companyName(companyName)
                .message("Ứng tuyển thành công! Nhà tuyển dụng " + companyName + " đã nhận được hồ sơ của bạn.")
                .appliedAt(application.getAppliedAt())
                .build();
    }

    @Override
    @Transactional
    public ApplicationResponseDto apply(ApplicationCreateRequestDto request, Long candidateUserId) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.getJobId()));

        // Resolve candidate profile
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder()
                        .userId(candidateUserId)
                        .headline("Ứng viên")
                        .city("TP. Hồ Chí Minh")
                        .country("Vietnam")
                        .isOpenToWork(true)
                        .visibility("PUBLIC")
                        .build()));

        if (jobApplicationRepository.existsByJobIdAndCandidateProfileId(job.getId(), candidateProfile.getId())) {
            throw new BadRequestException("Bạn đã gửi hồ sơ ứng tuyển vào vị trí này rồi.");
        }

        String applicationUuid = UUID.randomUUID().toString();

        JobApplication application = JobApplication.builder()
                .uuid(applicationUuid)
                .job(job)
                .candidateProfileId(candidateProfile.getId())
                .cvId(request.getCvId() != null ? request.getCvId() : 1L)
                .coverLetter(request.getCoverLetter())
                .currentStage("APPLIED")
                .matchScore(new BigDecimal("95.00"))
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        JobApplication saved = jobApplicationRepository.save(application);

        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMyApplications(Long candidateUserId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElse(null);

        if (profile == null) {
            return List.of();
        }

        return jobApplicationRepository.findByCandidateProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponseDto getApplicationById(Long applicationId, Long userId, boolean isRecruiter, boolean isAdmin) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        if (!isAdmin) {
            if (isRecruiter) {
                if (!application.getJob().getRecruiterId().equals(userId)) {
                    throw new AccessDeniedException("Bạn không có quyền xem đơn ứng tuyển này");
                }
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
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        if (!isAdmin && !job.getRecruiterId().equals(recruiterUserId)) {
            throw new AccessDeniedException("Bạn không có quyền quản lý danh sách ứng viên của công việc này");
        }

        return jobApplicationRepository.findByJobId(jobId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public ApplicationResponseDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequestDto request, Long recruiterUserId, boolean isAdmin) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        if (!isAdmin && !application.getJob().getRecruiterId().equals(recruiterUserId)) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật trạng thái đơn ứng tuyển này");
        }

        application.setCurrentStage(request.getCurrentStage().toUpperCase());
        if (request.getRejectionReason() != null) {
            application.setRejectionReason(request.getRejectionReason());
        }
        application.setUpdatedAt(LocalDateTime.now());

        JobApplication updated = jobApplicationRepository.save(application);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long candidateUserId, boolean isAdmin) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        if (!isAdmin) {
            CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId).orElse(null);
            if (profile == null || !profile.getId().equals(application.getCandidateProfileId())) {
                throw new AccessDeniedException("Bạn không có quyền hủy đơn ứng tuyển này");
            }
        }

        // Decrement job count
        Job job = application.getJob();
        if (job != null && job.getApplicationsCount() > 0) {
            job.setApplicationsCount(job.getApplicationsCount() - 1);
            jobRepository.save(job);
        }

        jobApplicationRepository.delete(application);
    }

    private ApplicationResponseDto mapToDto(JobApplication app) {
        String companyName = app.getJob() != null && app.getJob().getCompany() != null
                ? app.getJob().getCompany().getName() : "Enterprise";
        String companyLogo = app.getJob() != null && app.getJob().getCompany() != null
                ? app.getJob().getCompany().getLogoUrl() : "/logos/vinai.svg";
        String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí tuyển dụng";

        String candidateName = "Ứng viên";
        String candidateEmail = "";
        String candidatePhone = "";

        if (app.getCandidateProfileId() != null) {
            candidateProfileRepository.findById(app.getCandidateProfileId()).ifPresent(cp -> {
                userRepository.findById(cp.getUserId()).ifPresent(user -> {
                    // candidate details
                });
            });
            // Try to find candidate user
            CandidateProfile cp = candidateProfileRepository.findById(app.getCandidateProfileId()).orElse(null);
            if (cp != null) {
                User user = userRepository.findById(cp.getUserId()).orElse(null);
                if (user != null) {
                    candidateName = user.getFullName();
                    candidateEmail = user.getEmail();
                    candidatePhone = user.getPhone();
                }
            }
        }

        return ApplicationResponseDto.builder()
                .id(app.getId())
                .uuid(app.getUuid())
                .jobId(app.getJob() != null ? app.getJob().getId() : null)
                .jobTitle(jobTitle)
                .companyName(companyName)
                .companyLogo(companyLogo)
                .candidateProfileId(app.getCandidateProfileId())
                .candidateName(candidateName)
                .candidateEmail(candidateEmail)
                .candidatePhone(candidatePhone)
                .coverLetter(app.getCoverLetter())
                .currentStage(app.getCurrentStage())
                .matchScore(app.getMatchScore())
                .rejectionReason(app.getRejectionReason())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
