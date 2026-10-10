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

    /**
     * Hiring-team view: every application of the recruiter's company (ADMIN / RECRUITER),
     * or only applications whose interview panel includes the user (INTERVIEWER).
     */
    List<ApplicationResponseDto> getApplicationsForRecruiter(Long recruiterUserId);

    ApplicationResponseDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequestDto request, Long recruiterUserId, boolean isAdmin);

    void withdrawApplication(Long applicationId, Long candidateUserId, boolean isAdmin);

    /**
     * Internal stage transition (history + candidate notification + domain event) used by other
     * workflows such as interview scheduling. Caller is responsible for authorisation.
     *
     * @param sendEmail false when the triggering workflow sends its own, richer e-mail
     */
    void moveToStage(Long applicationId, String toStage, Long actorUserId, String note, boolean sendEmail);
}
