package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.JobCreateRequestDto;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.dto.JobUpdateRequestDto;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.entity.JobSkill;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.entity.Skill;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CompanyRepository;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.repository.JobSkillRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import com.talentbridge.backend.repository.SkillRepository;
import com.talentbridge.backend.service.JobService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final SkillRepository skillRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponseDto> searchJobs(JobFilterRequestDto filter) {
        int page = filter.getPage() != null && filter.getPage() >= 0 ? filter.getPage() : 0;
        int size = filter.getSize() != null && filter.getSize() > 0 ? filter.getSize() : 10;

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("salary".equalsIgnoreCase(filter.getSortBy())) {
            sort = Sort.by(Sort.Direction.DESC, "maxSalary");
        } else if ("views".equalsIgnoreCase(filter.getSortBy())) {
            sort = Sort.by(Sort.Direction.DESC, "viewsCount");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Job> spec = buildSpecification(filter);

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);
        List<JobResponseDto> dtos = jobPage.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<JobResponseDto>builder()
                .items(dtos)
                .page(jobPage.getNumber())
                .size(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .hasNext(jobPage.hasNext())
                .hasPrevious(jobPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public JobResponseDto getJobById(Long id) {
        Job job = jobRepository.findByIdWithCompany(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with ID: " + id));

        // Increment view count
        job.setViewsCount(job.getViewsCount() + 1);
        jobRepository.save(job);

        return mapToDto(job);
    }

    @Override
    @Transactional
    public JobResponseDto getJobByUuid(String uuid) {
        Job job = jobRepository.findByUuidWithCompany(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with UUID: " + uuid));

        job.setViewsCount(job.getViewsCount() + 1);
        jobRepository.save(job);

        return mapToDto(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDto> getFeaturedJobs() {
        return jobRepository.findTop6ByStatusOrderByCreatedAtDesc("PUBLISHED").stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public JobResponseDto createJob(JobCreateRequestDto request, Long recruiterUserId) {
        Long targetCompanyId = request.getCompanyId();
        if (targetCompanyId == null) {
            targetCompanyId = recruiterProfileRepository.findByUserId(recruiterUserId)
                    .map(RecruiterProfile::getCompanyId)
                    .orElse(2L); // Default fallback VNG
        }

        final Long resolvedCompanyId = targetCompanyId;
        Company company = companyRepository.findById(resolvedCompanyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + resolvedCompanyId));

        Long recruiterProfileId = recruiterProfileRepository.findByUserId(recruiterUserId)
                .map(RecruiterProfile::getId)
                .orElseGet(() -> {
                    RecruiterProfile rp = recruiterProfileRepository.save(RecruiterProfile.builder()
                            .userId(recruiterUserId)
                            .companyId(resolvedCompanyId)
                            .jobTitle("Chuyên viên tuyển dụng")
                            .isCompanyAdmin(false)
                            .build());
                    return rp.getId();
                });

        String slug = toSlug(request.getTitle()) + "-" + UUID.randomUUID().toString().substring(0, 8);

        Job job = Job.builder()
                .uuid(UUID.randomUUID().toString())
                .company(company)
                .recruiterId(recruiterProfileId)
                .title(request.getTitle().trim())
                .slug(slug)
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .jobType(StringUtils.hasText(request.getJobType()) ? request.getJobType().toUpperCase() : "FULL_TIME")
                .expLevel(StringUtils.hasText(request.getExpLevel()) ? request.getExpLevel().toUpperCase() : "MIDDLE")
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .currency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency() : "VND")
                .isSalaryNegotiable(Boolean.TRUE.equals(request.getIsSalaryNegotiable()))
                .locationCity(StringUtils.hasText(request.getLocationCity()) ? request.getLocationCity() : "TP. Hồ Chí Minh")
                .locationAddress(request.getLocationAddress())
                .status("PUBLISHED")
                .deadline(request.getDeadline() != null ? request.getDeadline() : LocalDateTime.now().plusDays(30))
                .viewsCount(0)
                .applicationsCount(0)
                .publishedAt(LocalDateTime.now())
                .build();

        Job savedJob = jobRepository.save(job);

        // Attach skills if provided
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            for (String skillName : request.getSkills()) {
                if (StringUtils.hasText(skillName)) {
                    final String trimmedSkill = skillName.trim();
                    Skill skill = skillRepository.findByNameIgnoreCase(trimmedSkill)
                            .orElseGet(() -> skillRepository.save(Skill.builder()
                                    .name(trimmedSkill)
                                    .slug(toSlug(trimmedSkill))
                                    .category("Tech")
                                    .build()));

                    JobSkill jobSkill = JobSkill.builder()
                            .job(savedJob)
                            .skill(skill)
                            .isRequired(true)
                            .minYearsExp(1)
                            .weight(new BigDecimal("1.00"))
                            .build();

                    jobSkillRepository.save(jobSkill);
                }
            }
        }

        return mapToDto(savedJob);
    }

    @Override
    @Transactional
    public JobResponseDto updateJob(Long id, JobUpdateRequestDto request, Long recruiterUserId, boolean isAdmin) {
        Job job = jobRepository.findByIdWithCompany(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));

        Long recruiterProfileId = recruiterProfileRepository.findByUserId(recruiterUserId)
                .map(RecruiterProfile::getId)
                .orElse(recruiterUserId);

        if (!isAdmin && !job.getRecruiterId().equals(recruiterProfileId)) {
            throw new AccessDeniedException("Bạn không có quyền chỉnh sửa tin tuyển dụng này");
        }

        if (StringUtils.hasText(request.getTitle())) {
            job.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            job.setDescription(request.getDescription());
        }
        if (request.getRequirements() != null) {
            job.setRequirements(request.getRequirements());
        }
        if (request.getBenefits() != null) {
            job.setBenefits(request.getBenefits());
        }
        if (StringUtils.hasText(request.getJobType())) {
            job.setJobType(request.getJobType().toUpperCase());
        }
        if (StringUtils.hasText(request.getExpLevel())) {
            job.setExpLevel(request.getExpLevel().toUpperCase());
        }
        if (request.getMinSalary() != null) {
            job.setMinSalary(request.getMinSalary());
        }
        if (request.getMaxSalary() != null) {
            job.setMaxSalary(request.getMaxSalary());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            job.setCurrency(request.getCurrency());
        }
        if (request.getIsSalaryNegotiable() != null) {
            job.setIsSalaryNegotiable(request.getIsSalaryNegotiable());
        }
        if (StringUtils.hasText(request.getLocationCity())) {
            job.setLocationCity(request.getLocationCity());
        }
        if (request.getLocationAddress() != null) {
            job.setLocationAddress(request.getLocationAddress());
        }
        if (StringUtils.hasText(request.getStatus())) {
            job.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getDeadline() != null) {
            job.setDeadline(request.getDeadline());
        }

        if (request.getSkills() != null) {
            jobSkillRepository.deleteByJobId(job.getId());
            for (String skillName : request.getSkills()) {
                if (StringUtils.hasText(skillName)) {
                    final String trimmedSkill = skillName.trim();
                    Skill skill = skillRepository.findByNameIgnoreCase(trimmedSkill)
                            .orElseGet(() -> skillRepository.save(Skill.builder()
                                    .name(trimmedSkill)
                                    .slug(toSlug(trimmedSkill))
                                    .category("Tech")
                                    .build()));

                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skill(skill)
                            .isRequired(true)
                            .minYearsExp(1)
                            .weight(new BigDecimal("1.00"))
                            .build();

                    jobSkillRepository.save(jobSkill);
                }
            }
        }

        Job updatedJob = jobRepository.save(job);
        return mapToDto(updatedJob);
    }

    @Override
    @Transactional
    public JobResponseDto updateJobStatus(Long id, String status, Long recruiterUserId, boolean isAdmin) {
        Job job = jobRepository.findByIdWithCompany(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));

        Long recruiterProfileId = recruiterProfileRepository.findByUserId(recruiterUserId)
                .map(RecruiterProfile::getId)
                .orElse(recruiterUserId);

        if (!isAdmin && !job.getRecruiterId().equals(recruiterProfileId)) {
            throw new AccessDeniedException("Bạn không có quyền thay đổi trạng thái tin tuyển dụng này");
        }

        job.setStatus(status.toUpperCase());
        Job saved = jobRepository.save(job);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteJob(Long id, Long recruiterUserId, boolean isAdmin) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));

        Long recruiterProfileId = recruiterProfileRepository.findByUserId(recruiterUserId)
                .map(RecruiterProfile::getId)
                .orElse(recruiterUserId);

        if (!isAdmin && !job.getRecruiterId().equals(recruiterProfileId)) {
            throw new AccessDeniedException("Bạn không có quyền xóa tin tuyển dụng này");
        }

        job.setStatus("CLOSED");
        job.setDeletedAt(LocalDateTime.now());
        jobRepository.save(job);
    }

    private Specification<Job> buildSpecification(JobFilterRequestDto filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter active/published jobs
            predicates.add(cb.equal(root.get("status"), "PUBLISHED"));

            // Keyword search in title or description or company name
            if (filter.getKeyword() != null && !filter.getKeyword().trim().isEmpty()) {
                String searchPattern = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                Join<Job, Company> companyJoin = root.join("company", JoinType.LEFT);

                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate companyMatch = cb.like(cb.lower(companyJoin.get("name")), searchPattern);

                predicates.add(cb.or(titleMatch, descMatch, companyMatch));
            }

            // City location filter
            if (filter.getCity() != null && !filter.getCity().trim().isEmpty() && !"All".equalsIgnoreCase(filter.getCity())) {
                predicates.add(cb.like(cb.lower(root.get("locationCity")), "%" + filter.getCity().trim().toLowerCase() + "%"));
            }

            // Experience level filter
            if (filter.getExpLevel() != null && !filter.getExpLevel().trim().isEmpty() && !"All".equalsIgnoreCase(filter.getExpLevel())) {
                predicates.add(cb.equal(root.get("expLevel"), filter.getExpLevel().trim().toUpperCase()));
            }

            // Job type filter
            if (filter.getJobType() != null && !filter.getJobType().trim().isEmpty() && !"All".equalsIgnoreCase(filter.getJobType())) {
                predicates.add(cb.equal(root.get("jobType"), filter.getJobType().trim().toUpperCase()));
            }

            // Salary Range filters
            if (filter.getMinSalary() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxSalary"), filter.getMinSalary()));
            }
            if (filter.getMaxSalary() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("minSalary"), filter.getMaxSalary()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private JobResponseDto mapToDto(Job job) {
        List<String> skills = new ArrayList<>();
        try {
            List<JobSkill> jobSkills = jobSkillRepository.findByJobId(job.getId());
            if (jobSkills != null) {
                skills = jobSkills.stream()
                        .map(js -> js.getSkill().getName())
                        .toList();
            }
        } catch (Exception ignored) {
        }

        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Enterprise";
        String companyLogo = job.getCompany() != null ? job.getCompany().getLogoUrl() : "/logos/vinai.svg";
        String companyCity = job.getCompany() != null ? job.getCompany().getCity() : job.getLocationCity();

        return JobResponseDto.builder()
                .id(job.getId())
                .uuid(job.getUuid())
                .title(job.getTitle())
                .slug(job.getSlug())
                .companyId(job.getCompany() != null ? job.getCompany().getId() : null)
                .companyName(companyName)
                .companyLogo(companyLogo)
                .companyCity(companyCity)
                .locationCity(job.getLocationCity())
                .locationAddress(job.getLocationAddress())
                .jobType(job.getJobType())
                .expLevel(job.getExpLevel())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .currency(job.getCurrency())
                .salaryFormatted(formatSalary(job.getMinSalary(), job.getMaxSalary(), job.getCurrency(), job.getIsSalaryNegotiable()))
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .status(job.getStatus())
                .deadline(job.getDeadline())
                .viewsCount(job.getViewsCount())
                .applicationsCount(job.getApplicationsCount())
                .skills(skills)
                .postedTimeAgo(calculateTimeAgo(job.getCreatedAt()))
                .aiMatchScore(calculateAiScore(job.getId()))
                .urgent(job.getViewsCount() > 30 || job.getApplicationsCount() > 10)
                .bonus(job.getBenefits() != null && job.getBenefits().contains("Thưởng") ? "Thưởng hấp dẫn" : "Thưởng tháng 13")
                .build();
    }

    private String formatSalary(BigDecimal min, BigDecimal max, String currency, Boolean isNegotiable) {
        if (Boolean.TRUE.equals(isNegotiable) || (min == null && max == null)) {
            return "Thỏa thuận";
        }
        if (min != null && max != null) {
            BigDecimal minMil = min.divide(new BigDecimal("1000000"), 0, RoundingMode.HALF_UP);
            BigDecimal maxMil = max.divide(new BigDecimal("1000000"), 0, RoundingMode.HALF_UP);
            return minMil + " - " + maxMil + " Triệu VNĐ";
        }
        if (min != null) {
            BigDecimal minMil = min.divide(new BigDecimal("1000000"), 0, RoundingMode.HALF_UP);
            return "Từ " + minMil + " Triệu VNĐ";
        }
        BigDecimal maxMil = max.divide(new BigDecimal("1000000"), 0, RoundingMode.HALF_UP);
        return "Lên đến " + maxMil + " Triệu VNĐ";
    }

    private String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) return "Vừa đăng";
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long hours = duration.toHours();
        if (hours < 1) return "Vừa đăng";
        if (hours < 24) return hours + " giờ trước";
        long days = duration.toDays();
        return days + " ngày trước";
    }

    private Integer calculateAiScore(Long jobId) {
        int hash = jobId != null ? Math.abs(jobId.hashCode()) % 7 : 0;
        return 92 + hash;
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
