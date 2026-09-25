package com.talentbridge.backend.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class JwtCookieHelper {

    @Value("${app.jwt.cookie-name-access:accessToken}")
    private String accessTokenCookieName;

    @Value("${app.jwt.cookie-name-refresh:refreshToken}")
    private String refreshTokenCookieName;

    @Value("${app.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.jwt.same-site:Lax}")
    private String sameSite;

    @Value("${app.jwt.access-token-expiration-ms:1800000}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from(accessTokenCookieName, token)
                .path("/")
                .maxAge(accessTokenExpirationMs / 1000)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .build();
    }

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(refreshTokenCookieName, refreshToken)
                .path("/api/v1/auth")
                .maxAge(refreshTokenExpirationMs / 1000)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .build();
    }

    public ResponseCookie createCleanAccessTokenCookie() {
        return ResponseCookie.from(accessTokenCookieName, "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .build();
    }

    public ResponseCookie createCleanRefreshTokenCookie() {
        return ResponseCookie.from(refreshTokenCookieName, "")
                .path("/api/v1/auth")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .build();
    }

    public String extractAccessToken(HttpServletRequest request) {
        // 1. Check HttpOnly Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (accessTokenCookieName.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Check Authorization Header (Bearer ...)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    public String extractRefreshToken(HttpServletRequest request) {
        // 1. Check HttpOnly Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (refreshTokenCookieName.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Check Custom Header
        String tokenHeader = request.getHeader("X-Refresh-Token");
        if (StringUtils.hasText(tokenHeader)) {
            return tokenHeader;
        }

        return null;
    }
}
