package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.CompanyResponseDto;

import java.util.List;

public interface CompanyService {

    List<CompanyResponseDto> getAllCompanies();

    CompanyResponseDto getCompanyById(Long id);

    CompanyResponseDto getCompanyBySlug(String slug);
}
