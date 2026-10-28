package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.CompanyReviewDtos.*;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CompanyReviewServiceTest {

    @Mock CompanyReviewRepository reviewRepository;
    @Mock CompanyRepository companyRepository;
    @Mock CandidateProfileRepository candidateProfileRepository;
    @Mock JobApplicationRepository jobApplicationRepository;
    @Mock ApplicationStageHistoryRepository stageHistoryRepository;
    @Mock UserRepository userRepository;
    @Mock AuditLogRepository auditLogRepository;

    private CompanyReviewService service;

    private static final long COMPANY = 3L;
    private static final long USER = 50L;

    private Company company;
    private User author;

    @BeforeEach
    void setUp() {
        service = new CompanyReviewService(reviewRepository, companyRepository, candidateProfileRepository,
                jobApplicationRepository, stageHistoryRepository, userRepository, auditLogRepository);
        company = Company.builder().name("FPT Software").build();
        company.setId(COMPANY);
        author = User.builder().email("an@gmail.com").fullName("Nguyễn Văn An").build();
        author.setId(USER);
        when(companyRepository.findById(COMPANY)).thenReturn(Optional.of(company));
        when(userRepository.findById(USER)).thenReturn(Optional.of(author));
        when(candidateProfileRepository.findByUserId(USER)).thenReturn(Optional.of(CandidateProfile.builder().id(9L).userId(USER).build()));
        when(reviewRepository.save(any(CompanyReview.class))).thenAnswer(inv -> {
            CompanyReview r = inv.getArgument(0);
            if (r.getId() == null) r.setId(100L);
            return r;
        });
    }

    private JobApplication app(long id, String stage, String jobTitle) {
        Job job = Job.builder().title(jobTitle).build();
        return JobApplication.builder().id(id).job(job).candidateProfileId(9L).currentStage(stage)
                .appliedAt(LocalDateTime.now().minusDays(id)).build();
    }

    private ReviewRequestDto validRequest() {
        return ReviewRequestDto.builder().rating(4).title("Quy trình phỏng vấn chuyên nghiệp")
                .pros("HR phản hồi nhanh, câu hỏi kỹ thuật sát thực tế.").cons("Vòng test hơi dài.").anonymous(true).build();
    }

    @Test
    @DisplayName("Candidate who never applied cannot review")
    void noApplicationRejected() {
        when(jobApplicationRepository.findByCandidateProfileIdAndCompanyId(9L, COMPANY)).thenReturn(List.of());

        assertThatThrownBy(() -> service.create(COMPANY, USER, validRequest()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("đã từng ứng tuyển");
        assertThat(service.eligibility(COMPANY, USER).getReason()).isEqualTo("NO_APPLICATION");
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Users without a candidate profile (recruiter/admin) cannot review")
    void nonCandidateRejected() {
        when(candidateProfileRepository.findByUserId(77L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.create(COMPANY, 77L, validRequest())).isInstanceOf(AccessDeniedException.class);
        assertThat(service.eligibility(COMPANY, 77L).getReason()).isEqualTo("NOT_CANDIDATE");
    }

    @Test
    @DisplayName("Only one review per company")
    void duplicateRejected() {
        when(reviewRepository.findByCompanyIdAndAuthorUserId(COMPANY, USER))
                .thenReturn(Optional.of(CompanyReview.builder().id(1L).companyId(COMPANY).authorUserId(USER).rating(3).title("x").build()));
        assertThatThrownBy(() -> service.create(COMPANY, USER, validRequest()))
                .isInstanceOf(BadRequestException.class);
        assertThat(service.eligibility(COMPANY, USER).getReason()).isEqualTo("ALREADY_REVIEWED");
    }

    @Test
    @DisplayName("Experience badge is derived from the furthest hiring stage, including stage history")
    void experienceLevelFromPipeline() {
        assertThat(service.experienceLevel(List.of(app(1, "APPLIED", "Java")))).isEqualTo("APPLIED");
        assertThat(service.experienceLevel(List.of(app(1, "APPLIED", "Java"), app(2, "INTERVIEW", ".NET")))).isEqualTo("INTERVIEWED");
        assertThat(service.experienceLevel(List.of(app(1, "HIRED", "Java")))).isEqualTo("HIRED");

        // Rejected after an interview still counts as "interviewed"
        when(stageHistoryRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(5L)).thenReturn(List.of(
                ApplicationStageHistory.builder().applicationId(5L).fromStage("SCREENING").toStage("INTERVIEW").build(),
                ApplicationStageHistory.builder().applicationId(5L).fromStage("INTERVIEW").toStage("REJECTED").build()));
        assertThat(service.experienceLevel(List.of(app(5, "REJECTED", "Java")))).isEqualTo("INTERVIEWED");
    }

    @Test
    @DisplayName("Creating a review stores verified badge + job title and hides identity when anonymous")
    void createAnonymousReview() {
        when(jobApplicationRepository.findByCandidateProfileIdAndCompanyId(9L, COMPANY))
                .thenReturn(List.of(app(1, "INTERVIEW", "Fresher Java Software Engineer")));

        ReviewDto dto = service.create(COMPANY, USER, validRequest());

        ArgumentCaptor<CompanyReview> saved = ArgumentCaptor.forClass(CompanyReview.class);
        verify(reviewRepository).save(saved.capture());
        assertThat(saved.getValue().getExperienceLevel()).isEqualTo("INTERVIEWED");
        assertThat(saved.getValue().getJobTitle()).isEqualTo("Fresher Java Software Engineer");
        assertThat(saved.getValue().getStatus()).isEqualTo("PUBLISHED");
        assertThat(dto.getAnonymous()).isTrue();
        assertThat(dto.getAuthorName()).isNull();
        assertThat(dto.getAuthorEmail()).isNull();
        assertThat(dto.getMine()).isTrue();
    }

    @Test
    @DisplayName("Too-short review content is rejected")
    void contentTooShort() {
        when(jobApplicationRepository.findByCandidateProfileIdAndCompanyId(9L, COMPANY)).thenReturn(List.of(app(1, "APPLIED", "Java")));
        ReviewRequestDto req = validRequest();
        req.setPros("Ok");
        req.setCons(null);
        assertThatThrownBy(() -> service.create(COMPANY, USER, req)).isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("Public listing never leaks identity of anonymous reviews")
    void publicListingHidesAnonymousAuthor() {
        CompanyReview anon = CompanyReview.builder().id(1L).companyId(COMPANY).authorUserId(USER).rating(5).title("Tốt")
                .isAnonymous(true).status("PUBLISHED").build();
        when(reviewRepository.findByCompanyIdAndStatus(eq(COMPANY), eq("PUBLISHED"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(anon)));
        when(userRepository.findAllById(any())).thenReturn(List.of(author));
        when(reviewRepository.ratingHistogram(COMPANY)).thenReturn(List.of(new Object[]{5, 3L}, new Object[]{4, 1L}));

        ReviewPageDto page = service.listPublished(COMPANY, "newest", 0, 10, null);

        assertThat(page.getItems().get(0).getAuthorName()).isNull();
        assertThat(page.getItems().get(0).getMine()).isFalse();
        assertThat(page.getSummary().getCount()).isEqualTo(4);
        assertThat(page.getSummary().getAverage()).isEqualTo(4.8);
        assertThat(page.getSummary().getDistribution()).containsExactly(3L, 1L, 0L, 0L, 0L);
    }

    @Test
    @DisplayName("Admin hiding requires a reason and is written to the audit log")
    void moderationAudited() {
        CompanyReview r = CompanyReview.builder().id(1L).companyId(COMPANY).authorUserId(USER).rating(1).title("Spam")
                .status("PUBLISHED").build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(r));

        assertThatThrownBy(() -> service.moderate(1L, 999L, ModerateReviewRequestDto.builder().status("HIDDEN").build()))
                .isInstanceOf(BadRequestException.class);

        ReviewDto dto = service.moderate(1L, 999L, ModerateReviewRequestDto.builder().status("HIDDEN").note("Ngôn từ xúc phạm").build());
        assertThat(dto.getStatus()).isEqualTo("HIDDEN");
        assertThat(dto.getAuthorEmail()).isEqualTo("an@gmail.com");
        verify(auditLogRepository).save(argThat(a -> "COMPANY_REVIEW_HIDDEN".equals(a.getAction()) && a.getEntityId() == 1L));
    }
}
