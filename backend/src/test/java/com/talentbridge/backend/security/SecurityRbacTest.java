package com.talentbridge.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.JobCreateRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.service.ApplicationService;
import com.talentbridge.backend.service.JobService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.oauth2.sandbox-enabled=false")
@AutoConfigureMockMvc
class SecurityRbacTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JobService jobService;

    @MockBean
    private ApplicationService applicationService;

    @Test
    @DisplayName("RBAC: Anonymous user cannot create job - 401 Unauthorized")
    void testAnonymous_CannotCreateJob() throws Exception {
        JobCreateRequestDto request = JobCreateRequestDto.builder()
                .title("Unauthorized Job Creation")
                .description("Desc")
                .requirements("Reqs")
                .build();

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "candidate@talentbridge.vn", roles = {"CANDIDATE"})
    @DisplayName("RBAC: CANDIDATE role cannot create job - 403 Forbidden")
    void testCandidate_CannotCreateJob_Forbidden() throws Exception {
        JobCreateRequestDto request = JobCreateRequestDto.builder()
                .title("Forbidden Candidate Job Creation")
                .description("Desc")
                .requirements("Reqs")
                .build();

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("RBAC: Anonymous user cannot change OAuth2 client config - 401 Unauthorized")
    void testAnonymous_CannotUpdateOAuth2Config() throws Exception {
        mockMvc.perform(post("/api/v1/auth/oauth2/config")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"provider\":\"GOOGLE\",\"clientId\":\"attacker-client\",\"clientSecret\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "candidate@talentbridge.vn", roles = {"CANDIDATE"})
    @DisplayName("RBAC: CANDIDATE cannot change OAuth2 client config - 403 Forbidden")
    void testCandidate_CannotUpdateOAuth2Config() throws Exception {
        mockMvc.perform(post("/api/v1/auth/oauth2/config")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"provider\":\"GOOGLE\",\"clientId\":\"attacker-client\",\"clientSecret\":\"x\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: OAuth2 e-mail-only sign-in is rejected when sandbox mode is off - 400")
    void testOAuth2EmailOnlyLoginRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/oauth2/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"provider\":\"GOOGLE\",\"email\":\"candidate@talentbridge.vn\",\"role\":\"ROLE_CANDIDATE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "candidate@talentbridge.vn", roles = {"CANDIDATE"})
    @DisplayName("RBAC: CANDIDATE cannot export applicants or admin CSV - 403 Forbidden")
    void testCandidate_CannotExportCsv() throws Exception {
        mockMvc.perform(get("/api/v1/exports/applications").param("jobId", "1"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/exports/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "recruiter@talentbridge.vn", roles = {"RECRUITER"})
    @DisplayName("RBAC: RECRUITER cannot export admin user list - 403 Forbidden")
    void testRecruiter_CannotExportAdminUsers() throws Exception {
        mockMvc.perform(get("/api/v1/exports/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC: Anonymous user cannot export CSV - 401 Unauthorized")
    void testAnonymous_CannotExportCsv() throws Exception {
        mockMvc.perform(get("/api/v1/exports/analytics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RBAC: Anonymous user cannot access /api/v1/applications/me - 401 Unauthorized")
    void testAnonymous_CannotAccessMyApplications() throws Exception {
        mockMvc.perform(get("/api/v1/applications/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RBAC: CANDIDATE role can access /api/v1/applications/me - 200 OK")
    void testCandidate_CanAccessMyApplications() throws Exception {
        when(applicationService.getMyApplications(any())).thenReturn(List.of());

        com.talentbridge.backend.security.UserPrincipal principal = com.talentbridge.backend.security.UserPrincipal.builder()
                .id(12L).uuid("u-12").email("candidate@talentbridge.vn").password("x").fullName("Candidate")
                .authorities(List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CANDIDATE")))
                .build();

        mockMvc.perform(get("/api/v1/applications/me")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
