package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.UserProfileResponseDto;
import com.talentbridge.backend.dto.UserProfileUpdateRequestDto;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "5. User Profile", description = "Xem và cập nhật thông tin cá nhân của ứng viên và nhà tuyển dụng")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Current User Profile", description = "Retrieve full profile information for currently authenticated user.")
    public ResponseEntity<ApiResponse<UserProfileResponseDto>> getCurrentProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        UserProfileResponseDto profile = userService.getCurrentUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update Current User Profile", description = "Modify personal and professional profile details.")
    public ResponseEntity<ApiResponse<UserProfileResponseDto>> updateCurrentProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserProfileUpdateRequestDto request
    ) {
        UserProfileResponseDto updated = userService.updateCurrentUserProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ thành công", updated));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List Users (Admin only)", description = "Paginated list of all users in the system.")
    public ResponseEntity<ApiResponse<PageResponse<UserProfileResponseDto>>> getAllUsers(
            @Parameter(description = "Page number", example = "0")
            @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Items per page", example = "20")
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        PageResponse<UserProfileResponseDto> response = userService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change User Account Status (Admin only)", description = "Activate or ban a user account.")
    public ResponseEntity<ApiResponse<UserProfileResponseDto>> updateUserStatus(
            @PathVariable Long id,
            @Parameter(description = "Account status ('ACTIVE', 'BANNED', 'SUSPENDED')", example = "BANNED")
            @RequestParam String status
    ) {
        UserProfileResponseDto updated = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái tài khoản thành công", updated));
    }
}
