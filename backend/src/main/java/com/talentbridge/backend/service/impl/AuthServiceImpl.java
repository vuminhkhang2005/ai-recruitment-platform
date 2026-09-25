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

        Role role = roleRepository.findByName(targetRoleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(targetRoleName)
                        .description("Tự động tạo cho đăng ký: " + targetRoleName)
                        .build()));

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

        // Tạo hồ sơ ứng viên hoặc nhà tuyển dụng mặc định
        if ("ROLE_RECRUITER".equals(targetRoleName)) {
            recruiterProfileRepository.save(RecruiterProfile.builder()
                    .userId(savedUser.getId())
                    .companyId(request.getCompanyId() != null ? request.getCompanyId() : 2L) // Default VNG
                    .jobTitle("Chuyên viên tuyển dụng")
                    .isCompanyAdmin(false)
                    .build());
        } else {
            candidateProfileRepository.save(CandidateProfile.builder()
                    .uuid(UUID.randomUUID().toString())
                    .userId(savedUser.getId())
                    .headline("Software Engineer")
                    .city("TP. Hồ Chí Minh")
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

    @Override
    @Transactional
    public AuthResponseDto loginWithOAuth2(OAuth2LoginRequestDto request, String ipAddress, String userAgent) {
        String email = request.getEmail();
        String fullName = request.getFullName();
        String avatarUrl = request.getAvatarUrl();

        // Nếu có token Google/LinkedIn gửi lên, thử trích xuất thông tin
        if (StringUtils.hasText(request.getToken()) && !StringUtils.hasText(email)) {
            // Giả lập trích xuất payload từ token (hoặc parse JWT header/claims)
            email = "user." + request.getProvider().toLowerCase() + "@talentbridge.vn";
            fullName = "Người dùng " + request.getProvider();
        }

        if (!StringUtils.hasText(email)) {
            email = "oauth." + UUID.randomUUID().toString().substring(0, 8) + "@talentbridge.vn";
        }
        if (!StringUtils.hasText(fullName)) {
            fullName = "OAuth2 " + request.getProvider() + " User";
        }

        final String userEmail = email.trim().toLowerCase();
        final String userFullName = fullName.trim();
        final String userAvatar = avatarUrl;

        User user = userRepository.findByEmail(userEmail)
                .orElseGet(() -> {
                    Role role = roleRepository.findByName("ROLE_CANDIDATE")
                            .orElseGet(() -> roleRepository.save(Role.builder()
                                    .name("ROLE_CANDIDATE")
                                    .description("Ứng viên mặc định từ OAuth2")
                                    .build()));

                    User newUser = User.builder()
                            .uuid(UUID.randomUUID().toString())
                            .email(userEmail)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                            .fullName(userFullName)
                            .avatarUrl(userAvatar)
                            .status("ACTIVE")
                            .isEmailVerified(true)
                            .roles(new HashSet<>(Collections.singletonList(role)))
                            .build();

                    User created = userRepository.save(newUser);
                    candidateProfileRepository.save(CandidateProfile.builder()
                            .uuid(UUID.randomUUID().toString())
                            .userId(created.getId())
                            .headline("Candidate via " + request.getProvider())
                            .city("Toàn quốc")
                            .build());
                    return created;
                });

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        return issueTokens(userPrincipal, user, ipAddress, userAgent);
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
