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

@SpringBootTest
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
    @DisplayName("RBAC: Anonymous user cannot access /api/v1/applications/me - 401 Unauthorized")
    void testAnonymous_CannotAccessMyApplications() throws Exception {
        mockMvc.perform(get("/api/v1/applications/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "candidate@talentbridge.vn", roles = {"CANDIDATE"})
    @DisplayName("RBAC: CANDIDATE role can access /api/v1/applications/me - 200 OK")
    void testCandidate_CanAccessMyApplications() throws Exception {
        when(applicationService.getMyApplications(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/applications/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
