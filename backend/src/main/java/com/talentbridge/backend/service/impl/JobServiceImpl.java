package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.entity.JobSkill;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.repository.JobSkillRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;

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
        // Deterministic pseudo-AI match rate in range 92-98%
        int hash = jobId != null ? Math.abs(jobId.hashCode()) % 7 : 0;
        return 92 + hash;
    }
}
