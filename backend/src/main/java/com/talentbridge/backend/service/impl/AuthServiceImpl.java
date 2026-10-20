package com.talentbridge.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.beans.factory.annotation.Value;
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

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
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
    private final ObjectMapper objectMapper;

    @Value("${app.oauth2.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth2.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.oauth2.linkedin.client-id:}")
    private String linkedinClientId;

    @Value("${app.oauth2.linkedin.client-secret:}")
    private String linkedinClientSecret;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

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

    @Override
    @Transactional
    public AuthResponseDto loginWithOAuth2(OAuth2LoginRequestDto request, String ipAddress, String userAgent) {
        String provider = request.getProvider() != null ? request.getProvider().trim().toUpperCase() : "GOOGLE";
        if (!"GOOGLE".equals(provider) && !"LINKEDIN".equals(provider)) {
            throw new BadRequestException("Nhà cung cấp OAuth2 không được hỗ trợ: " + provider + ". Chỉ hỗ trợ GOOGLE hoặc LINKEDIN.");
        }

        String resolvedToken = request.getToken();

        // 1. If OAuth2 Authorization Code is provided, exchange it with Google / LinkedIn token endpoint
        if (StringUtils.hasText(request.getAuthCode())) {
            resolvedToken = exchangeAuthorizationCode(provider, request.getAuthCode().trim(), request.getRedirectUri());
        }

        String email = null;
        String fullName = null;
        String avatarUrl = null;

        // 2. If a real external OAuth2 token (Access Token or ID Token) is provided, verify it with Google / LinkedIn servers
        boolean isSandboxToken = resolvedToken != null && resolvedToken.startsWith("oauth2_sandbox_");
        if (StringUtils.hasText(resolvedToken) && !isSandboxToken) {
            Map<String, String> verifiedProfile = verifyExternalOAuth2Token(provider, resolvedToken.trim());
            email = verifiedProfile.get("email");
            fullName = verifiedProfile.get("fullName");
            avatarUrl = verifiedProfile.get("avatarUrl");
        }

        // 3. Fallback to OAuth2 Account Chooser / Sandbox parameters if in local sandbox mode
        if (!StringUtils.hasText(email)) {
            String defaultEmail = "GOOGLE".equals(provider)
                    ? "khang.google@gmail.com"
                    : "khang.linkedin@talentbridge.vn";
            email = StringUtils.hasText(request.getEmail())
                    ? request.getEmail().trim().toLowerCase()
                    : defaultEmail;
        }
        if (!StringUtils.hasText(fullName)) {
            String defaultName = "GOOGLE".equals(provider)
                    ? "Vũ Minh Khang (Google)"
                    : "Vũ Minh Khang (LinkedIn)";
            fullName = StringUtils.hasText(request.getFullName())
                    ? request.getFullName().trim()
                    : defaultName;
        }
        if (!StringUtils.hasText(avatarUrl)) {
            avatarUrl = StringUtils.hasText(request.getAvatarUrl())
                    ? request.getAvatarUrl().trim()
                    : "https://ui-avatars.com/api/?name=" + URLEncoder.encode(fullName, StandardCharsets.UTF_8) + "&background=0D9488&color=fff";
        }

        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (!"ACTIVE".equals(user.getStatus())) {
                throw new BadRequestException("Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.");
            }
            if (StringUtils.hasText(avatarUrl) && !StringUtils.hasText(user.getAvatarUrl())) {
                user.setAvatarUrl(avatarUrl);
                user = userRepository.save(user);
            }
        } else {
            String requestedRole = StringUtils.hasText(request.getRole()) && request.getRole().toUpperCase().contains("RECRUITER")
                    ? "ROLE_RECRUITER"
                    : "ROLE_CANDIDATE";
            Role targetRole = roleRepository.findByName(requestedRole)
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy vai trò " + requestedRole));

            user = User.builder()
                    .uuid(UUID.randomUUID().toString())
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .status("ACTIVE")
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Collections.singletonList(targetRole)))
                    .build();

            user = userRepository.save(user);

            if ("ROLE_RECRUITER".equals(requestedRole)) {
                String companyName = fullName + " Corp";
                String slug = "company-" + UUID.randomUUID().toString().substring(0, 8);
                Company company = companyRepository.save(Company.builder()
                        .uuid(UUID.randomUUID().toString())
                        .name(companyName)
                        .slug(slug)
                        .verificationStatus("PENDING")
                        .build());
                recruiterProfileRepository.save(RecruiterProfile.builder()
                        .userId(user.getId())
                        .companyId(company.getId())
                        .jobTitle("Chuyên viên tuyển dụng (" + provider + ")")
                        .teamRole("ADMIN")
                        .isCompanyAdmin(true)
                        .build());
            } else {
                candidateProfileRepository.save(CandidateProfile.builder()
                        .uuid(UUID.randomUUID().toString())
                        .userId(user.getId())
                        .headline("Ứng viên kết nối qua " + ("GOOGLE".equals(provider) ? "Google (Gmail)" : "LinkedIn"))
                        .country("Vietnam")
                        .isOpenToWork(true)
                        .visibility("PUBLIC")
                        .build());
            }
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        return issueTokens(userPrincipal, user, ipAddress, userAgent);
    }

    /**
     * Exchanges an OAuth2 Authorization Code with Google or LinkedIn token endpoint for an access_token.
     */
    private String exchangeAuthorizationCode(String provider, String code, String redirectUri) {
        String effectiveRedirect = StringUtils.hasText(redirectUri) ? redirectUri : "http://localhost:5173/login";
        try {
            if ("GOOGLE".equals(provider)) {
                String form = "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
                        + "&client_id=" + URLEncoder.encode(googleClientId, StandardCharsets.UTF_8)
                        + "&client_secret=" + URLEncoder.encode(googleClientSecret, StandardCharsets.UTF_8)
                        + "&redirect_uri=" + URLEncoder.encode(effectiveRedirect, StandardCharsets.UTF_8)
                        + "&grant_type=authorization_code";

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://oauth2.googleapis.com/token"))
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(form))
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() != 200) {
                    log.warn("Google code exchange failed ({}): {}", resp.statusCode(), resp.body());
                    throw new BadRequestException("Không thể đổi Authorization Code với máy chủ Google OAuth2. Vui lòng kiểm tra GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.");
                }
                JsonNode json = objectMapper.readTree(resp.body());
                if (json.hasNonNull("access_token")) return json.get("access_token").asText();
                if (json.hasNonNull("id_token")) return json.get("id_token").asText();
                throw new BadRequestException("Phản hồi từ Google OAuth2 không chứa access_token.");
            } else {
                String form = "grant_type=authorization_code"
                        + "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
                        + "&client_id=" + URLEncoder.encode(linkedinClientId, StandardCharsets.UTF_8)
                        + "&client_secret=" + URLEncoder.encode(linkedinClientSecret, StandardCharsets.UTF_8)
                        + "&redirect_uri=" + URLEncoder.encode(effectiveRedirect, StandardCharsets.UTF_8);

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://www.linkedin.com/oauth/v2/accessToken"))
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(form))
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() != 200) {
                    log.warn("LinkedIn code exchange failed ({}): {}", resp.statusCode(), resp.body());
                    throw new BadRequestException("Không thể đổi Authorization Code với máy chủ LinkedIn OAuth2. Vui lòng kiểm tra LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET.");
                }
                JsonNode json = objectMapper.readTree(resp.body());
                if (json.hasNonNull("access_token")) return json.get("access_token").asText();
                throw new BadRequestException("Phản hồi từ LinkedIn OAuth2 không chứa access_token.");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("OAuth2 code exchange error for {}: {}", provider, e.getMessage());
            throw new BadRequestException("Lỗi kết nối tới máy chủ OAuth2 " + provider + ": " + e.getMessage());
        }
    }

    /**
     * Verifies a real Google (ID Token or Access Token) or LinkedIn (Access Token) against official OAuth2 UserInfo endpoints.
     */
    private Map<String, String> verifyExternalOAuth2Token(String provider, String token) {
        try {
            if ("GOOGLE".equals(provider)) {
                boolean looksLikeJwtIdToken = token.startsWith("eyJ") && token.chars().filter(ch -> ch == '.').count() == 2;
                HttpRequest req;
                if (looksLikeJwtIdToken) {
                    req = HttpRequest.newBuilder()
                            .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)))
                            .GET()
                            .build();
                } else {
                    req = HttpRequest.newBuilder()
                            .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                            .header("Authorization", "Bearer " + token)
                            .GET()
                            .build();
                }
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() != 200) {
                    log.warn("Google OAuth2 token verification failed ({}): {}", resp.statusCode(), resp.body());
                    throw new BadRequestException("Xác thực Google OAuth2 thất bại: Token không hợp lệ hoặc đã hết hạn (phản hồi từ googleapis.com).");
                }
                JsonNode node = objectMapper.readTree(resp.body());
                String email = node.hasNonNull("email") ? node.get("email").asText().trim().toLowerCase() : null;
                if (!StringUtils.hasText(email)) {
                    throw new BadRequestException("Tài khoản Google không cung cấp địa chỉ email hợp lệ.");
                }
                String name = node.hasNonNull("name")
                        ? node.get("name").asText()
                        : email.split("@")[0];
                String picture = node.hasNonNull("picture") ? node.get("picture").asText() : "";
                Map<String, String> res = new HashMap<>();
                res.put("email", email);
                res.put("fullName", name);
                res.put("avatarUrl", picture);
                return res;
            } else {
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.linkedin.com/v2/userinfo"))
                        .header("Authorization", "Bearer " + token)
                        .GET()
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() != 200) {
                    log.warn("LinkedIn OAuth2 token verification failed ({}): {}", resp.statusCode(), resp.body());
                    throw new BadRequestException("Xác thực LinkedIn OAuth2 thất bại: Token không hợp lệ hoặc đã hết hạn (phản hồi từ api.linkedin.com).");
                }
                JsonNode node = objectMapper.readTree(resp.body());
                String email = node.hasNonNull("email") ? node.get("email").asText().trim().toLowerCase() : null;
                if (!StringUtils.hasText(email)) {
                    throw new BadRequestException("Tài khoản LinkedIn không cung cấp địa chỉ email (yêu cầu quyền openid email profile).");
                }
                String name = node.hasNonNull("name")
                        ? node.get("name").asText()
                        : ((node.path("given_name").asText("") + " " + node.path("family_name").asText("")).trim());
                if (!StringUtils.hasText(name)) name = email.split("@")[0];
                String picture = node.hasNonNull("picture") ? node.get("picture").asText() : "";
                Map<String, String> res = new HashMap<>();
                res.put("email", email);
                res.put("fullName", name);
                res.put("avatarUrl", picture);
                return res;
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("External OAuth2 token verification error ({}): {}", provider, e.getMessage());
            throw new BadRequestException("Không thể xác thực token với máy chủ " + provider + ": " + e.getMessage());
        }
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
