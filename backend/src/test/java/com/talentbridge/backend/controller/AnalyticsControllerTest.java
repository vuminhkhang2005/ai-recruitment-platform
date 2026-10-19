package com.talentbridge.backend.controller;

import com.talentbridge.backend.dto.AnalyticsDtos.*;
import com.talentbridge.backend.security.*;
import com.talentbridge.backend.service.AnalyticsService;
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

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

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
    @DisplayName("GET /api/v1/employer/analytics - Should return company recruitment funnel & metrics")
    void testGetCompanyAnalytics() throws Exception {
        UserPrincipal principal = recruiterPrincipal();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        RecruitmentAnalyticsResponseDto response = RecruitmentAnalyticsResponseDto.builder()
                .companyId(1L)
                .companyName("VNG Corporation")
                .kpis(KpiMetricsDto.builder()
                        .totalJobs(5)
                        .activeJobs(4)
                        .totalApplications(24)
                        .freshApplications(6)
                        .scheduledInterviews(3)
                        .avgDaysToReview(1.8)
                        .avgDaysToHire(12.5)
                        .build())
                .funnel(FunnelMetricsDto.builder()
                        .appliedCount(24)
                        .screeningCount(18)
                        .interviewCount(10)
                        .offeredCount(4)
                        .hiredCount(3)
                        .rejectedCount(5)
                        .screeningRate(75.0)
                        .interviewRate(55.6)
                        .offerRate(40.0)
                        .hireRate(75.0)
                        .overallHireRate(12.5)
                        .build())
                .quality(QualityDistributionDto.builder()
                        .highMatchCount(12)
                        .mediumMatchCount(8)
                        .lowMatchCount(4)
                        .highMatchPct(50.0)
                        .mediumMatchPct(33.3)
                        .lowMatchPct(16.7)
                        .build())
                .topJobs(List.of(
                        TopJobMetricDto.builder()
                                .jobId(1L)
                                .jobTitle("Senior Backend Engineer")
                                .status("PUBLISHED")
                                .viewsCount(120)
                                .applicationsCount(14)
                                .interviewCount(6)
                                .hiredCount(2)
                                .avgMatchScore(82.5)
                                .build()
                ))
                .build();

        when(analyticsService.getCompanyAnalytics(anyLong(), anyBoolean())).thenReturn(response);

        mockMvc.perform(get("/api/v1/employer/analytics")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.companyName").value("VNG Corporation"))
                .andExpect(jsonPath("$.data.kpis.totalApplications").value(24))
                .andExpect(jsonPath("$.data.funnel.appliedCount").value(24))
                .andExpect(jsonPath("$.data.funnel.hiredCount").value(3))
                .andExpect(jsonPath("$.data.funnel.overallHireRate").value(12.5))
                .andExpect(jsonPath("$.data.quality.highMatchCount").value(12))
                .andExpect(jsonPath("$.data.topJobs[0].jobTitle").value("Senior Backend Engineer"));
    }
}
