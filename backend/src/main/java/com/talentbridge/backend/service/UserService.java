package com.talentbridge.backend.service;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.UserProfileResponseDto;
import com.talentbridge.backend.dto.UserProfileUpdateRequestDto;

public interface UserService {

    UserProfileResponseDto getCurrentUserProfile(Long userId);

    UserProfileResponseDto updateCurrentUserProfile(Long userId, UserProfileUpdateRequestDto request);

    PageResponse<UserProfileResponseDto> getAllUsers(int page, int size);

    UserProfileResponseDto updateUserStatus(Long userId, String status);
}
