package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.service.JobService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserDetailsServiceImpl;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.JwtAuthenticationEntryPoint;
import com.talentbridge.backend.security.CustomAccessDeniedHandler;

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

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

    @Test
    @DisplayName("GET /api/v1/jobs - Should return 200 and paginated list of jobs")
    void testSearchJobsEndpoint() throws Exception {
        JobResponseDto dto = JobResponseDto.builder()
                .id(1L)
                .uuid("job-uuid-1")
                .title("Senior Fullstack Engineer")
                .companyName("VNG Corporation")
                .salaryFormatted("35 - 55 Triệu VNĐ")
                .locationCity("TP. Hồ Chí Minh")
                .build();

        PageResponse<JobResponseDto> pageResponse = PageResponse.<JobResponseDto>builder()
                .items(List.of(dto))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        when(jobService.searchJobs(any(JobFilterRequestDto.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/jobs")
                        .param("keyword", "Fullstack")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Senior Fullstack Engineer"))
                .andExpect(jsonPath("$.data.items[0].companyName").value("VNG Corporation"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/jobs/{id} - Should return 200 with job details")
    void testGetJobByIdEndpoint_Success() throws Exception {
        JobResponseDto dto = JobResponseDto.builder()
                .id(1L)
                .uuid("job-uuid-1")
                .title("Senior AI Engineer")
                .companyName("VinAI Innovation Lab")
                .salaryFormatted("50 - 80 Triệu VNĐ")
                .locationCity("Hà Nội")
                .build();

        when(jobService.getJobById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/jobs/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("Senior AI Engineer"))
                .andExpect(jsonPath("$.data.companyName").value("VinAI Innovation Lab"));
    }

    @Test
    @DisplayName("GET /api/v1/jobs/{id} - Should return 404 when job does not exist")
    void testGetJobByIdEndpoint_NotFound() throws Exception {
        when(jobService.getJobById(999L))
                .thenThrow(new ResourceNotFoundException("Job listing not found with ID: 999"));

        mockMvc.perform(get("/api/v1/jobs/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Job listing not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/jobs/featured - Should return 200 and list of top featured jobs")
    void testGetFeaturedJobsEndpoint() throws Exception {
        JobResponseDto dto = JobResponseDto.builder()
                .id(1L)
                .title("Lead Cloud Solutions Architect")
                .companyName("FPT Software")
                .build();

        when(jobService.getFeaturedJobs()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/jobs/featured")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].companyName").value("FPT Software"));
    }
}
