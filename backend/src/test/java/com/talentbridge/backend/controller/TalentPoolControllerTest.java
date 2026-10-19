package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.TalentPoolDtos.*;
import com.talentbridge.backend.security.*;
import com.talentbridge.backend.service.TalentPoolService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TalentPoolController.class)
@AutoConfigureMockMvc(addFilters = false)
class TalentPoolControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TalentPoolService talentPoolService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private JwtCookieHelper jwtCookieHelper;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    private UserPrincipal recruiterPrincipal() {
        return UserPrincipal.builder()
                .id(20L)
                .uuid("recruiter-uuid")
                .email("recruiter@example.com")
                .fullName("Lê Thị Tuyển Dụng")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_RECRUITER")))
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/employer/talent-pool returns list of open candidates")
    void testSearchTalentPool() throws Exception {
        TalentPoolCandidateDto candidate = TalentPoolCandidateDto.builder()
                .candidateProfileId(1L)
                .userId(10L)
                .fullName("Nguyễn Văn An")
                .email("an@example.com")
                .headline("Senior Java Engineer")
                .city("Hà Nội")
                .isOpenToWork(true)
                .matchScore(85)
                .matchRating("XUẤT SẮC")
                .skills(List.of(
                        CandidateSkillSummaryDto.builder().name("Java").proficiency("EXPERT").yearsExperience(4).build(),
                        CandidateSkillSummaryDto.builder().name("Spring Boot").proficiency("EXPERT").yearsExperience(4).build()
                ))
                .build();

        when(talentPoolService.searchTalentPool(any(), any(), any(), any())).thenReturn(List.of(candidate));

        UserPrincipal principal = recruiterPrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(get("/api/v1/employer/talent-pool")
                        .with(authentication(auth))
                        .param("keyword", "Java")
                        .param("city", "Hà Nội"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].fullName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.data[0].skills[0].name").value("Java"))
                .andExpect(jsonPath("$.data[0].matchScore").value(85));
    }

    @Test
    @DisplayName("POST /api/v1/employer/talent-pool/invite sends invitation notification")
    void testInviteCandidate() throws Exception {
        InviteCandidateRequestDto request = InviteCandidateRequestDto.builder()
                .candidateUserId(10L)
                .jobId(1L)
                .customMessage("Trân trọng mời bạn ứng tuyển")
                .build();

        InviteCandidateResponseDto response = InviteCandidateResponseDto.builder()
                .candidateUserId(10L)
                .jobId(1L)
                .jobTitle("Senior Backend Engineer")
                .candidateName("Nguyễn Văn An")
                .status("INVITED")
                .message("Đã gửi lời mời ứng tuyển thành công")
                .build();

        when(talentPoolService.inviteCandidate(any(), any())).thenReturn(response);

        UserPrincipal principal = recruiterPrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(post("/api/v1/employer/talent-pool/invite")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INVITED"))
                .andExpect(jsonPath("$.data.candidateName").value("Nguyễn Văn An"));
    }
}
