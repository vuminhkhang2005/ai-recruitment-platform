package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.AuthResponseDto;
import com.talentbridge.backend.dto.TeamDtos;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Enterprise Hiring Team", description = "Quản lý đội ngũ tuyển dụng, vai trò thành viên và lời mời gia nhập")
public class TeamController {

    private final TeamService teamService;
    private final JwtCookieHelper cookieHelper;

    @GetMapping("/api/v1/team/overview")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Xem tổng quan đội ngũ tuyển dụng của công ty")
    public ResponseEntity<ApiResponse<TeamDtos.TeamOverview>> getTeamOverview(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.overview(userPrincipal.getId())));
    }

    @GetMapping("/api/v1/team/members")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Danh sách thành viên đang hoạt động (dùng cho phân công hội đồng phỏng vấn)")
    public ResponseEntity<ApiResponse<List<TeamDtos.MemberDto>>> getActiveMembers(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.activeMembers(userPrincipal.getId())));
    }

    @PostMapping("/api/v1/team/invitations")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Gửi lời mời tham gia đội tuyển dụng qua email (Chỉ Quản trị viên công ty)")
    public ResponseEntity<ApiResponse<TeamDtos.InvitationDto>> inviteMember(
            @Valid @RequestBody TeamDtos.InviteRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamDtos.InvitationDto invitation = teamService.invite(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã gửi lời mời tham gia thành công", invitation));
    }

    @PostMapping("/api/v1/team/invitations/{id}/resend")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Gửi lại lời mời tham gia")
    public ResponseEntity<ApiResponse<TeamDtos.InvitationDto>> resendInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamDtos.InvitationDto invitation = teamService.resend(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi lại lời mời", invitation));
    }

    @DeleteMapping("/api/v1/team/invitations/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Thu hồi lời mời tham gia")
    public ResponseEntity<ApiResponse<Void>> revokeInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        teamService.revoke(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã thu hồi lời mời", null));
    }

    @PatchMapping("/api/v1/team/members/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Cập nhật vai trò hoặc chức danh thành viên")
    public ResponseEntity<ApiResponse<TeamDtos.MemberDto>> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody TeamDtos.UpdateMemberRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamDtos.MemberDto updated = teamService.updateMember(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật thông tin thành viên", updated));
    }

    @PostMapping("/api/v1/team/members/{id}/deactivate")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Vô hiệu hoá tài khoản thành viên trong công ty")
    public ResponseEntity<ApiResponse<TeamDtos.MemberDto>> deactivateMember(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamDtos.MemberDto updated = teamService.deactivateMember(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá tài khoản thành viên", updated));
    }

    @PostMapping("/api/v1/team/members/{id}/reactivate")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
    @Operation(summary = "Kích hoạt lại tài khoản thành viên")
    public ResponseEntity<ApiResponse<TeamDtos.MemberDto>> reactivateMember(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamDtos.MemberDto updated = teamService.reactivateMember(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã kích hoạt lại tài khoản thành viên", updated));
    }

    // ------------------------------------------------------------- Public Invitation Flow

    @GetMapping("/api/v1/auth/invitations/{token}")
    @Operation(summary = "Xem thông tin lời mời (Công khai)")
    public ResponseEntity<ApiResponse<TeamDtos.InvitationPreview>> previewInvitation(
            @PathVariable String token
    ) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.preview(token)));
    }

    @PostMapping("/api/v1/auth/invitations/{token}/accept")
    @Operation(summary = "Chấp nhận lời mời & Đăng ký tài khoản nhà tuyển dụng (Công khai)")
    public ResponseEntity<ApiResponse<AuthResponseDto>> acceptInvitation(
            @PathVariable String token,
            @Valid @RequestBody TeamDtos.AcceptInvitationRequest request,
            HttpServletRequest httpRequest
    ) {
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);

        AuthResponseDto authResponse = teamService.accept(token, request, ipAddress, userAgent);

        ResponseCookie accessCookie = cookieHelper.createAccessTokenCookie(authResponse.getAccessToken());
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(authResponse.getRefreshToken());

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.ok("Gia nhập đội ngũ tuyển dụng thành công", authResponse));
    }
}
