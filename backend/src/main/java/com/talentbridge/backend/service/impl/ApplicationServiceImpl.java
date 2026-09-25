package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.dto.QuickApplyRequestDto;
import com.talentbridge.backend.dto.QuickApplyResponseDto;
import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Override
    @Transactional
    public QuickApplyResponseDto quickApply(QuickApplyRequestDto request) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.getJobId()));

        Long candidateProfileId = 1L; // Demo candidate profile
        if (jobApplicationRepository.existsByJobIdAndCandidateProfileId(job.getId(), candidateProfileId)) {
            throw new com.talentbridge.backend.exception.BadRequestException("Bạn đã gửi hồ sơ ứng tuyển vào vị trí này rồi. Vui lòng theo dõi trạng thái tại mục Hồ sơ đã ứng tuyển.");
        }

        String applicationUuid = UUID.randomUUID().toString();

        JobApplication application = JobApplication.builder()
                .uuid(applicationUuid)
                .job(job)
                .candidateProfileId(1L) // Default candidate profile for quick demo
                .cvId(1L)
                .coverLetter(request.getCoverLetter())
                .currentStage("APPLIED")
                .matchScore(new BigDecimal("95.00"))
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        jobApplicationRepository.save(application);

        // Increment application counter on job
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
}
