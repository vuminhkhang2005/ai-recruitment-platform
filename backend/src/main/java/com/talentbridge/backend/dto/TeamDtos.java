package com.talentbridge.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** Enterprise hiring team: members, roles and invitations. */
public final class TeamDtos {

    private TeamDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InviteRequest {
        @NotBlank(message = "Vui lòng nhập email")
        @Email(message = "Email không hợp lệ")
        private String email;
        @Size(max = 100)
        private String fullName;
        @Size(max = 100)
        private String jobTitle;
        @NotBlank(message = "Vui lòng chọn vai trò")
        @Pattern(regexp = "ADMIN|RECRUITER|INTERVIEWER", message = "Vai trò không hợp lệ")
        private String teamRole;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMemberRequest {
        @Pattern(regexp = "ADMIN|RECRUITER|INTERVIEWER", message = "Vai trò không hợp lệ")
        private String teamRole;
        @Size(max = 100)
        private String jobTitle;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcceptInvitationRequest {
        @NotBlank(message = "Vui lòng nhập họ tên")
        @Size(max = 100)
        private String fullName;
        @NotBlank(message = "Vui lòng nhập mật khẩu")
        @Size(min = 8, max = 72, message = "Mật khẩu cần từ 8 ký tự")
        private String password;
        @Size(max = 20)
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberDto {
        private Long recruiterProfileId;
        private Long userId;
        private String fullName;
        private String email;
        private String avatarUrl;
        private String jobTitle;
        private String teamRole;
        private String status;
        private Boolean me;
        private LocalDateTime joinedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvitationDto {
        private Long id;
        private String email;
        private String fullName;
        private String jobTitle;
        private String teamRole;
        private String status;
        private String invitedByName;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
        private Boolean expired;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamOverview {
        private Long companyId;
        private String companyName;
        private String companyLogo;
        private String myRole;
        private List<MemberDto> members;
        private List<InvitationDto> pendingInvitations;
    }

    /** Public preview shown on the accept-invitation page. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvitationPreview {
        private String companyName;
        private String companyLogo;
        private String email;
        private String fullName;
        private String jobTitle;
        private String teamRole;
        private String invitedByName;
        private String status;
        private Boolean expired;
        private LocalDateTime expiresAt;
    }
}
