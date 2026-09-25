package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.dto.CompanyResponseDto;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CompanyRepository;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

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
}
