package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.CompanyCreateRequestDto;
import com.talentbridge.backend.dto.CompanyResponseDto;
import com.talentbridge.backend.dto.CompanyUpdateRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;

import java.util.List;

public interface CompanyService {

    List<CompanyResponseDto> getAllCompanies();

    CompanyResponseDto getCompanyById(Long id);

    CompanyResponseDto getCompanyBySlug(String slug);

    List<JobResponseDto> getJobsByCompany(Long companyId);

    CompanyResponseDto createCompany(CompanyCreateRequestDto request);

    CompanyResponseDto updateCompany(Long id, CompanyUpdateRequestDto request);

    void deleteCompany(Long id);
}
