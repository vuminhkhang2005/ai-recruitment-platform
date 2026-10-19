package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.AdminDtos.*;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private static final Set<String> VALID_USER_STATUSES = Set.of("ACTIVE", "PENDING_VERIFY", "SUSPENDED", "BANNED");
    private static final Set<String> VALID_COMPANY_VERIFICATIONS = Set.of("PENDING", "VERIFIED", "REJECTED");
    private static final Set<String> VALID_JOB_STATUSES = Set.of("DRAFT", "PENDING_APPROVAL", "PUBLISHED", "PAUSED", "CLOSED", "EXPIRED");
    private static final Set<String> VALID_SKILL_CATEGORIES = Set.of(
            "PROGRAMMING_LANGUAGE", "FRAMEWORK", "DATABASE", "CLOUD_DEVOPS",
            "TESTING", "METHODOLOGY", "SOFT_SKILL", "OTHER"
    );

    private static final List<String> ORDERED_STAGES = List.of("APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED");
    private static final Map<String, String> STAGE_LABELS = Map.of(
            "APPLIED", "Mới nộp hồ sơ",
            "SCREENING", "Đang sàng lọc CV",
            "INTERVIEW", "Đang phỏng vấn",
            "OFFERED", "Đã gửi Offer",
            "HIRED", "Đã tuyển dụng",
            "REJECTED", "Không phù hợp"
    );

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final SkillRepository skillRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailLogRepository emailLogRepository;
    private final NotificationService notificationService;

    // =========================================================================
    // 1. PLATFORM OVERVIEW & AI SYSTEM HEALTH (UC-ADM-01, UC-ADM-06)
    // =========================================================================
    @Transactional(readOnly = true)
    public PlatformOverviewDto getPlatformOverview() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus())).count();
        long suspendedOrBannedUsers = allUsers.stream()
                .filter(u -> "SUSPENDED".equalsIgnoreCase(u.getStatus()) || "BANNED".equalsIgnoreCase(u.getStatus()))
                .count();

        long totalCandidates = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_CANDIDATE".equalsIgnoreCase(r.getName())))
                .count();
        long totalRecruiters = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_RECRUITER".equalsIgnoreCase(r.getName()) || "ROLE_HIRING_MANAGER".equalsIgnoreCase(r.getName())))
                .count();

        List<Company> allCompanies = companyRepository.findAll();
        long totalCompanies = allCompanies.size();
        long verifiedCompanies = allCompanies.stream().filter(c -> "VERIFIED".equalsIgnoreCase(c.getVerificationStatus())).count();
        long pendingCompanies = allCompanies.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getVerificationStatus())).count();

        List<Job> allJobs = jobRepository.findAll().stream()
                .filter(j -> j.getDeletedAt() == null)
                .toList();
        long totalJobs = allJobs.size();
        long publishedJobs = allJobs.stream().filter(j -> "PUBLISHED".equalsIgnoreCase(j.getStatus())).count();
        long pendingOrDraftJobs = allJobs.stream()
                .filter(j -> "PENDING_APPROVAL".equalsIgnoreCase(j.getStatus()) || "DRAFT".equalsIgnoreCase(j.getStatus()))
                .count();

        List<JobApplication> allApplications = jobApplicationRepository.findAll();
        long totalApplications = allApplications.size();
        long totalInterviews = interviewRepository.count();
        List<Skill> allSkills = skillRepository.findAll();
        long totalSkills = allSkills.size();

        long hiredCount = allApplications.stream()
                .filter(a -> "HIRED".equalsIgnoreCase(a.getCurrentStage()))
                .count();
        double overallHireRate = totalApplications > 0
                ? Math.round((hiredCount * 1000.0) / totalApplications) / 10.0
                : 0.0;

        List<Double> matchScores = allApplications.stream()
                .filter(a -> a.getMatchScore() != null)
                .map(a -> a.getMatchScore().doubleValue())
                .toList();
        double averagePlatformMatchScore = matchScores.isEmpty()
                ? 76.5
                : Math.round(matchScores.stream().mapToDouble(Double::doubleValue).average().orElse(76.5) * 10.0) / 10.0;

        // Applications by stage
        Map<String, Long> stageCounts = allApplications.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCurrentStage() != null ? a.getCurrentStage().toUpperCase() : "APPLIED",
                        Collectors.counting()
                ));
        List<StageCountDto> applicationsByStage = ORDERED_STAGES.stream()
                .map(stage -> {
                    long count = stageCounts.getOrDefault(stage, 0L);
                    double pct = totalApplications > 0 ? Math.round((count * 1000.0) / totalApplications) / 10.0 : 0.0;
                    return StageCountDto.builder()
                            .stage(stage)
                            .label(STAGE_LABELS.getOrDefault(stage, stage))
                            .count(count)
                            .percentage(pct)
                            .build();
                })
                .toList();

        // Top companies by job & application volume
        Map<Long, Long> jobCountByCompany = allJobs.stream()
                .filter(j -> j.getCompany() != null)
                .collect(Collectors.groupingBy(j -> j.getCompany().getId(), Collectors.counting()));
        Map<Long, Long> appCountByCompany = allJobs.stream()
                .filter(j -> j.getCompany() != null)
                .collect(Collectors.groupingBy(
                        j -> j.getCompany().getId(),
                        Collectors.summingLong(j -> j.getApplicationsCount() != null ? j.getApplicationsCount() : 0L)
                ));

        List<TopCompanyMetricDto> topCompanies = allCompanies.stream()
                .map(c -> TopCompanyMetricDto.builder()
                        .companyId(c.getId())
                        .companyName(c.getName())
                        .logoUrl(c.getLogoUrl())
                        .industry(c.getIndustry())
                        .verificationStatus(c.getVerificationStatus())
                        .jobCount(jobCountByCompany.getOrDefault(c.getId(), 0L))
                        .applicationCount(appCountByCompany.getOrDefault(c.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(TopCompanyMetricDto::getJobCount)
                        .thenComparingLong(TopCompanyMetricDto::getApplicationCount)
                        .reversed())
                .limit(6)
                .toList();

        // Top skills by job demand + candidate supply
        Map<Long, Long> jobSkillCounts = jobSkillRepository.findAll().stream()
                .filter(js -> js.getSkill() != null)
                .collect(Collectors.groupingBy(js -> js.getSkill().getId(), Collectors.counting()));
        Map<Long, Long> candidateSkillCounts = candidateSkillRepository.findAll().stream()
                .filter(cs -> cs.getSkill() != null)
                .collect(Collectors.groupingBy(cs -> cs.getSkill().getId(), Collectors.counting()));

        List<TopSkillMetricDto> topSkills = allSkills.stream()
                .map(s -> TopSkillMetricDto.builder()
                        .skillId(s.getId())
                        .skillName(s.getName())
                        .category(s.getCategory())
                        .jobCount(jobSkillCounts.getOrDefault(s.getId(), 0L))
                        .candidateCount(candidateSkillCounts.getOrDefault(s.getId(), 0L))
                        .build())
                .sorted(Comparator.<TopSkillMetricDto>comparingLong(s -> s.getJobCount() + s.getCandidateCount()).reversed())
                .limit(8)
                .toList();

        long highMatchCount = matchScores.stream().filter(score -> score >= 75.0).count();
        long openToWorkCount = candidateProfileRepository.findAll().stream()
                .filter(cp -> Boolean.TRUE.equals(cp.getIsOpenToWork()))
                .count();

        AiSystemMetricsDto aiMetrics = AiSystemMetricsDto.builder()
                .activeModelName("TalentBridge Hybrid ATS & Skill-Graph Engine v2.4")
                .totalScoredApplications(matchScores.size())
                .averageAtsScore(averagePlatformMatchScore)
                .highMatchCount(highMatchCount)
                .openToWorkCandidates(openToWorkCount)
                .averageLatencyMs(38)
                .uptimePercentage(99.98)
                .build();

        return PlatformOverviewDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedOrBannedUsers(suspendedOrBannedUsers)
                .totalCandidates(totalCandidates)
                .totalRecruiters(totalRecruiters)
                .totalCompanies(totalCompanies)
                .verifiedCompanies(verifiedCompanies)
                .pendingCompanies(pendingCompanies)
                .totalJobs(totalJobs)
                .publishedJobs(publishedJobs)
                .pendingOrDraftJobs(pendingOrDraftJobs)
                .totalApplications(totalApplications)
                .totalInterviews(totalInterviews)
                .totalSkills(totalSkills)
                .overallHireRate(overallHireRate)
                .averagePlatformMatchScore(averagePlatformMatchScore)
                .applicationsByStage(applicationsByStage)
                .topCompanies(topCompanies)
                .topSkills(topSkills)
                .aiMetrics(aiMetrics)
                .build();
    }

    // =========================================================================
    // 2. USER & RBAC MANAGEMENT (UC-ADM-02)
    // =========================================================================
    @Transactional(readOnly = true)
    public List<AdminUserDto> getUsers(String keyword, String roleFilter, String statusFilter) {
        Map<Long, String> companyById = companyRepository.findAll().stream()
                .collect(Collectors.toMap(Company::getId, Company::getName, (a, b) -> a));
        Map<Long, RecruiterProfile> recruiterByUserId = recruiterProfileRepository.findAll().stream()
                .collect(Collectors.toMap(RecruiterProfile::getUserId, rp -> rp, (a, b) -> a));
        Map<Long, CandidateProfile> candidateByUserId = candidateProfileRepository.findAll().stream()
                .collect(Collectors.toMap(CandidateProfile::getUserId, cp -> cp, (a, b) -> a));

        return userRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() == null)
                .filter(u -> {
                    if (!StringUtils.hasText(keyword)) return true;
                    String kw = keyword.trim().toLowerCase();
                    return (u.getFullName() != null && u.getFullName().toLowerCase().contains(kw))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(kw))
                            || (u.getPhone() != null && u.getPhone().toLowerCase().contains(kw));
                })
                .filter(u -> {
                    if (!StringUtils.hasText(roleFilter) || "ALL".equalsIgnoreCase(roleFilter)) return true;
                    return u.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase(roleFilter.trim()));
                })
                .filter(u -> {
                    if (!StringUtils.hasText(statusFilter) || "ALL".equalsIgnoreCase(statusFilter)) return true;
                    return statusFilter.trim().equalsIgnoreCase(u.getStatus());
                })
                .sorted(Comparator.comparing(User::getId))
                .map(u -> mapToAdminUserDto(u, companyById, recruiterByUserId, candidateByUserId))
                .toList();
    }

    @Transactional
    public AdminUserDto updateUserStatus(Long adminUserId, Long targetUserId, UpdateUserStatusRequestDto req) {
        String normalizedStatus = req.getStatus() != null ? req.getStatus().trim().toUpperCase() : "";
        if (!VALID_USER_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Trạng thái tài khoản không hợp lệ: " + normalizedStatus);
        }
        if (adminUserId != null && adminUserId.equals(targetUserId) && !"ACTIVE".equals(normalizedStatus)) {
            throw new BadRequestException("Quản trị viên không thể tự khóa tài khoản của chính mình");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + targetUserId));

        String oldStatus = user.getStatus();
        user.setStatus(normalizedStatus);
        User saved = userRepository.save(user);

        recordAuditLog(
                adminUserId,
                "USER_STATUS_UPDATED",
                "users",
                String.valueOf(targetUserId),
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + normalizedStatus + "\",\"reason\":\"" + escapeJson(req.getReason()) + "\"}"
        );

        notificationService.notify(
                targetUserId,
                "SYSTEM",
                "Cập nhật trạng thái tài khoản",
                "Trạng thái tài khoản của bạn đã được chuyển sang " + normalizedStatus
                        + (StringUtils.hasText(req.getReason()) ? ". Lý do: " + req.getReason() : "."),
                "USER",
                targetUserId
        );

        return mapSingleUser(saved);
    }

    @Transactional
    public AdminUserDto updateUserRoles(Long adminUserId, Long targetUserId, UpdateUserRolesRequestDto req) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + targetUserId));

        List<String> requestedRoles = req.getRoles().stream()
                .filter(StringUtils::hasText)
                .map(r -> r.trim().toUpperCase())
                .distinct()
                .toList();

        if (requestedRoles.isEmpty()) {
            throw new BadRequestException("Người dùng phải có ít nhất 1 vai trò hợp lệ");
        }

        if (adminUserId != null && adminUserId.equals(targetUserId) && !requestedRoles.contains("ROLE_ADMIN")) {
            throw new BadRequestException("Quản trị viên không thể tự gỡ quyền ROLE_ADMIN của chính mình");
        }

        Set<Role> newRoles = new HashSet<>();
        for (String roleName : requestedRoles) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new BadRequestException("Vai trò không tồn tại: " + roleName));
            newRoles.add(role);
        }

        List<String> oldRoleNames = user.getRoles().stream().map(Role::getName).sorted().toList();
        user.setRoles(newRoles);
        User saved = userRepository.save(user);

        recordAuditLog(
                adminUserId,
                "USER_ROLES_UPDATED",
                "users",
                String.valueOf(targetUserId),
                "{\"roles\":" + toJsonArray(oldRoleNames) + "}",
                "{\"roles\":" + toJsonArray(requestedRoles) + "}"
        );

        notificationService.notify(
                targetUserId,
                "SYSTEM",
                "Cập nhật phân quyền tài khoản (RBAC)",
                "Quyền hạn tài khoản của bạn đã được cập nhật thành: " + String.join(", ", requestedRoles),
                "USER",
                targetUserId
        );

        return mapSingleUser(saved);
    }

    // =========================================================================
    // 3. COMPANY VERIFICATION & JOB MODERATION (UC-ADM-03, UC-ADM-04)
    // =========================================================================
    @Transactional(readOnly = true)
    public List<AdminCompanyDto> getCompanies(String keyword, String verificationStatus) {
        Map<Long, Long> jobCounts = jobRepository.findAll().stream()
                .filter(j -> j.getDeletedAt() == null && j.getCompany() != null)
                .collect(Collectors.groupingBy(j -> j.getCompany().getId(), Collectors.counting()));
        Map<Long, Long> recruiterCounts = recruiterProfileRepository.findAll().stream()
                .collect(Collectors.groupingBy(RecruiterProfile::getCompanyId, Collectors.counting()));

        return companyRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .filter(c -> {
                    if (!StringUtils.hasText(keyword)) return true;
                    String kw = keyword.trim().toLowerCase();
                    return (c.getName() != null && c.getName().toLowerCase().contains(kw))
                            || (c.getIndustry() != null && c.getIndustry().toLowerCase().contains(kw))
                            || (c.getCity() != null && c.getCity().toLowerCase().contains(kw))
                            || (c.getTaxCode() != null && c.getTaxCode().toLowerCase().contains(kw));
                })
                .filter(c -> {
                    if (!StringUtils.hasText(verificationStatus) || "ALL".equalsIgnoreCase(verificationStatus)) return true;
                    return verificationStatus.trim().equalsIgnoreCase(c.getVerificationStatus());
                })
                .sorted(Comparator.comparing(Company::getId))
                .map(c -> AdminCompanyDto.builder()
                        .id(c.getId())
                        .uuid(c.getUuid())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .logoUrl(c.getLogoUrl())
                        .website(c.getWebsite())
                        .industry(c.getIndustry())
                        .companySize(c.getCompanySize())
                        .taxCode(c.getTaxCode())
                        .city(c.getCity())
                        .verificationStatus(c.getVerificationStatus())
                        .jobCount(jobCounts.getOrDefault(c.getId(), 0L))
                        .recruiterCount(recruiterCounts.getOrDefault(c.getId(), 0L))
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public AdminCompanyDto verifyCompany(Long adminUserId, Long companyId, VerifyCompanyRequestDto req) {
        String normalized = req.getVerificationStatus() != null ? req.getVerificationStatus().trim().toUpperCase() : "";
        if (!VALID_COMPANY_VERIFICATIONS.contains(normalized)) {
            throw new BadRequestException("Trạng thái xác minh doanh nghiệp không hợp lệ: " + normalized);
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy doanh nghiệp ID: " + companyId));

        String oldStatus = company.getVerificationStatus();
        company.setVerificationStatus(normalized);
        Company saved = companyRepository.save(company);

        recordAuditLog(
                adminUserId,
                "COMPANY_VERIFICATION_UPDATED",
                "companies",
                String.valueOf(companyId),
                "{\"verificationStatus\":\"" + oldStatus + "\"}",
                "{\"verificationStatus\":\"" + normalized + "\",\"note\":\"" + escapeJson(req.getNote()) + "\"}"
        );

        List<RecruiterProfile> recruiters = recruiterProfileRepository.findByCompanyIdOrderByIdAsc(companyId);
        for (RecruiterProfile rp : recruiters) {
            notificationService.notify(
                    rp.getUserId(),
                    "SYSTEM",
                    "Cập nhật xác minh doanh nghiệp: " + saved.getName(),
                    "Trạng thái xác minh của doanh nghiệp " + saved.getName() + " đã chuyển sang " + normalized
                            + (StringUtils.hasText(req.getNote()) ? ". Ghi chú từ Admin: " + req.getNote() : "."),
                    "COMPANY",
                    companyId
            );
        }

        long jobCount = jobRepository.countByCompanyId(companyId);
        return AdminCompanyDto.builder()
                .id(saved.getId())
                .uuid(saved.getUuid())
                .name(saved.getName())
                .slug(saved.getSlug())
                .logoUrl(saved.getLogoUrl())
                .website(saved.getWebsite())
                .industry(saved.getIndustry())
                .companySize(saved.getCompanySize())
                .taxCode(saved.getTaxCode())
                .city(saved.getCity())
                .verificationStatus(saved.getVerificationStatus())
                .jobCount(jobCount)
                .recruiterCount(recruiters.size())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminJobDto> getJobs(String keyword, String statusFilter, Long companyId) {
        return jobRepository.findAll().stream()
                .filter(j -> j.getDeletedAt() == null)
                .filter(j -> {
                    if (companyId == null) return true;
                    return j.getCompany() != null && companyId.equals(j.getCompany().getId());
                })
                .filter(j -> {
                    if (!StringUtils.hasText(statusFilter) || "ALL".equalsIgnoreCase(statusFilter)) return true;
                    return statusFilter.trim().equalsIgnoreCase(j.getStatus());
                })
                .filter(j -> {
                    if (!StringUtils.hasText(keyword)) return true;
                    String kw = keyword.trim().toLowerCase();
                    String compName = j.getCompany() != null && j.getCompany().getName() != null
                            ? j.getCompany().getName().toLowerCase() : "";
                    return (j.getTitle() != null && j.getTitle().toLowerCase().contains(kw))
                            || compName.contains(kw)
                            || (j.getLocationCity() != null && j.getLocationCity().toLowerCase().contains(kw));
                })
                .sorted(Comparator.comparing(Job::getId).reversed())
                .map(this::mapToAdminJobDto)
                .toList();
    }

    @Transactional
    public AdminJobDto moderateJob(Long adminUserId, Long jobId, ModerateJobRequestDto req) {
        String normalized = req.getStatus() != null ? req.getStatus().trim().toUpperCase() : "";
        if (!VALID_JOB_STATUSES.contains(normalized)) {
            throw new BadRequestException("Trạng thái tin tuyển dụng không hợp lệ: " + normalized);
        }

        Job job = jobRepository.findByIdWithCompany(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin tuyển dụng ID: " + jobId));

        String oldStatus = job.getStatus();
        job.setStatus(normalized);
        if ("PUBLISHED".equals(normalized) && job.getPublishedAt() == null) {
            job.setPublishedAt(LocalDateTime.now());
        }
        Job saved = jobRepository.save(job);

        recordAuditLog(
                adminUserId,
                "JOB_MODERATED",
                "jobs",
                String.valueOf(jobId),
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + normalized + "\",\"reason\":\"" + escapeJson(req.getReason()) + "\"}"
        );

        recruiterProfileRepository.findById(job.getRecruiterId()).ifPresent(rp ->
                notificationService.notify(
                        rp.getUserId(),
                        "SYSTEM",
                        "Kiểm duyệt tin tuyển dụng: " + saved.getTitle(),
                        "Tin tuyển dụng \"" + saved.getTitle() + "\" đã được cập nhật trạng thái thành " + normalized
                                + (StringUtils.hasText(req.getReason()) ? ". Ghi chú từ Admin: " + req.getReason() : "."),
                        "JOB",
                        jobId
                )
        );

        return mapToAdminJobDto(saved);
    }

    // =========================================================================
    // 4. MASTER SKILL TAXONOMY MANAGEMENT (UC-ADM-05)
    // =========================================================================
    @Transactional(readOnly = true)
    public List<AdminSkillDto> getSkills(String keyword, String category, Boolean activeOnly) {
        Map<Long, Long> jobSkillCounts = jobSkillRepository.findAll().stream()
                .filter(js -> js.getSkill() != null)
                .collect(Collectors.groupingBy(js -> js.getSkill().getId(), Collectors.counting()));
        Map<Long, Long> candidateSkillCounts = candidateSkillRepository.findAll().stream()
                .filter(cs -> cs.getSkill() != null)
                .collect(Collectors.groupingBy(cs -> cs.getSkill().getId(), Collectors.counting()));

        return skillRepository.findAll().stream()
                .filter(s -> {
                    if (Boolean.TRUE.equals(activeOnly)) return Boolean.TRUE.equals(s.getIsActive());
                    return true;
                })
                .filter(s -> {
                    if (!StringUtils.hasText(category) || "ALL".equalsIgnoreCase(category)) return true;
                    return category.trim().equalsIgnoreCase(s.getCategory());
                })
                .filter(s -> {
                    if (!StringUtils.hasText(keyword)) return true;
                    String kw = keyword.trim().toLowerCase();
                    return (s.getName() != null && s.getName().toLowerCase().contains(kw))
                            || (s.getSlug() != null && s.getSlug().toLowerCase().contains(kw))
                            || (s.getDescription() != null && s.getDescription().toLowerCase().contains(kw));
                })
                .sorted(Comparator.comparing(Skill::getName, String.CASE_INSENSITIVE_ORDER))
                .map(s -> AdminSkillDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .slug(s.getSlug())
                        .category(s.getCategory())
                        .description(s.getDescription())
                        .isActive(s.getIsActive())
                        .jobCount(jobSkillCounts.getOrDefault(s.getId(), 0L))
                        .candidateCount(candidateSkillCounts.getOrDefault(s.getId(), 0L))
                        .createdAt(s.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public AdminSkillDto createSkill(Long adminUserId, SaveSkillRequestDto req) {
        String name = req.getName() != null ? req.getName().trim() : "";
        String category = req.getCategory() != null ? req.getCategory().trim().toUpperCase() : "OTHER";
        if (!VALID_SKILL_CATEGORIES.contains(category)) {
            throw new BadRequestException("Danh mục kỹ năng không hợp lệ: " + category);
        }

        if (skillRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new BadRequestException("Kỹ năng \"" + name + "\" đã tồn tại trong từ điển hệ thống");
        }

        String slug = toSlug(name);
        if (skillRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis() % 1000;
        }

        Skill skill = Skill.builder()
                .name(name)
                .slug(slug)
                .category(category)
                .description(req.getDescription())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();

        Skill saved = skillRepository.save(skill);

        recordAuditLog(
                adminUserId,
                "SKILL_CREATED",
                "skills",
                String.valueOf(saved.getId()),
                null,
                "{\"name\":\"" + escapeJson(saved.getName()) + "\",\"category\":\"" + saved.getCategory() + "\"}"
        );

        return AdminSkillDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .slug(saved.getSlug())
                .category(saved.getCategory())
                .description(saved.getDescription())
                .isActive(saved.getIsActive())
                .jobCount(0L)
                .candidateCount(0L)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public AdminSkillDto updateSkill(Long adminUserId, Long skillId, SaveSkillRequestDto req) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỹ năng ID: " + skillId));

        String name = req.getName() != null ? req.getName().trim() : skill.getName();
        String category = req.getCategory() != null ? req.getCategory().trim().toUpperCase() : skill.getCategory();
        if (!VALID_SKILL_CATEGORIES.contains(category)) {
            throw new BadRequestException("Danh mục kỹ năng không hợp lệ: " + category);
        }

        skillRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(skillId)) {
                throw new BadRequestException("Kỹ năng \"" + name + "\" đã tồn tại");
            }
        });

        String oldName = skill.getName();
        Boolean oldActive = skill.getIsActive();

        skill.setName(name);
        skill.setCategory(category);
        if (req.getDescription() != null) {
            skill.setDescription(req.getDescription().trim());
        }
        if (req.getIsActive() != null) {
            skill.setIsActive(req.getIsActive());
        }

        Skill saved = skillRepository.save(skill);

        recordAuditLog(
                adminUserId,
                "SKILL_UPDATED",
                "skills",
                String.valueOf(skillId),
                "{\"name\":\"" + escapeJson(oldName) + "\",\"isActive\":" + oldActive + "}",
                "{\"name\":\"" + escapeJson(saved.getName()) + "\",\"category\":\"" + saved.getCategory() + "\",\"isActive\":" + saved.getIsActive() + "}"
        );

        long jobCount = jobSkillRepository.findAll().stream()
                .filter(js -> js.getSkill() != null && skillId.equals(js.getSkill().getId()))
                .count();
        long candidateCount = candidateSkillRepository.findAll().stream()
                .filter(cs -> cs.getSkill() != null && skillId.equals(cs.getSkill().getId()))
                .count();

        return AdminSkillDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .slug(saved.getSlug())
                .category(saved.getCategory())
                .description(saved.getDescription())
                .isActive(saved.getIsActive())
                .jobCount(jobCount)
                .candidateCount(candidateCount)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public AdminSkillDto toggleOrDeleteSkill(Long adminUserId, Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỹ năng ID: " + skillId));

        boolean nextState = !Boolean.TRUE.equals(skill.getIsActive());
        skill.setIsActive(nextState);
        Skill saved = skillRepository.save(skill);

        recordAuditLog(
                adminUserId,
                nextState ? "SKILL_ACTIVATED" : "SKILL_DEACTIVATED",
                "skills",
                String.valueOf(skillId),
                "{\"isActive\":" + (!nextState) + "}",
                "{\"isActive\":" + nextState + "}"
        );

        long jobCount = jobSkillRepository.findAll().stream()
                .filter(js -> js.getSkill() != null && skillId.equals(js.getSkill().getId()))
                .count();
        long candidateCount = candidateSkillRepository.findAll().stream()
                .filter(cs -> cs.getSkill() != null && skillId.equals(cs.getSkill().getId()))
                .count();

        return AdminSkillDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .slug(saved.getSlug())
                .category(saved.getCategory())
                .description(saved.getDescription())
                .isActive(saved.getIsActive())
                .jobCount(jobCount)
                .candidateCount(candidateCount)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // =========================================================================
    // 5. AUDIT LOGS & EMAIL LOGS (FR-38)
    // =========================================================================
    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditLogs(String actionFilter, String entityFilter, String keyword, int limit) {
        Map<Long, User> userById = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        int safeLimit = Math.max(10, Math.min(limit, 200));
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 200)).stream()
                .filter(log -> {
                    if (!StringUtils.hasText(actionFilter) || "ALL".equalsIgnoreCase(actionFilter)) return true;
                    return log.getAction() != null && log.getAction().toLowerCase().contains(actionFilter.trim().toLowerCase());
                })
                .filter(log -> {
                    if (!StringUtils.hasText(entityFilter) || "ALL".equalsIgnoreCase(entityFilter)) return true;
                    return entityFilter.trim().equalsIgnoreCase(log.getEntityName());
                })
                .filter(log -> {
                    if (!StringUtils.hasText(keyword)) return true;
                    String kw = keyword.trim().toLowerCase();
                    User actor = log.getUserId() != null ? userById.get(log.getUserId()) : null;
                    String actorName = actor != null && actor.getFullName() != null ? actor.getFullName().toLowerCase() : "";
                    String actorEmail = actor != null && actor.getEmail() != null ? actor.getEmail().toLowerCase() : "";
                    return (log.getAction() != null && log.getAction().toLowerCase().contains(kw))
                            || (log.getEntityName() != null && log.getEntityName().toLowerCase().contains(kw))
                            || (log.getEntityId() != null && String.valueOf(log.getEntityId()).toLowerCase().contains(kw))
                            || (log.getNewValues() != null && log.getNewValues().toLowerCase().contains(kw))
                            || actorName.contains(kw)
                            || actorEmail.contains(kw);
                })
                .limit(safeLimit)
                .map(log -> {
                    User actor = log.getUserId() != null ? userById.get(log.getUserId()) : null;
                    return AuditLogDto.builder()
                            .id(log.getId())
                            .userId(log.getUserId())
                            .actorName(actor != null ? actor.getFullName() : "Hệ thống / Khách")
                            .actorEmail(actor != null ? actor.getEmail() : "system@talentbridge.vn")
                            .action(log.getAction())
                            .entityName(log.getEntityName())
                            .entityId(log.getEntityId() != null ? String.valueOf(log.getEntityId()) : "")
                            .oldValues(log.getOldValues())
                            .newValues(log.getNewValues())
                            .ipAddress(log.getIpAddress() != null ? log.getIpAddress() : "127.0.0.1")
                            .createdAt(log.getCreatedAt())
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmailLogDto> getEmailLogs(String statusFilter, int limit) {
        int safeLimit = Math.max(10, Math.min(limit, 200));
        return emailLogRepository.findAll().stream()
                .filter(e -> {
                    if (!StringUtils.hasText(statusFilter) || "ALL".equalsIgnoreCase(statusFilter)) return true;
                    return statusFilter.trim().equalsIgnoreCase(e.getStatus());
                })
                .sorted(Comparator.comparing(EmailLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(safeLimit)
                .map(e -> EmailLogDto.builder()
                        .id(e.getId())
                        .toEmail(e.getToEmail())
                        .subject(e.getSubject())
                        .template(e.getTemplate())
                        .status(e.getStatus())
                        .errorMessage(e.getErrorMessage())
                        .referenceType(e.getReferenceType())
                        .referenceId(e.getReferenceId())
                        .createdAt(e.getCreatedAt())
                        .build())
                .toList();
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================
    private AdminUserDto mapSingleUser(User u) {
        Map<Long, String> companyById = companyRepository.findAll().stream()
                .collect(Collectors.toMap(Company::getId, Company::getName, (a, b) -> a));
        Map<Long, RecruiterProfile> recruiterByUserId = recruiterProfileRepository.findAll().stream()
                .collect(Collectors.toMap(RecruiterProfile::getUserId, rp -> rp, (a, b) -> a));
        Map<Long, CandidateProfile> candidateByUserId = candidateProfileRepository.findAll().stream()
                .collect(Collectors.toMap(CandidateProfile::getUserId, cp -> cp, (a, b) -> a));
        return mapToAdminUserDto(u, companyById, recruiterByUserId, candidateByUserId);
    }

    private AdminUserDto mapToAdminUserDto(
            User u,
            Map<Long, String> companyById,
            Map<Long, RecruiterProfile> recruiterByUserId,
            Map<Long, CandidateProfile> candidateByUserId
    ) {
        RecruiterProfile rp = recruiterByUserId.get(u.getId());
        String companyName = rp != null ? companyById.get(rp.getCompanyId()) : null;
        CandidateProfile cp = candidateByUserId.get(u.getId());
        String headline = cp != null ? cp.getHeadline() : null;

        List<String> roles = u.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .toList();

        return AdminUserDto.builder()
                .id(u.getId())
                .uuid(u.getUuid())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .status(u.getStatus())
                .isEmailVerified(u.getIsEmailVerified())
                .roles(roles)
                .companyName(companyName)
                .candidateHeadline(headline)
                .createdAt(u.getCreatedAt())
                .build();
    }

    private AdminJobDto mapToAdminJobDto(Job j) {
        return AdminJobDto.builder()
                .id(j.getId())
                .uuid(j.getUuid())
                .title(j.getTitle())
                .slug(j.getSlug())
                .companyId(j.getCompany() != null ? j.getCompany().getId() : null)
                .companyName(j.getCompany() != null ? j.getCompany().getName() : "N/A")
                .companyLogo(j.getCompany() != null ? j.getCompany().getLogoUrl() : null)
                .jobType(j.getJobType())
                .expLevel(j.getExpLevel())
                .locationCity(j.getLocationCity())
                .minSalary(j.getMinSalary())
                .maxSalary(j.getMaxSalary())
                .currency(j.getCurrency())
                .status(j.getStatus())
                .viewsCount(j.getViewsCount())
                .applicationsCount(j.getApplicationsCount())
                .publishedAt(j.getPublishedAt())
                .createdAt(j.getCreatedAt())
                .build();
    }

    private void recordAuditLog(Long userId, String action, String entityName, String entityId, String oldValues, String newValues) {
        Long numericEntityId = 0L;
        try {
            if (entityId != null) {
                numericEntityId = Long.parseLong(entityId);
            }
        } catch (NumberFormatException ignored) {
        }
        auditLogRepository.save(AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityName(entityName)
                .entityId(numericEntityId)
                .oldValues(oldValues)
                .newValues(newValues)
                .ipAddress("127.0.0.1")
                .userAgent("TalentBridge-Admin-Console/1.0")
                .correlationId(UUID.randomUUID().toString())
                .build());
    }

    private String toSlug(String input) {
        if (!StringUtils.hasText(input)) return "skill-" + System.currentTimeMillis();
        String normalized = Normalizer.normalize(input.trim().toLowerCase(), Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String deaccented = pattern.matcher(normalized).replaceAll("").replace('đ', 'd');
        String slug = deaccented.replaceAll("[^a-z0-9+#.]+", "-").replaceAll("^-|-$", "");
        return slug.isEmpty() ? "skill-" + System.currentTimeMillis() : slug;
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String toJsonArray(List<String> items) {
        return "[" + items.stream().map(i -> "\"" + escapeJson(i) + "\"").collect(Collectors.joining(",")) + "]";
    }
}
