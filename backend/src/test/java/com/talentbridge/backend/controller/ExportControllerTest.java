package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.CsvBuilder;
import com.talentbridge.backend.security.*;
import com.talentbridge.backend.service.ExportService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExportController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExportControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private ExportService exportService;
    @MockBean private JwtTokenProvider jwtTokenProvider;
    @MockBean private UserDetailsServiceImpl userDetailsService;
    @MockBean private JwtCookieHelper jwtCookieHelper;
    @MockBean private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    @MockBean private CustomAccessDeniedHandler customAccessDeniedHandler;

    /** With filters disabled, @AuthenticationPrincipal is resolved from the SecurityContextHolder. */
    private void loginAs(long id, String role) {
        SecurityContextHolder.getContext().setAuthentication(auth(id, role));
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private UsernamePasswordAuthenticationToken auth(long id, String role) {
        UserPrincipal p = UserPrincipal.builder().id(id).uuid("u-" + id).email(role.toLowerCase() + "@example.com")
                .fullName(role).authorities(List.of(new SimpleGrantedAuthority(role))).build();
        return new UsernamePasswordAuthenticationToken(p, null, p.getAuthorities());
    }

    @Test
    @DisplayName("Recruiter downloads applicants of a job as an Excel-friendly CSV attachment")
    void recruiterExportsApplicants() throws Exception {
        byte[] body = new CsvBuilder().row("ID", "Ứng viên").row(1, "Nguyễn Văn A").toBytes();
        when(exportService.exportApplications(eq(12L), eq(20L), eq(false), eq("vi"))).thenReturn(body);

        loginAs(20, "ROLE_RECRUITER");
        mockMvc.perform(get("/api/v1/exports/applications").param("jobId", "12"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("attachment")))
                .andExpect(header().string("Content-Disposition", containsString("applicants_job-12")))
                .andExpect(content().bytes(body));
    }

    @Test
    @DisplayName("Admin must choose a job when exporting applicants")
    void adminWithoutJobIdRejected() throws Exception {
        loginAs(1, "ROLE_ADMIN");
        mockMvc.perform(get("/api/v1/exports/applications"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(exportService);
    }

    @Test
    @DisplayName("Admin user export forwards the same filters as the admin list")
    void adminExportsUsersWithFilters() throws Exception {
        when(exportService.exportUsers("khang", "ROLE_CANDIDATE", "ACTIVE", "en")).thenReturn(new byte[]{1});

        loginAs(1, "ROLE_ADMIN");
        mockMvc.perform(get("/api/v1/exports/admin/users")
                        .param("keyword", "khang").param("role", "ROLE_CANDIDATE").param("status", "ACTIVE").param("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("talentbridge_users_")));
        verify(exportService).exportUsers("khang", "ROLE_CANDIDATE", "ACTIVE", "en");
    }
}
