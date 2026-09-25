package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.dto.CategoryResponseDto;
import com.talentbridge.backend.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Override
    public List<CategoryResponseDto> getAllCategories() {
        return List.of(
                CategoryResponseDto.builder()
                        .id("tech")
                        .nameVi("Công nghệ thông tin")
                        .nameEn("Information Technology")
                        .icon("code")
                        .jobCount(18L)
                        .build(),
                CategoryResponseDto.builder()
                        .id("finance")
                        .nameVi("Tài chính - Ngân hàng")
                        .nameEn("Finance & Banking")
                        .icon("finance")
                        .jobCount(8L)
                        .build(),
                CategoryResponseDto.builder()
                        .id("marketing")
                        .nameVi("Marketing & Sales")
                        .nameEn("Marketing & Sales")
                        .icon("marketing")
                        .jobCount(12L)
                        .build(),
                CategoryResponseDto.builder()
                        .id("design")
                        .nameVi("Thiết kế UI/UX")
                        .nameEn("UI/UX Design")
                        .icon("design")
                        .jobCount(5L)
                        .build(),
                CategoryResponseDto.builder()
                        .id("hr")
                        .nameVi("Nhân sự")
                        .nameEn("Human Resources")
                        .icon("hr")
                        .jobCount(4L)
                        .build()
        );
    }
}
