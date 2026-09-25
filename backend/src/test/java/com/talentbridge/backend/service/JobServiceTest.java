package com.talentbridge.backend.service;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.Job;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.JobRepository;
import com.talentbridge.backend.repository.JobSkillRepository;
import com.talentbridge.backend.service.impl.JobServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private JobSkillRepository jobSkillRepository;

    @InjectMocks
    private JobServiceImpl jobService;

    private Company sampleCompany;
    private Job sampleJob;

    @BeforeEach
    void setUp() {
        sampleCompany = Company.builder()
                .id(1L)
                .uuid("comp-uuid-1")
                .name("VNG Corporation")
                .slug("vng-corporation")
                .logoUrl("/logos/vng.svg")
                .city("TP. Hồ Chí Minh")
                .build();

        sampleJob = Job.builder()
                .id(1L)
                .uuid("job-uuid-1")
                .company(sampleCompany)
                .title("Senior Fullstack Engineer (React & Golang)")
                .slug("senior-fullstack-engineer-react-golang")
                .description("Sample job description")
                .requirements("Sample requirements")
                .benefits("Sample benefits")
                .jobType("HYBRID")
                .expLevel("SENIOR")
                .minSalary(new BigDecimal("35000000.00"))
                .maxSalary(new BigDecimal("55000000.00"))
                .currency("VND")
                .isSalaryNegotiable(false)
                .locationCity("TP. Hồ Chí Minh")
                .status("PUBLISHED")
                .viewsCount(10)
                .applicationsCount(2)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .jobSkills(Collections.emptyList())
                .build();
    }

    @Test
    @DisplayName("Should return job details when valid ID is provided")
    void testGetJobById_Success() {
        when(jobRepository.findByIdWithCompany(1L)).thenReturn(Optional.of(sampleJob));
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        JobResponseDto result = jobService.getJobById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Senior Fullstack Engineer (React & Golang)");
        assertThat(result.getCompanyName()).isEqualTo("VNG Corporation");
        assertThat(result.getSalaryFormatted()).contains("35 - 55 Triệu VNĐ");

        verify(jobRepository, times(1)).findByIdWithCompany(1L);
        verify(jobRepository, times(1)).save(sampleJob);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when job ID does not exist")
    void testGetJobById_NotFound() {
        when(jobRepository.findByIdWithCompany(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.getJobById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Job listing not found with ID: 999");

        verify(jobRepository, times(1)).findByIdWithCompany(999L);
        verify(jobRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return paginated search results matching filter")
    void testSearchJobs_Success() {
        Page<Job> pagedJobs = new PageImpl<>(List.of(sampleJob));
        when(jobRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(pagedJobs);

        JobFilterRequestDto filter = JobFilterRequestDto.builder()
                .keyword("React")
                .city("All")
                .page(0)
                .size(10)
                .build();

        PageResponse<JobResponseDto> response = jobService.searchJobs(filter);

        assertThat(response).isNotNull();
        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getTitle()).contains("React");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return top 6 featured jobs for homepage showcase")
    void testGetFeaturedJobs_Success() {
        when(jobRepository.findTop6ByStatusOrderByCreatedAtDesc("PUBLISHED")).thenReturn(List.of(sampleJob));

        List<JobResponseDto> featured = jobService.getFeaturedJobs();

        assertThat(featured).isNotEmpty();
        assertThat(featured).hasSize(1);
        assertThat(featured.get(0).getTitle()).isEqualTo(sampleJob.getTitle());
    }
}
