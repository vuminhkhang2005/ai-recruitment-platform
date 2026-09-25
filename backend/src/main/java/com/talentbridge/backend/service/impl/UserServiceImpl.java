package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.UserProfileResponseDto;
import com.talentbridge.backend.dto.UserProfileUpdateRequestDto;
import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.entity.Role;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.CompanyRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import com.talentbridge.backend.repository.UserRepository;
import com.talentbridge.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDto getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        return buildProfileDto(user);
    }

    @Override
    @Transactional
    public UserProfileResponseDto updateCurrentUserProfile(Long userId, UserProfileUpdateRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        userRepository.save(user);

        // Update candidate profile if user is a candidate
        candidateProfileRepository.findByUserId(userId).ifPresent(cp -> {
            if (StringUtils.hasText(request.getHeadline())) {
                cp.setHeadline(request.getHeadline().trim());
            }
            if (StringUtils.hasText(request.getCity())) {
                cp.setCity(request.getCity().trim());
            }
            if (StringUtils.hasText(request.getCountry())) {
                cp.setCountry(request.getCountry().trim());
            }
            if (request.getIsOpenToWork() != null) {
                cp.setIsOpenToWork(request.getIsOpenToWork());
            }
            candidateProfileRepository.save(cp);
        });

        // Update recruiter profile if user is a recruiter
        recruiterProfileRepository.findByUserId(userId).ifPresent(rp -> {
            if (StringUtils.hasText(request.getJobTitle())) {
                rp.setJobTitle(request.getJobTitle().trim());
                recruiterProfileRepository.save(rp);
            }
        });

        return buildProfileDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponseDto> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserProfileResponseDto> dtos = userPage.getContent().stream()
                .map(this::buildProfileDto)
                .toList();

        return PageResponse.<UserProfileResponseDto>builder()
                .items(dtos)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public UserProfileResponseDto updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setStatus(status.toUpperCase());
        User saved = userRepository.save(user);
        return buildProfileDto(saved);
    }

    private UserProfileResponseDto buildProfileDto(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        UserProfileResponseDto.UserProfileResponseDtoBuilder builder = UserProfileResponseDto.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .roles(roleNames);

        candidateProfileRepository.findByUserId(user.getId()).ifPresent(cp -> {
            builder.headline(cp.getHeadline())
                    .city(cp.getCity())
                    .country(cp.getCountry())
                    .isOpenToWork(cp.getIsOpenToWork());
        });

        recruiterProfileRepository.findByUserId(user.getId()).ifPresent(rp -> {
            builder.companyId(rp.getCompanyId())
                    .jobTitle(rp.getJobTitle());
            if (rp.getCompanyId() != null) {
                companyRepository.findById(rp.getCompanyId()).ifPresent(comp -> {
                    builder.companyName(comp.getName());
                });
            }
        });

        return builder.build();
    }
}
