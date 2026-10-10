package com.talentbridge.backend.service.impl;

import com.talentbridge.backend.dto.*;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserTokenRepository userTokenRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request, String ipAddress, String userAgent) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email đã được sử dụng: " + request.getEmail());
        }

        String rawRole = StringUtils.hasText(request.getRole()) ? request.getRole().trim().toUpperCase() : "ROLE_CANDIDATE";
        final String targetRoleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;
        if (!"ROLE_CANDIDATE".equals(targetRoleName) && !"ROLE_RECRUITER".equals(targetRoleName)) {
            throw new BadRequestException("Chỉ có thể đăng ký tài khoản Ứng viên hoặc Nhà tuyển dụng.");
        }

        // Recruiters must belong to a company. Self-service registration can only create a NEW company
        // (the creator becomes its team admin); joining an existing company requires an invitation
        // from that company's admin, otherwise anyone could read another company's applicants.
        Long recruiterCompanyId = null;
        if ("ROLE_RECRUITER".equals(targetRoleName)) {
            if (request.getCompanyId() != null) {
                companyRepository.findById(request.getCompanyId())
                        .orElseThrow(() -> new BadRequestException("Công ty không tồn tại"));
                throw new BadRequestException("Công ty này đã có đội tuyển dụng trên TalentBridge. Vui lòng nhờ quản trị viên công ty gửi lời mời tham gia qua email.");
            } else if (StringUtils.hasText(request.getCompanyName())) {
                String name = request.getCompanyName().trim();
                String slug = java.text.Normalizer.normalize(name.replaceAll("\\s+", "-"), java.text.Normalizer.Form.NFD)
                        .replaceAll("[^\\w-]", "").toLowerCase(Locale.ENGLISH) + "-" + UUID.randomUUID().toString().substring(0, 6);
                recruiterCompanyId = companyRepository.save(Company.builder()
                        .uuid(UUID.randomUUID().toString())
                        .name(name)
                        .slug(slug)
                        .verificationStatus("PENDING")
                        .build()).getId();
            } else {
                throw new BadRequestException("Nhà tuyển dụng cần chọn hoặc nhập tên công ty.");
            }
        }

        Role role = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ"));

        User user = User.builder()
                .uuid(UUID.randomUUID().toString())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .status("ACTIVE")
                .isEmailVerified(true)
                .roles(new HashSet<>(Collections.singletonList(role)))
                .build();

        User savedUser = userRepository.save(user);

        if ("ROLE_RECRUITER".equals(targetRoleName)) {
            recruiterProfileRepository.save(RecruiterProfile.builder()
                    .userId(savedUser.getId())
                    .companyId(recruiterCompanyId)
                    .jobTitle("Chuyên viên tuyển dụng")
                    .teamRole("ADMIN")
                    .isCompanyAdmin(true)
                    .build());
        } else {
            candidateProfileRepository.save(CandidateProfile.builder()
                    .uuid(UUID.randomUUID().toString())
                    .userId(savedUser.getId())
                    .country("Vietnam")
                    .isOpenToWork(true)
                    .visibility("PUBLIC")
                    .build());
        }

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        return issueTokens(userPrincipal, savedUser, ipAddress, userAgent);
    }

    @Override
    @Transactional
    public AuthResponseDto login(LoginRequestDto request, String ipAddress, String userAgent) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim().toLowerCase(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Email hoặc mật khẩu không chính xác");
        } catch (DisabledException ex) {
            throw new BadRequestException("Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return issueTokens(userPrincipal, user, ipAddress, userAgent);
    }

    @Override
    @Transactional
    public AuthResponseDto refreshToken(String rawRefreshToken, String ipAddress, String userAgent) {
        if (!StringUtils.hasText(rawRefreshToken)) {
            throw new BadRequestException("Refresh token không được để trống");
        }

        String tokenHash = hashToken(rawRefreshToken);
        UserToken userToken = userTokenRepository.findByTokenHashAndIsRevokedFalse(tokenHash)
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ hoặc đã bị thu hồi"));

        if (userToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            userToken.setIsRevoked(true);
            userTokenRepository.save(userToken);
            throw new BadRequestException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = userRepository.findById(userToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng liên kết với token không tồn tại"));

        // Thu hồi token cũ và phát hành cặp token mới (Token Rotation pattern)
        userToken.setIsRevoked(true);
        userTokenRepository.save(userToken);

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        return issueTokens(userPrincipal, user, ipAddress, userAgent);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken, Long currentUserId) {
        if (StringUtils.hasText(rawRefreshToken)) {
            String tokenHash = hashToken(rawRefreshToken);
            userTokenRepository.findByTokenHashAndIsRevokedFalse(tokenHash).ifPresent(token -> {
                token.setIsRevoked(true);
                userTokenRepository.save(token);
            });
        }
        if (currentUserId != null) {
            userTokenRepository.revokeAllByUserId(currentUserId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng hiện tại"));
        return mapToSummaryDto(user);
    }

    /**
     * Social login is intentionally disabled until real Google/LinkedIn client credentials are configured.
     * The previous implementation trusted an e-mail sent by the browser, which allowed account takeover.
     */
    @Override
    public AuthResponseDto loginWithOAuth2(OAuth2LoginRequestDto request, String ipAddress, String userAgent) {
        throw new BadRequestException("Đăng nhập bằng " + (request.getProvider() != null ? request.getProvider() : "OAuth2")
                + " chưa được cấu hình trên máy chủ này. Vui lòng đăng nhập bằng email và mật khẩu.");
    }

    @Override
    @Transactional
    public AuthResponseDto issueTokensFor(User user, String ipAddress, String userAgent) {
        return issueTokens(UserPrincipal.create(user), user, ipAddress, userAgent);
    }

    @Override
    @Transactional
    public AuthResponseDto changePassword(Long userId, ChangePasswordRequestDto request, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }
        com.talentbridge.backend.service.TeamService.validatePasswordStrength(request.getNewPassword());
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        // Sign out every other device, then hand this session a fresh token pair.
        userTokenRepository.revokeAllByUserId(userId);
        return issueTokens(UserPrincipal.create(user), user, ipAddress, userAgent);
    }

    private AuthResponseDto issueTokens(UserPrincipal userPrincipal, User user, String ipAddress, String userAgent) {
        String accessToken = jwtTokenProvider.generateAccessToken(userPrincipal);
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken();

        // Lưu refresh token vào CSDL với mã băm SHA-256
        String tokenHash = hashToken(rawRefreshToken);
        LocalDateTime expiry = LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpirationMs() / 1000);

        userTokenRepository.save(UserToken.builder()
                .userId(user.getId())
                .tokenHash(tokenHash)
                .deviceInfo(userAgent != null ? (userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent) : "Unknown")
                .ipAddress(ipAddress != null ? (ipAddress.length() > 45 ? ipAddress.substring(0, 45) : ipAddress) : "127.0.0.1")
                .expiresAt(expiry)
                .isRevoked(false)
                .build());

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToSummaryDto(user))
                .build();
    }

    private UserSummaryDto mapToSummaryDto(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return UserSummaryDto.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .roles(roles)
                .build();
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(rawToken.hashCode());
        }
    }
}
