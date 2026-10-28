package com.talentbridge.backend.config;

import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.CompanyReview;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.CompanyReviewRepository;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.UserRepository;
import com.talentbridge.backend.service.CompanyReviewService;
import com.talentbridge.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Seeds a handful of company reviews for the demo database so company pages are not empty.
 * <ul>
 *   <li>Runs only once (when the table is empty) and only in demo mode.</li>
 *   <li>Reviews are written exclusively by SEEDED demo candidates for companies they really applied to —
 *       real accounts (Google sign-in, students...) are never used.</li>
 *   <li>The quick-login demo candidate is left without reviews so the "write a review" flow can be demonstrated.</li>
 * </ul>
 */
@Slf4j
@Component
@Order(20)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.reset-placeholder-passwords", havingValue = "true")
public class DemoReviewSeeder implements ApplicationRunner {

    private static final Set<String> KEEP_WITHOUT_REVIEWS = Set.of("nguyenvanan.it@gmail.com", "khang.candidate@talentbridge.vn");

    private record Template(int rating, String title, String pros, String cons) {}

    private static final List<Template> POSITIVE = List.of(
            new Template(5, "Fast, transparent and respectful hiring process",
                    "HR replied within two days and shared the full interview timeline up front. Technical questions were practical and closely related to the job description.",
                    "The online assessment was a bit long for a fresher role."),
            new Template(5, "Great interview experience with senior engineers",
                    "Interviewers explained the team's architecture and gave honest feedback after the coding round. The offer details were clear.",
                    "Scheduling the final round took about one week."),
            new Template(4, "Professional process, clear expectations",
                    "Well-structured interviews, friendly interviewers and a realistic take-home task. I learned a lot even before joining.",
                    "Salary range was only discussed in the last round."));

    private static final List<Template> NEUTRAL = List.of(
            new Template(4, "Good technical interview, slow feedback",
                    "Questions focused on fundamentals (OOP, SQL, REST) and the interviewer was patient with follow-up questions.",
                    "It took almost two weeks to receive the result after the interview."),
            new Template(3, "Average experience overall",
                    "The job description matched what was discussed in the interview and the office is easy to reach.",
                    "Little feedback after the screening call and the process felt a bit generic."));

    private static final List<Template> CRITICAL = List.of(
            new Template(3, "Fair process but no detailed feedback",
                    "Recruiter was polite and the interview questions were relevant to the role.",
                    "The rejection e-mail did not include any feedback on what to improve."),
            new Template(2, "Long waiting time between rounds",
                    "Interesting projects and a modern tech stack were presented during the interview.",
                    "Communication was slow and one interview was rescheduled twice at short notice."));

    private final CompanyReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyReviewService reviewService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            if (reviewRepository.count() > 0) return;
            int created = 0;
            for (User user : userRepository.findAll()) {
                String email = user.getEmail() == null ? "" : user.getEmail().trim().toLowerCase();
                if (!EmailService.isSeededDemoAddress(email) || KEEP_WITHOUT_REVIEWS.contains(email)) continue;
                Optional<CandidateProfile> profile = candidateProfileRepository.findByUserId(user.getId());
                if (profile.isEmpty()) continue;

                // One review per company the seeded candidate applied to (keep the most advanced application)
                Map<Long, JobApplication> byCompany = new LinkedHashMap<>();
                for (JobApplication a : jobApplicationRepository.findByCandidateProfileId(profile.get().getId())) {
                    if (a.getJob() == null || a.getJob().getCompany() == null) continue;
                    byCompany.merge(a.getJob().getCompany().getId(), a, (x, y) -> rank(y.getCurrentStage()) > rank(x.getCurrentStage()) ? y : x);
                }
                for (Map.Entry<Long, JobApplication> e : byCompany.entrySet()) {
                    JobApplication app = e.getValue();
                    String stage = app.getCurrentStage() == null ? "APPLIED" : app.getCurrentStage();
                    List<Template> pool = switch (stage) {
                        case "HIRED", "OFFERED" -> POSITIVE;
                        case "REJECTED" -> CRITICAL;
                        default -> NEUTRAL;
                    };
                    Template t = pool.get((int) ((user.getId() + e.getKey()) % pool.size()));
                    LocalDateTime when = (app.getUpdatedAt() != null ? app.getUpdatedAt() : LocalDateTime.now().minusDays(10)).plusDays(1);
                    if (when.isAfter(LocalDateTime.now())) when = LocalDateTime.now().minusHours(3);
                    reviewRepository.save(CompanyReview.builder()
                            .companyId(e.getKey())
                            .authorUserId(user.getId())
                            .rating(t.rating())
                            .title(t.title())
                            .pros(t.pros())
                            .cons(t.cons())
                            .experienceLevel(reviewService.experienceLevel(List.of(app)))
                            .jobTitle(app.getJob().getTitle())
                            .isAnonymous(user.getId() % 3 != 0)
                            .status("PUBLISHED")
                            .createdAt(when)
                            .updatedAt(when)
                            .build());
                    created++;
                }
            }
            if (created > 0) {
                log.info("Demo data: seeded {} company reviews from seeded demo candidates", created);
            }
        } catch (Exception ex) {
            // Never block application start-up because of demo data
            log.warn("Demo data: could not seed company reviews: {}", ex.getMessage());
        }
    }

    private static int rank(String stage) {
        if (stage == null) return 1;
        return switch (stage) {
            case "HIRED" -> 3;
            case "INTERVIEW", "OFFERED" -> 2;
            default -> 1;
        };
    }
}
