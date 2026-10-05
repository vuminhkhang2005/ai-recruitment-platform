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
    private final com.talentbridge.backend.service.JobService jobService;

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
                .filter(CompanyServiceImpl::isOpen)
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
        long openJobs = jobRepository.findByCompanyId(company.getId()).stream().filter(CompanyServiceImpl::isOpen).count();

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
        return jobService.toDto(job);
    }

    private static boolean isOpen(Job j) {
        return "PUBLISHED".equals(j.getStatus()) && j.getDeletedAt() == null
                && (j.getDeadline() == null || j.getDeadline().isAfter(LocalDateTime.now()));
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
