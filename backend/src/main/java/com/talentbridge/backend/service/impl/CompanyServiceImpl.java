package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.dto.CompanyCreateRequestDto;
import com.talentbridge.backend.dto.CompanyResponseDto;
import com.talentbridge.backend.dto.CompanyUpdateRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CompanyRepository;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponseDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));
        return mapToDto(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with slug: " + slug));
        return mapToDto(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDto> getJobsByCompany(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        return jobRepository.findByCompanyId(companyId).stream()
                .filter(j -> "PUBLISHED".equals(j.getStatus()) && j.getDeletedAt() == null)
                .map(this::mapJobToDto)
                .toList();
    }

    @Override
    @Transactional
    public CompanyResponseDto createCompany(CompanyCreateRequestDto request) {
        String slug = toSlug(request.getName()) + "-" + UUID.randomUUID().toString().substring(0, 6);

        Company company = Company.builder()
                .uuid(UUID.randomUUID().toString())
                .name(request.getName().trim())
                .slug(slug)
                .logoUrl(StringUtils.hasText(request.getLogoUrl()) ? request.getLogoUrl() : "/logos/default-company.svg")
                .bannerUrl(request.getBannerUrl())
                .website(request.getWebsite())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .taxCode(request.getTaxCode())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .verificationStatus("VERIFIED")
                .build();

        Company saved = companyRepository.save(company);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CompanyResponseDto updateCompany(Long id, CompanyUpdateRequestDto request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

        if (StringUtils.hasText(request.getName())) {
            company.setName(request.getName().trim());
        }
        if (request.getLogoUrl() != null) {
            company.setLogoUrl(request.getLogoUrl());
        }
        if (request.getBannerUrl() != null) {
            company.setBannerUrl(request.getBannerUrl());
        }
        if (request.getWebsite() != null) {
            company.setWebsite(request.getWebsite());
        }
        if (request.getIndustry() != null) {
            company.setIndustry(request.getIndustry());
        }
        if (request.getCompanySize() != null) {
            company.setCompanySize(request.getCompanySize());
        }
        if (request.getTaxCode() != null) {
            company.setTaxCode(request.getTaxCode());
        }
        if (request.getDescription() != null) {
            company.setDescription(request.getDescription());
        }
        if (request.getAddress() != null) {
            company.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            company.setCity(request.getCity());
        }
        if (request.getVerificationStatus() != null) {
            company.setVerificationStatus(request.getVerificationStatus());
        }

        Company updated = companyRepository.save(company);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

        company.setDeletedAt(LocalDateTime.now());
        companyRepository.save(company);
    }

    private CompanyResponseDto mapToDto(Company company) {
        long openJobs = jobRepository.countByCompanyId(company.getId());

        return CompanyResponseDto.builder()
                .id(company.getId())
                .uuid(company.getUuid())
                .name(company.getName())
                .slug(company.getSlug())
                .logoUrl(company.getLogoUrl())
                .bannerUrl(company.getBannerUrl())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .description(company.getDescription())
                .address(company.getAddress())
                .city(company.getCity())
                .verificationStatus(company.getVerificationStatus())
                .openJobsCount(openJobs)
                .build();
    }

    private JobResponseDto mapJobToDto(Job job) {
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
                .postedTimeAgo(calculateTimeAgo(job.getCreatedAt()))
                .aiMatchScore(95)
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
        return "Thương lượng";
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

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
