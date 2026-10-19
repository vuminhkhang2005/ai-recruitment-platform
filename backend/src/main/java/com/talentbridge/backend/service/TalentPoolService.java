package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.TalentPoolDtos.*;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TalentPoolService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<TalentPoolCandidateDto> searchTalentPool(
            Long recruiterUserId,
            String skillKeyword,
            String city,
            Long targetJobId
    ) {
        // 1. Fetch public candidates open to work
        List<CandidateProfile> profiles = candidateProfileRepository.findByIsOpenToWorkTrueAndVisibility("PUBLIC");
        if (profiles.isEmpty()) {
            profiles = candidateProfileRepository.findAll();
        }

        // 2. Pre-fetch target job skills if targetJobId is specified
        List<JobSkill> targetJobSkills = Collections.emptyList();
        if (targetJobId != null) {
            targetJobSkills = jobSkillRepository.findByJobId(targetJobId);
        }

        List<TalentPoolCandidateDto> results = new ArrayList<>();

        for (CandidateProfile cp : profiles) {
            User u = userRepository.findById(cp.getUserId()).orElse(null);
            if (u == null) continue;

            // City filter
            if (StringUtils.hasText(city) && !"All".equalsIgnoreCase(city)) {
                if (cp.getCity() == null || !cp.getCity().toLowerCase().contains(city.trim().toLowerCase())) {
                    continue;
                }
            }

            // Fetch candidate skills
            List<CandidateSkill> candidateSkills = candidateSkillRepository.findByCandidateProfileId(cp.getId());
            List<CandidateSkillSummaryDto> skillSummaries = candidateSkills.stream()
                    .map(cs -> CandidateSkillSummaryDto.builder()
                            .name(cs.getSkill() != null ? cs.getSkill().getName() : "")
                            .proficiency(cs.getProficiency())
                            .yearsExperience(cs.getYearsExperience())
                            .build())
                    .filter(s -> StringUtils.hasText(s.getName()))
                    .toList();

            // Skill keyword filter
            if (StringUtils.hasText(skillKeyword)) {
                String kw = skillKeyword.trim().toLowerCase();
                boolean matchesSkill = skillSummaries.stream().anyMatch(s -> s.getName().toLowerCase().contains(kw));
                boolean matchesHeadline = cp.getHeadline() != null && cp.getHeadline().toLowerCase().contains(kw);
                boolean matchesBio = cp.getBio() != null && cp.getBio().toLowerCase().contains(kw);
                boolean matchesName = u.getFullName() != null && u.getFullName().toLowerCase().contains(kw);

                if (!matchesSkill && !matchesHeadline && !matchesBio && !matchesName) {
                    continue;
                }
            }

            // Calculate match score if targetJobId provided
            Integer score = null;
            String rating = null;
            List<String> matchedSkills = new ArrayList<>();

            if (!targetJobSkills.isEmpty()) {
                Set<String> candSkillNames = skillSummaries.stream()
                        .map(s -> s.getName().toLowerCase())
                        .collect(Collectors.toSet());

                for (JobSkill js : targetJobSkills) {
                    if (js.getSkill() != null && candSkillNames.contains(js.getSkill().getName().toLowerCase())) {
                        matchedSkills.add(js.getSkill().getName());
                    }
                }

                score = (int) Math.round(((double) matchedSkills.size() / targetJobSkills.size()) * 100);
                if (score > 100) score = 100;
                rating = score >= 75 ? "XUẤT SẮC" : score >= 50 ? "PHÙ HỢP" : "TIỀM NĂNG";
            }

            results.add(TalentPoolCandidateDto.builder()
                    .candidateProfileId(cp.getId())
                    .userId(u.getId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .phone(u.getPhone())
                    .avatarUrl(u.getAvatarUrl())
                    .headline(cp.getHeadline() != null ? cp.getHeadline() : "Ứng viên tiềm năng")
                    .city(cp.getCity() != null ? cp.getCity() : "Toàn quốc")
                    .bio(cp.getBio())
                    .expectedSalaryMin(cp.getExpectedSalaryMin())
                    .expectedSalaryMax(cp.getExpectedSalaryMax())
                    .isOpenToWork(cp.getIsOpenToWork())
                    .skills(skillSummaries)
                    .matchScore(score)
                    .matchRating(rating)
                    .matchedSkills(matchedSkills)
                    .build());
        }

        // If targetJobId was used, sort candidates by highest match score
        if (targetJobId != null) {
            results.sort((a, b) -> Integer.compare(
                    b.getMatchScore() != null ? b.getMatchScore() : 0,
                    a.getMatchScore() != null ? a.getMatchScore() : 0
            ));
        }

        return results;
    }

    @Transactional
    public InviteCandidateResponseDto inviteCandidate(Long recruiterUserId, InviteCandidateRequestDto request) {
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(recruiterUserId)
                .orElseThrow(() -> new AccessDeniedException("Tài khoản chưa có hồ sơ nhà tuyển dụng"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Tin tuyển dụng không tồn tại: " + request.getJobId()));

        Long jobCompanyId = job.getCompany() != null ? job.getCompany().getId() : null;
        if (recruiter.getCompanyId() != null && jobCompanyId != null && !recruiter.getCompanyId().equals(jobCompanyId)) {
            throw new AccessDeniedException("Bạn không có quyền mời ứng viên vào tin tuyển dụng của công ty khác");
        }

        User candidate = userRepository.findById(request.getCandidateUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Ứng viên không tồn tại: " + request.getCandidateUserId()));

        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Nhà tuyển dụng";
        String inviteTitle = "Lời mời ứng tuyển từ " + companyName;
        String inviteContent = StringUtils.hasText(request.getCustomMessage())
                ? request.getCustomMessage().trim()
                : String.format("Nhà tuyển dụng từ %s rất ấn tượng với hồ sơ của bạn và trân trọng mời bạn ứng tuyển vào vị trí %s.", companyName, job.getTitle());

        // Send in-app notification to candidate
        notificationService.notify(
                candidate.getId(),
                "JOB_INVITATION",
                inviteTitle,
                inviteContent,
                "JOB",
                job.getId()
        );

        log.info("Recruiter {} invited Candidate {} to apply for Job {}", recruiterUserId, candidate.getId(), job.getId());

        return InviteCandidateResponseDto.builder()
                .candidateUserId(candidate.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .candidateName(candidate.getFullName())
                .status("INVITED")
                .message("Đã gửi lời mời ứng tuyển thành công tới ứng viên " + candidate.getFullName())
                .build();
    }
}
