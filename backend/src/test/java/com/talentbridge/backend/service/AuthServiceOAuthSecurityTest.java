package com.talentbridge.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.OAuth2LoginRequestDto;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.repository.*;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * Security regression tests for OAuth2 sign-in: without sandbox mode, nobody can obtain a session
 * just by sending an e-mail address.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceOAuthSecurityTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private UserTokenRepository userTokenRepository;
    @Mock private CandidateProfileRepository candidateProfileRepository;
    @Mock private RecruiterProfileRepository recruiterProfileRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, roleRepository, userTokenRepository,
                candidateProfileRepository, recruiterProfileRepository, companyRepository,
                passwordEncoder, authenticationManager, jwtTokenProvider, new ObjectMapper());
        ReflectionTestUtils.setField(authService, "googleClientId", "test-client.apps.googleusercontent.com");
        ReflectionTestUtils.setField(authService, "oauth2SandboxEnabled", false);
    }

    @Test
    @DisplayName("Sandbox OFF: e-mail only (no token, no code) is rejected and no user is looked up")
    void emailOnlyLoginRejected() {
        OAuth2LoginRequestDto req = OAuth2LoginRequestDto.builder()
                .provider("GOOGLE").email("victim@gmail.com").fullName("Victim").build();

        assertThatThrownBy(() -> authService.loginWithOAuth2(req, "127.0.0.1", "JUnit"))
                .isInstanceOf(BadRequestException.class);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Sandbox OFF: local authorization codes cannot be issued")
    void issuingLocalCodeRejected() {
        OAuth2LoginRequestDto req = OAuth2LoginRequestDto.builder()
                .provider("GOOGLE").email("victim@gmail.com").build();

        assertThatThrownBy(() -> authService.issueOAuth2AuthorizationCode(req))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("Sandbox OFF: fake 'oauth2_sandbox_' token is rejected")
    void sandboxTokenRejected() {
        OAuth2LoginRequestDto req = OAuth2LoginRequestDto.builder()
                .provider("GOOGLE").token("oauth2_sandbox_abc").email("victim@gmail.com").build();

        assertThatThrownBy(() -> authService.loginWithOAuth2(req, "127.0.0.1", "JUnit"))
                .isInstanceOf(BadRequestException.class);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Raw LinkedIn access token from the client is rejected (only the code flow is accepted)")
    void rawLinkedInTokenRejected() {
        OAuth2LoginRequestDto req = OAuth2LoginRequestDto.builder()
                .provider("LINKEDIN").token("AQX-some-access-token").build();

        assertThatThrownBy(() -> authService.loginWithOAuth2(req, "127.0.0.1", "JUnit"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Authorization Code");
    }

    @Test
    @DisplayName("Sandbox ON: local code can be issued (dev mode still works)")
    void sandboxModeStillWorksForLocalDev() {
        ReflectionTestUtils.setField(authService, "oauth2SandboxEnabled", true);
        OAuth2LoginRequestDto req = OAuth2LoginRequestDto.builder()
                .provider("GOOGLE").email("dev@gmail.com").fullName("Dev").build();

        Map<String, String> grant = authService.issueOAuth2AuthorizationCode(req);
        assertThat(grant.get("code")).isNotBlank();
    }

    @Test
    @DisplayName("Public OAuth2 config exposes sandbox flag but never the client secret")
    void configDoesNotLeakSecret() {
        ReflectionTestUtils.setField(authService, "googleClientSecret", "super-secret");
        Map<String, Object> cfg = authService.getOAuth2ClientConfig();
        assertThat(cfg).containsEntry("sandboxEnabled", false);
        assertThat(cfg.values()).doesNotContain("super-secret");
    }
}
