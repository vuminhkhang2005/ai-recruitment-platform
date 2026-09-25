package com.talentbridge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.dto.CompanyResponseDto;
import com.talentbridge.backend.security.CustomAccessDeniedHandler;
import com.talentbridge.backend.security.JwtAuthenticationEntryPoint;
import com.talentbridge.backend.security.JwtCookieHelper;
import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserDetailsServiceImpl;
import com.talentbridge.backend.service.CompanyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CompanyController.class)
@AutoConfigureMockMvc(addFilters = false)
class CompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CompanyService companyService;

    @MockBean
    private JwtCookieHelper jwtCookieHelper;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    @Test
    @DisplayName("GET /api/v1/companies - Should return 200 and list of top companies")
    void testGetAllCompanies() throws Exception {
        CompanyResponseDto c1 = CompanyResponseDto.builder()
                .id(1L)
                .name("VinAI Research")
                .slug("vinai-research")
                .city("Hà Nội")
                .openJobsCount(5L)
                .build();

        CompanyResponseDto c2 = CompanyResponseDto.builder()
                .id(2L)
                .name("VNG Corporation")
                .slug("vng-corporation")
                .city("TP. Hồ Chí Minh")
                .openJobsCount(8L)
                .build();

        when(companyService.getAllCompanies()).thenReturn(List.of(c1, c2));

        mockMvc.perform(get("/api/v1/companies")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("VinAI Research"))
                .andExpect(jsonPath("$.data[1].name").value("VNG Corporation"));
    }

    @Test
    @DisplayName("GET /api/v1/companies/{id} - Should return 200 with company details")
    void testGetCompanyById() throws Exception {
        CompanyResponseDto c = CompanyResponseDto.builder()
                .id(1L)
                .name("VinAI Research")
                .slug("vinai-research")
                .website("https://vinai.io")
                .build();

        when(companyService.getCompanyById(1L)).thenReturn(c);

        mockMvc.perform(get("/api/v1/companies/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("VinAI Research"))
                .andExpect(jsonPath("$.data.website").value("https://vinai.io"));
    }
}
