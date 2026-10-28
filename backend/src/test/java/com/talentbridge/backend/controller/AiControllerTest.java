package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.AiDtos.*;
import com.talentbridge.backend.dto.CandidateDtos.SkillItem;
import com.talentbridge.backend.security.*;
import com.talentbridge.backend.service.AiService;
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

@WebMvcTest(AiController.class)
@AutoConfigureMockMvc(addFilters = false)
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiService aiService;

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

    private UserPrincipal candidatePrincipal() {
        return UserPrincipal.builder()
                .id(10L)
                .uuid("candidate-uuid")
                .email("candidate@example.com")
                .fullName("Nguyễn Văn A")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CANDIDATE")))
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/ai/parse-cv-text - Should extract skills and resume information")
    void testParseCvText() throws Exception {
        UserPrincipal principal = candidatePrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        AiResumeParseResultDto parseResult = AiResumeParseResultDto.builder()
                .fullName("Nguyễn Văn A")
                .email("candidate@example.com")
                .city("TP. Hồ Chí Minh")
                .headline("Backend Developer (Java)")
                .skills(List.of(
                        ExtractedSkillItem.builder().name("Java").proficiency("ADVANCED").yearsExperience(3).build(),
                        ExtractedSkillItem.builder().name("Spring Boot").proficiency("ADVANCED").yearsExperience(3).build()
                ))
                .overallQualityScore(88)
                .build();

        when(aiService.parseCv(any(), any(), any(), any())).thenReturn(parseResult);

        ParseCvTextRequest req = ParseCvTextRequest.builder()
                .text("Nguyễn Văn A - 3 năm kinh nghiệm Java và Spring Boot tại TP. Hồ Chí Minh")
                .build();

        mockMvc.perform(post("/api/v1/ai/parse-cv-text")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn A"))
                .andExpect(jsonPath("$.data.skills[0].name").value("Java"))
                .andExpect(jsonPath("$.data.overallQualityScore").value(88));
    }

    @Test
    @DisplayName("POST /api/v1/ai/sync-parsed-skills - Should sync skills into candidate profile")
    void testSyncSkills() throws Exception {
        UserPrincipal principal = candidatePrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        List<SkillItem> synced = List.of(
                SkillItem.builder().skillId(1L).name("Java").proficiency("ADVANCED").yearsExperience(3).build(),
                SkillItem.builder().skillId(2L).name("Docker").proficiency("INTERMEDIATE").yearsExperience(2).build()
        );

        when(aiService.syncSkills(anyLong(), any(SyncSkillsRequest.class))).thenReturn(synced);

        SyncSkillsRequest req = SyncSkillsRequest.builder()
                .skills(synced)
                .replaceExisting(false)
                .build();

        mockMvc.perform(post("/api/v1/ai/sync-parsed-skills")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Java"))
                .andExpect(jsonPath("$.data[1].name").value("Docker"));
    }

    @Test
    @DisplayName("POST /api/v1/ai/generate-cover-letter - Should generate personalized cover letter")
    void testGenerateCoverLetter() throws Exception {
        UserPrincipal principal = candidatePrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        CoverLetterResponseDto response = CoverLetterResponseDto.builder()
                .jobId(1L)
                .jobTitle("Senior Backend Engineer")
                .companyName("VNG Corporation")
                .tone("PROFESSIONAL")
                .subject("Thư ứng tuyển vị trí Senior Backend Engineer - Nguyễn Văn A")
                .coverLetter("Kính gửi Ban Tuyển dụng VNG Corporation,\n\nTôi viết thư này...")
                .highlightedSkills(List.of("Java", "Spring Boot"))
                .build();

        when(aiService.generateCoverLetter(anyLong(), any(CoverLetterGenerateRequest.class))).thenReturn(response);

        CoverLetterGenerateRequest req = CoverLetterGenerateRequest.builder()
                .jobId(1L)
                .tone("PROFESSIONAL")
                .build();

        mockMvc.perform(post("/api/v1/ai/generate-cover-letter")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.jobTitle").value("Senior Backend Engineer"))
                .andExpect(jsonPath("$.data.companyName").value("VNG Corporation"))
                .andExpect(jsonPath("$.data.coverLetter").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/v1/ai/match-analysis - Should return deep ATS match analysis & skill gap")
    void testAtsMatchAnalysis() throws Exception {
        UserPrincipal principal = candidatePrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        AtsMatchAnalysisResponseDto analysis = AtsMatchAnalysisResponseDto.builder()
                .jobId(1L)
                .jobTitle("Senior Backend Engineer")
                .companyName("VNG Corporation")
                .matchScore(85)
                .matchRating("XUẤT SẮC")
                .ratingColor("emerald")
                .matchedSkills(List.of(
                        AtsSkillBreakdownItem.builder().name("Java").requiredYears(3).candidateYears(4).isMatched(true).build()
                ))
                .missingSkills(List.of(
                        AtsSkillBreakdownItem.builder().name("Kubernetes").requiredYears(2).candidateYears(0).isMatched(false).build()
                ))
                .keyStrengths(List.of("Nền tảng vững chắc với Java."))
                .preparationTips(List.of("Chuẩn bị câu hỏi về Docker & Kubernetes."))
                .build();

        when(aiService.analyzeAtsMatch(anyLong(), eq(1L))).thenReturn(analysis);

        mockMvc.perform(get("/api/v1/ai/match-analysis")
                        .with(authentication(auth))
                        .param("jobId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.matchScore").value(85))
                .andExpect(jsonPath("$.data.matchRating").value("XUẤT SẮC"))
                .andExpect(jsonPath("$.data.matchedSkills[0].name").value("Java"))
                .andExpect(jsonPath("$.data.missingSkills[0].name").value("Kubernetes"));
    }

    @Test
    @DisplayName("GET /api/v1/ai/recommended-jobs - Should return candidate personalized job recommendations")
    void testRecommendedJobs() throws Exception {
        UserPrincipal principal = candidatePrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        RecommendedJobDto item = RecommendedJobDto.builder()
                .matchScore(90)
                .matchRating("XUẤT SẮC")
                .ratingColor("emerald")
                .matchedSkills(List.of("Java", "Spring Boot", "MySQL"))
                .recommendationReason("Khớp 3/3 kỹ năng cốt lõi của bạn")
                .build();

        // Controller now resolves the selected CV and the minimum score (limit, cvId, minScore)
        when(aiService.getRecommendedJobsForCandidate(anyLong(), org.mockito.ArgumentMatchers.isNull(), eq(5), eq(45)))
                .thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/ai/recommended-jobs")
                        .with(authentication(auth))
                        .param("limit", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].matchScore").value(90))
                .andExpect(jsonPath("$.data[0].matchRating").value("XUẤT SẮC"))
                .andExpect(jsonPath("$.data[0].matchedSkills[0]").value("Java"));
    }
}
