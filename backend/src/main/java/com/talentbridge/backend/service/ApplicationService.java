package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.ApplicationCreateRequestDto;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import com.talentbridge.backend.dto.ApplicationStatusUpdateRequestDto;

import java.util.List;

public interface ApplicationService {

    ApplicationResponseDto apply(ApplicationCreateRequestDto request, Long candidateUserId);

    List<ApplicationResponseDto> getMyApplications(Long candidateUserId);

    ApplicationResponseDto getApplicationById(Long applicationId, Long userId, boolean isRecruiter, boolean isAdmin);

    List<ApplicationResponseDto> getApplicationsForJob(Long jobId, Long recruiterUserId, boolean isAdmin);

    /** All applications across every job owned by the recruiter. */
    List<ApplicationResponseDto> getApplicationsForRecruiter(Long recruiterUserId);

    ApplicationResponseDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequestDto request, Long recruiterUserId, boolean isAdmin);

    void withdrawApplication(Long applicationId, Long candidateUserId, boolean isAdmin);
}
