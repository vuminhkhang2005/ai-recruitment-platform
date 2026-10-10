package com.talentbridge.backend.service;

import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.repository.InterviewRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Company-level access policy for the hiring team (Enterprise Hiring Team).
 *
 * <ul>
 *   <li><b>ADMIN</b> – manages the company profile and team members; full ATS access.</li>
 *   <li><b>RECRUITER</b> – manages every job and applicant of the company.</li>
 *   <li><b>INTERVIEWER</b> – read-only access to applications they sit on an interview panel for,
 *       can submit scorecards and internal notes; cannot post jobs or move stages.</li>
 * </ul>
 *
 * Replaces the earlier "only the recruiter who posted the job" rule so colleagues can collaborate.
 */
@Service
@RequiredArgsConstructor
public class HiringTeamService {

    public static final String ADMIN = "ADMIN";
    public static final String RECRUITER = "RECRUITER";
    public static final String INTERVIEWER = "INTERVIEWER";
    public static final Set<String> TEAM_ROLES = Set.of(ADMIN, RECRUITER, INTERVIEWER);

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final InterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    public Optional<RecruiterProfile> findMember(Long userId) {
        return userId == null ? Optional.empty() : recruiterProfileRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public RecruiterProfile requireMember(Long userId) {
        return findMember(userId).orElseThrow(() -> new AccessDeniedException("Tài khoản chưa thuộc đội tuyển dụng của công ty nào"));
    }

    public static boolean isManager(RecruiterProfile rp) {
        return rp != null && (ADMIN.equals(rp.getTeamRole()) || RECRUITER.equals(rp.getTeamRole()));
    }

    public static boolean isAdmin(RecruiterProfile rp) {
        return rp != null && ADMIN.equals(rp.getTeamRole());
    }

    /** ADMIN or RECRUITER of any company; used for posting jobs. */
    @Transactional(readOnly = true)
    public RecruiterProfile requireManager(Long userId) {
        RecruiterProfile rp = requireMember(userId);
        if (!isManager(rp)) {
            throw new AccessDeniedException("Vai trò Người phỏng vấn không có quyền thực hiện thao tác này");
        }
        return rp;
    }

    @Transactional(readOnly = true)
    public RecruiterProfile requireCompanyAdmin(Long userId) {
        RecruiterProfile rp = requireMember(userId);
        if (!isAdmin(rp)) {
            throw new AccessDeniedException("Chỉ quản trị viên công ty mới thực hiện được thao tác này");
        }
        return rp;
    }

    public static Long companyIdOf(Job job) {
        return job != null && job.getCompany() != null ? job.getCompany().getId() : null;
    }

    /** Job management (edit, status, delete, list applicants): ADMIN/RECRUITER of the job's company. */
    @Transactional(readOnly = true)
    public RecruiterProfile assertCanManageJob(Long userId, Job job, String message) {
        RecruiterProfile rp = findMember(userId).orElseThrow(() -> new AccessDeniedException(message));
        if (!isManager(rp) || !rp.getCompanyId().equals(companyIdOf(job))) {
            throw new AccessDeniedException(message);
        }
        return rp;
    }

    /** Stage changes, scheduling, messaging on behalf of the company. */
    @Transactional(readOnly = true)
    public RecruiterProfile assertCanManageApplication(Long userId, JobApplication app, String message) {
        return assertCanManageJob(userId, app.getJob(), message);
    }

    /** Viewing an application: managers of the company, or an interviewer on one of its panels. */
    @Transactional(readOnly = true)
    public RecruiterProfile assertCanViewApplication(Long userId, JobApplication app, String message) {
        RecruiterProfile rp = findMember(userId).orElseThrow(() -> new AccessDeniedException(message));
        if (!rp.getCompanyId().equals(companyIdOf(app.getJob()))) {
            throw new AccessDeniedException(message);
        }
        if (isManager(rp) || isPanelist(userId, app.getId())) {
            return rp;
        }
        throw new AccessDeniedException(message);
    }

    @Transactional(readOnly = true)
    public boolean canViewApplication(Long userId, JobApplication app) {
        try {
            assertCanViewApplication(userId, app, "denied");
            return true;
        } catch (AccessDeniedException ex) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean isPanelist(Long userId, Long applicationId) {
        return interviewRepository.findByApplicationIdOrderByRoundNumberAscScheduledStartAsc(applicationId).stream()
                .anyMatch(i -> i.getPanelistUserIds().contains(userId));
    }

    @Transactional(readOnly = true)
    public List<RecruiterProfile> members(Long companyId) {
        return recruiterProfileRepository.findByCompanyIdOrderByIdAsc(companyId);
    }

    /** User ids of ADMIN/RECRUITER members (recipients of company-wide notifications). */
    @Transactional(readOnly = true)
    public List<Long> managerUserIds(Long companyId) {
        return members(companyId).stream().filter(HiringTeamService::isManager).map(RecruiterProfile::getUserId).toList();
    }
}
