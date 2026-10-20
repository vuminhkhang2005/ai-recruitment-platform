package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.*;
import com.talentbridge.backend.security.UserPrincipal;

public interface AuthService {

    AuthResponseDto register(RegisterRequestDto request, String ipAddress, String userAgent);

    AuthResponseDto login(LoginRequestDto request, String ipAddress, String userAgent);

    AuthResponseDto refreshToken(String rawRefreshToken, String ipAddress, String userAgent);

    void logout(String rawRefreshToken, Long currentUserId);

    UserSummaryDto getCurrentUser(UserPrincipal userPrincipal);

    AuthResponseDto loginWithOAuth2(OAuth2LoginRequestDto request, String ipAddress, String userAgent);

    /**
     * Issues a single-use OAuth 2.0 Authorization Code (RFC 6749) after user consent,
     * which the frontend callback exchanges at POST /api/v1/auth/oauth2/{provider}.
     */
    java.util.Map<String, String> issueOAuth2AuthorizationCode(OAuth2LoginRequestDto request);

    java.util.Map<String, Object> getOAuth2ClientConfig();

    java.util.Map<String, Object> updateOAuth2ClientConfig(String provider, String clientId, String clientSecret);

    /** Issues an access/refresh token pair for an already-verified user (e.g. after accepting a team invitation). */
    AuthResponseDto issueTokensFor(com.talentbridge.backend.entity.User user, String ipAddress, String userAgent);

    /** Verifies the current password, stores the new one and signs out every other session. */
    AuthResponseDto changePassword(Long userId, ChangePasswordRequestDto request, String ipAddress, String userAgent);
}
