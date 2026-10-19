package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.AdminDtos.*;
import com.talentbridge.backend.security.*;
import com.talentbridge.backend.service.AdminService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

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

    private UsernamePasswordAuthenticationToken adminAuth() {
        UserPrincipal principal = UserPrincipal.builder()
                .id(1L)
                .uuid("admin-uuid-1")
                .email("admin@talentbridge.vn")
                .fullName("Nguyễn Quản Trị")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("UC-ADM-01 & UC-ADM-06: GET /api/v1/admin/overview returns platform KPIs and AI system health")
    void testGetPlatformOverview() throws Exception {
        PlatformOverviewDto overview = PlatformOverviewDto.builder()
                .totalUsers(42L)
                .activeUsers(40L)
                .totalCompanies(12L)
                .verifiedCompanies(10L)
                .totalJobs(25L)
                .publishedJobs(21L)
                .totalApplications(68L)
                .totalSkills(60L)
                .overallHireRate(14.7)
                .averagePlatformMatchScore(79.4)
                .aiMetrics(AiSystemMetricsDto.builder()
                        .activeModelName("TalentBridge Hybrid ATS & Skill-Graph Engine v2.4")
                        .averageAtsScore(79.4)
                        .uptimePercentage(99.98)
                        .build())
                .build();

        when(adminService.getPlatformOverview()).thenReturn(overview);

        mockMvc.perform(get("/api/v1/admin/overview").with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(42))
                .andExpect(jsonPath("$.data.verifiedCompanies").value(10))
                .andExpect(jsonPath("$.data.aiMetrics.uptimePercentage").value(99.98));
    }

    @Test
    @DisplayName("UC-ADM-02: PATCH /api/v1/admin/users/{id}/status updates user account status")
    void testUpdateUserStatus() throws Exception {
        UpdateUserStatusRequestDto req = UpdateUserStatusRequestDto.builder()
                .status("SUSPENDED")
                .reason("Vi phạm quy định đăng tin")
                .build();

        AdminUserDto updatedUser = AdminUserDto.builder()
                .id(15L)
                .email("violator@example.com")
                .fullName("Trần Văn B")
                .status("SUSPENDED")
                .roles(List.of("ROLE_CANDIDATE"))
                .build();

        when(adminService.updateUserStatus(anyLong(), eq(15L), any())).thenReturn(updatedUser);

        mockMvc.perform(patch("/api/v1/admin/users/15/status")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"));
    }

    @Test
    @DisplayName("UC-ADM-03: PATCH /api/v1/admin/companies/{id}/verify updates company verification status")
    void testVerifyCompany() throws Exception {
        VerifyCompanyRequestDto req = VerifyCompanyRequestDto.builder()
                .verificationStatus("VERIFIED")
                .note("Đã đối chiếu giấy phép kinh doanh và mã số thuế hợp lệ")
                .build();

        AdminCompanyDto updatedCompany = AdminCompanyDto.builder()
                .id(3L)
                .name("FPT Software")
                .verificationStatus("VERIFIED")
                .jobCount(6L)
                .build();

        when(adminService.verifyCompany(anyLong(), eq(3L), any())).thenReturn(updatedCompany);

        mockMvc.perform(patch("/api/v1/admin/companies/3/verify")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"))
                .andExpect(jsonPath("$.data.name").value("FPT Software"));
    }

    @Test
    @DisplayName("UC-ADM-04: PATCH /api/v1/admin/jobs/{id}/moderate updates job moderation status")
    void testModerateJob() throws Exception {
        ModerateJobRequestDto req = ModerateJobRequestDto.builder()
                .status("PUBLISHED")
                .reason("Nội dung tuyển dụng minh bạch, phê duyệt hiển thị")
                .build();

        AdminJobDto moderatedJob = AdminJobDto.builder()
                .id(8L)
                .title("Senior Cloud Architect")
                .companyName("VNG Corporation")
                .status("PUBLISHED")
                .build();

        when(adminService.moderateJob(anyLong(), eq(8L), any())).thenReturn(moderatedJob);

        mockMvc.perform(patch("/api/v1/admin/jobs/8/moderate")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.data.title").value("Senior Cloud Architect"));
    }

    @Test
    @DisplayName("UC-ADM-05: POST /api/v1/admin/skills creates a new taxonomy skill")
    void testCreateSkill() throws Exception {
        SaveSkillRequestDto req = SaveSkillRequestDto.builder()
                .name("LangChain")
                .category("FRAMEWORK")
                .description("Framework xây dựng ứng dụng LLM & Agentic AI")
                .isActive(true)
                .build();

        AdminSkillDto createdSkill = AdminSkillDto.builder()
                .id(65L)
                .name("LangChain")
                .slug("langchain")
                .category("FRAMEWORK")
                .isActive(true)
                .build();

        when(adminService.createSkill(anyLong(), any())).thenReturn(createdSkill);

        mockMvc.perform(post("/api/v1/admin/skills")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("LangChain"))
                .andExpect(jsonPath("$.data.slug").value("langchain"));
    }

    @Test
    @DisplayName("FR-38: GET /api/v1/admin/audit-logs returns system audit trail")
    void testGetAuditLogs() throws Exception {
        AuditLogDto logEntry = AuditLogDto.builder()
                .id(101L)
                .userId(1L)
                .actorName("Nguyễn Quản Trị")
                .actorEmail("admin@talentbridge.vn")
                .action("COMPANY_VERIFICATION_UPDATED")
                .entityName("companies")
                .entityId("3")
                .build();

        when(adminService.getAuditLogs(any(), any(), any(), anyInt())).thenReturn(List.of(logEntry));

        mockMvc.perform(get("/api/v1/admin/audit-logs").with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].action").value("COMPANY_VERIFICATION_UPDATED"))
                .andExpect(jsonPath("$.data[0].actorEmail").value("admin@talentbridge.vn"));
    }
}
