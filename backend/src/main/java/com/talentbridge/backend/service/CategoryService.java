package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.CategoryResponseDto;

import java.util.List;

public interface CategoryService {

    List<CategoryResponseDto> getAllCategories();
}
