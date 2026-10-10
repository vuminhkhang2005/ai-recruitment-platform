package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.AuthResponseDto;
import com.talentbridge.backend.dto.TeamDtos;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.event.DomainEvents;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Enterprise Hiring Team: company admins invite colleagues by e-mail, assign team roles
 * (ADMIN / RECRUITER / INTERVIEWER) and deactivate members who leave.
 */
@Service
@RequiredArgsConstructor
public class TeamService {

    public static final String PENDING = "PENDING";
    public static final String ACCEPTED = "ACCEPTED";
    public static final String REVOKED = "REVOKED";

    private static final SecureRandom RANDOM = new SecureRandom();

    private final HiringTeamService hiringTeamService;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyInvitationRepository invitationRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.invitations.ttl-days:7}")
    private int invitationTtlDays;

    // ------------------------------------------------------------------ overview

    @Transactional(readOnly = true)
    public TeamDtos.TeamOverview overview(Long userId) {
        RecruiterProfile me = hiringTeamService.requireMember(userId);
        Company company = companyRepository.findById(me.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công ty"));
        List<RecruiterProfile> profiles = hiringTeamService.members(company.getId());
        Map<Long, User> users = usersById(profiles.stream().map(RecruiterProfile::getUserId).toList());

        List<TeamDtos.MemberDto> members = profiles.stream()
                .map(rp -> toMember(rp, users.get(rp.getUserId()), userId))
                .sorted(Comparator.comparing((TeamDtos.MemberDto m) -> "SUSPENDED".equals(m.getStatus()))
                        .thenComparing(m -> roleOrder(m.getTeamRole()))
                        .thenComparing(TeamDtos.MemberDto::getRecruiterProfileId))
                .toList();

        List<TeamDtos.InvitationDto> invitations = HiringTeamService.isAdmin(me)
                ? invitationRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(company.getId(), PENDING).stream()
                    .map(this::toInvitation).toList()
                : List.of();

        return TeamDtos.TeamOverview.builder()
                .companyId(company.getId())
                .companyName(company.getName())
                .companyLogo(company.getLogoUrl())
                .myRole(me.getTeamRole())
                .members(members)
                .pendingInvitations(invitations)
                .build();
    }

    /** Active ADMIN/RECRUITER/INTERVIEWER members – used by the interview panel picker. */
    @Transactional(readOnly = true)
    public List<TeamDtos.MemberDto> activeMembers(Long userId) {
        RecruiterProfile me = hiringTeamService.requireMember(userId);
        List<RecruiterProfile> profiles = hiringTeamService.members(me.getCompanyId());
        Map<Long, User> users = usersById(profiles.stream().map(RecruiterProfile::getUserId).toList());
        return profiles.stream()
                .filter(rp -> users.containsKey(rp.getUserId()) && "ACTIVE".equals(users.get(rp.getUserId()).getStatus()))
                .map(rp -> toMember(rp, users.get(rp.getUserId()), userId))
                .toList();
    }

    // ------------------------------------------------------------------ invitations

    @Transactional
    public TeamDtos.InvitationDto invite(Long adminUserId, TeamDtos.InviteRequest request) {
        RecruiterProfile admin = hiringTeamService.requireCompanyAdmin(adminUserId);
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email này đã có tài khoản TalentBridge. Mỗi tài khoản chỉ thuộc một vai trò; vui lòng dùng email công việc khác.");
        }
        // Re-inviting the same address replaces the previous pending invitation.
        invitationRepository.findByCompanyIdAndEmailAndStatus(admin.getCompanyId(), email, PENDING)
                .forEach(old -> old.setStatus(REVOKED));

        CompanyInvitation invitation = invitationRepository.save(CompanyInvitation.builder()
                .companyId(admin.getCompanyId())
                .email(email)
                .fullName(trimOrNull(request.getFullName()))
                .jobTitle(trimOrNull(request.getJobTitle()))
                .teamRole(request.getTeamRole())
                .token(newToken())
                .invitedByUserId(adminUserId)
                .status(PENDING)
                .expiresAt(LocalDateTime.now().plusDays(invitationTtlDays))
                .build());
        eventPublisher.publishEvent(new DomainEvents.TeamInvitationCreated(invitation.getId()));
        return toInvitation(invitation);
    }

    @Transactional
    public TeamDtos.InvitationDto resend(Long adminUserId, Long invitationId) {
        CompanyInvitation invitation = loadInvitationForAdmin(adminUserId, invitationId);
        if (!PENDING.equals(invitation.getStatus())) {
            throw new BadRequestException("Lời mời này không còn hiệu lực");
        }
        invitation.setToken(newToken());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(invitationTtlDays));
        invitation.setInvitedByUserId(adminUserId);
        eventPublisher.publishEvent(new DomainEvents.TeamInvitationCreated(invitation.getId()));
        return toInvitation(invitation);
    }

    @Transactional
    public void revoke(Long adminUserId, Long invitationId) {
        CompanyInvitation invitation = loadInvitationForAdmin(adminUserId, invitationId);
        if (PENDING.equals(invitation.getStatus())) {
            invitation.setStatus(REVOKED);
        }
    }

    @Transactional(readOnly = true)
    public TeamDtos.InvitationPreview preview(String token) {
        CompanyInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Lời mời không tồn tại hoặc đã bị thay thế"));
        Company company = companyRepository.findById(invitation.getCompanyId()).orElse(null);
        return TeamDtos.InvitationPreview.builder()
                .companyName(company != null ? company.getName() : null)
                .companyLogo(company != null ? company.getLogoUrl() : null)
                .email(invitation.getEmail())
                .fullName(invitation.getFullName())
                .jobTitle(invitation.getJobTitle())
                .teamRole(invitation.getTeamRole())
                .invitedByName(userRepository.findById(invitation.getInvitedByUserId()).map(User::getFullName).orElse(null))
                .status(invitation.getStatus())
                .expired(invitation.isExpired())
                .expiresAt(invitation.getExpiresAt())
                .build();
    }

    /** Creates the recruiter account for the invitee, joins the company and signs them in. */
    @Transactional
    public AuthResponseDto accept(String token, TeamDtos.AcceptInvitationRequest request, String ip, String userAgent) {
        CompanyInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Lời mời không tồn tại hoặc đã bị thay thế"));
        if (!PENDING.equals(invitation.getStatus())) {
            throw new BadRequestException(ACCEPTED.equals(invitation.getStatus())
                    ? "Lời mời đã được sử dụng. Vui lòng đăng nhập."
                    : "Lời mời đã bị thu hồi");
        }
        if (invitation.isExpired()) {
            throw new BadRequestException("Lời mời đã hết hạn. Vui lòng liên hệ quản trị viên công ty để được mời lại.");
        }
        if (userRepository.existsByEmail(invitation.getEmail())) {
            throw new BadRequestException("Email đã có tài khoản. Vui lòng đăng nhập.");
        }
        validatePasswordStrength(request.getPassword());

        Role recruiterRole = roleRepository.findByName("ROLE_RECRUITER")
                .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ"));
        User user = userRepository.save(User.builder()
                .uuid(UUID.randomUUID().toString())
                .email(invitation.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(trimOrNull(request.getPhone()))
                .status("ACTIVE")
                .isEmailVerified(true) // proven by opening the e-mailed link
                .roles(new HashSet<>(List.of(recruiterRole)))
                .build());

        recruiterProfileRepository.save(RecruiterProfile.builder()
                .userId(user.getId())
                .companyId(invitation.getCompanyId())
                .jobTitle(StringUtils.hasText(invitation.getJobTitle()) ? invitation.getJobTitle() : defaultTitle(invitation.getTeamRole()))
                .teamRole(invitation.getTeamRole())
                .isCompanyAdmin(HiringTeamService.ADMIN.equals(invitation.getTeamRole()))
                .build());

        invitation.setStatus(ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());

        notificationService.notify(invitation.getInvitedByUserId(), "TEAM_MEMBER_JOINED",
                "Thành viên mới đã tham gia",
                user.getFullName() + " (" + user.getEmail() + ") đã chấp nhận lời mời với vai trò " + roleLabel(invitation.getTeamRole()) + ".",
                "TEAM", invitation.getCompanyId());

        return authService.issueTokensFor(user, ip, userAgent);
    }

    // ------------------------------------------------------------------ members

    @Transactional
    public TeamDtos.MemberDto updateMember(Long adminUserId, Long recruiterProfileId, TeamDtos.UpdateMemberRequest request) {
        RecruiterProfile admin = hiringTeamService.requireCompanyAdmin(adminUserId);
        RecruiterProfile member = loadMemberOfCompany(admin, recruiterProfileId);

        if (StringUtils.hasText(request.getTeamRole()) && !request.getTeamRole().equals(member.getTeamRole())) {
            if (HiringTeamService.isAdmin(member) && activeAdminCount(admin.getCompanyId()) <= 1) {
                throw new BadRequestException("Công ty cần ít nhất một quản trị viên đang hoạt động");
            }
            member.setTeamRole(request.getTeamRole());
            member.setIsCompanyAdmin(HiringTeamService.ADMIN.equals(request.getTeamRole()));
            notificationService.notify(member.getUserId(), "TEAM_ROLE_CHANGED", "Vai trò của bạn đã thay đổi",
                    "Quản trị viên đã chuyển vai trò của bạn thành " + roleLabel(request.getTeamRole()) + ".", "TEAM", member.getCompanyId());
        }
        if (request.getJobTitle() != null) {
            member.setJobTitle(trimOrNull(request.getJobTitle()));
        }
        recruiterProfileRepository.save(member);
        User user = userRepository.findById(member.getUserId()).orElse(null);
        return toMember(member, user, adminUserId);
    }

    /** Offboarding: the account is suspended (history such as notes and scorecards is kept). */
    @Transactional
    public TeamDtos.MemberDto deactivateMember(Long adminUserId, Long recruiterProfileId) {
        RecruiterProfile admin = hiringTeamService.requireCompanyAdmin(adminUserId);
        RecruiterProfile member = loadMemberOfCompany(admin, recruiterProfileId);
        if (member.getUserId().equals(adminUserId)) {
            throw new BadRequestException("Bạn không thể tự vô hiệu hoá tài khoản của mình");
        }
        if (HiringTeamService.isAdmin(member) && activeAdminCount(admin.getCompanyId()) <= 1) {
            throw new BadRequestException("Công ty cần ít nhất một quản trị viên đang hoạt động");
        }
        User user = userRepository.findById(member.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        user.setStatus("SUSPENDED");
        userRepository.save(user);
        userTokenRepository.revokeAllByUserId(user.getId());
        return toMember(member, user, adminUserId);
    }

    @Transactional
    public TeamDtos.MemberDto reactivateMember(Long adminUserId, Long recruiterProfileId) {
        RecruiterProfile admin = hiringTeamService.requireCompanyAdmin(adminUserId);
        RecruiterProfile member = loadMemberOfCompany(admin, recruiterProfileId);
        User user = userRepository.findById(member.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return toMember(member, user, adminUserId);
    }

    // ------------------------------------------------------------------ helpers

    public static void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8 || !password.matches(".*[A-Za-z].*") || !password.matches(".*\\d.*")) {
            throw new BadRequestException("Mật khẩu cần tối thiểu 8 ký tự, gồm cả chữ và số");
        }
    }

    public static String roleLabel(String teamRole) {
        return switch (teamRole == null ? "" : teamRole) {
            case HiringTeamService.ADMIN -> "Quản trị viên";
            case HiringTeamService.INTERVIEWER -> "Người phỏng vấn";
            default -> "Chuyên viên tuyển dụng";
        };
    }

    private static String defaultTitle(String teamRole) {
        return HiringTeamService.INTERVIEWER.equals(teamRole) ? "Người phỏng vấn" : "Chuyên viên tuyển dụng";
    }

    private static int roleOrder(String role) {
        return switch (role == null ? "" : role) {
            case HiringTeamService.ADMIN -> 0;
            case HiringTeamService.RECRUITER -> 1;
            default -> 2;
        };
    }

    private long activeAdminCount(Long companyId) {
        List<RecruiterProfile> admins = hiringTeamService.members(companyId).stream().filter(HiringTeamService::isAdmin).toList();
        Map<Long, User> users = usersById(admins.stream().map(RecruiterProfile::getUserId).toList());
        return admins.stream().filter(rp -> users.containsKey(rp.getUserId()) && "ACTIVE".equals(users.get(rp.getUserId()).getStatus())).count();
    }

    private RecruiterProfile loadMemberOfCompany(RecruiterProfile admin, Long recruiterProfileId) {
        RecruiterProfile member = recruiterProfileRepository.findById(recruiterProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên"));
        if (!member.getCompanyId().equals(admin.getCompanyId())) {
            throw new AccessDeniedException("Thành viên không thuộc công ty của bạn");
        }
        return member;
    }

    private CompanyInvitation loadInvitationForAdmin(Long adminUserId, Long invitationId) {
        RecruiterProfile admin = hiringTeamService.requireCompanyAdmin(adminUserId);
        CompanyInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lời mời"));
        if (!invitation.getCompanyId().equals(admin.getCompanyId())) {
            throw new AccessDeniedException("Lời mời không thuộc công ty của bạn");
        }
        return invitation;
    }

    private Map<Long, User> usersById(Collection<Long> ids) {
        return userRepository.findAllById(ids).stream().collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private TeamDtos.MemberDto toMember(RecruiterProfile rp, User user, Long currentUserId) {
        return TeamDtos.MemberDto.builder()
                .recruiterProfileId(rp.getId())
                .userId(rp.getUserId())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .jobTitle(rp.getJobTitle())
                .teamRole(rp.getTeamRole())
                .status(user != null ? user.getStatus() : "UNKNOWN")
                .me(rp.getUserId().equals(currentUserId))
                .joinedAt(rp.getCreatedAt())
                .build();
    }

    private TeamDtos.InvitationDto toInvitation(CompanyInvitation inv) {
        return TeamDtos.InvitationDto.builder()
                .id(inv.getId())
                .email(inv.getEmail())
                .fullName(inv.getFullName())
                .jobTitle(inv.getJobTitle())
                .teamRole(inv.getTeamRole())
                .status(inv.getStatus())
                .invitedByName(userRepository.findById(inv.getInvitedByUserId()).map(User::getFullName).orElse(null))
                .expiresAt(inv.getExpiresAt())
                .createdAt(inv.getCreatedAt())
                .expired(inv.isExpired())
                .build();
    }

    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static String trimOrNull(String s) {
        return StringUtils.hasText(s) ? s.trim() : null;
    }
}
