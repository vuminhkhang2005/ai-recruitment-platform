package com.talentbridge.backend.config;

import com.talentbridge.backend.entity.ApplicationMessage;
import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.repository.ApplicationMessageRepository;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.CompanyRepository;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import com.talentbridge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * The SQL seed (docs/phase-2-design/03_SEED_DATA.sql) ships with a placeholder BCrypt string
 * that does not correspond to any password, so none of the seeded accounts could log in.
 * On startup this replaces that placeholder with a real hash of {@code app.demo.default-password}.
 * Accounts that already have a real password are never touched.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.reset-placeholder-passwords", havingValue = "true")
public class DemoAccountInitializer implements ApplicationRunner {

    static final String SEED_PLACEHOLDER_PREFIX = "$2a$12$e8M9KzD4s";

    /**
     * Core demo accounts displayed on the Login page quick-access panel.
     * Always guarantee these accounts are ACTIVE and match {@code app.demo.default-password}.
     */
    private static final List<String> CORE_DEMO_EMAILS = List.of(
            "admin@talentbridge.vn",
            "recruiter.fpt@fpt.com",
            "recruiter.vng@vng.com.vn",
            "nguyenvanan.it@gmail.com",
            "tranminhtuan.ai@gmail.com",
            "khang.candidate@talentbridge.vn",
            "khang.recruiter@talentbridge.vn"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationMessageRepository messageRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;

    @Value("${app.demo.default-password:Password@123}")
    private String defaultPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String hash = passwordEncoder.encode(defaultPassword);
        List<User> toUpdate = userRepository.findAll().stream()
                .filter(u -> {
                    boolean hasPlaceholder = u.getPasswordHash() != null
                            && u.getPasswordHash().startsWith(SEED_PLACEHOLDER_PREFIX);
                    boolean isCoreDemo = u.getEmail() != null
                            && CORE_DEMO_EMAILS.contains(u.getEmail().trim().toLowerCase());
                    if (isCoreDemo) {
                        boolean passwordMatches = u.getPasswordHash() != null
                                && passwordEncoder.matches(defaultPassword, u.getPasswordHash());
                        boolean isActive = "ACTIVE".equals(u.getStatus());
                        return !passwordMatches || !isActive;
                    }
                    return hasPlaceholder;
                })
                .toList();

        if (!toUpdate.isEmpty()) {
            toUpdate.forEach(u -> {
                u.setPasswordHash(hash);
                if (u.getEmail() != null && CORE_DEMO_EMAILS.contains(u.getEmail().trim().toLowerCase())) {
                    u.setStatus("ACTIVE");
                }
            });
            userRepository.saveAll(toUpdate);
            log.info("Demo accounts: synchronized default password (Password@123) for {} seeded/demo users", toUpdate.size());
        }

        seedCompanyBannersIfNeeded();
        seedDemoConversationsIfNeeded();
    }

    private void seedCompanyBannersIfNeeded() {
        try {
            List<Company> companies = companyRepository.findAll();
            int updated = 0;
            for (Company c : companies) {
                if (c.getBannerUrl() == null || c.getBannerUrl().isBlank()) {
                    String nameLower = c.getName() != null ? c.getName().toLowerCase() : "";
                    String resolved = null;
                    if (nameLower.contains("nab")) resolved = "/companies/nab-hq.jpg";
                    else if (nameLower.contains("tiki")) resolved = "/companies/tiki-hq.jpg";
                    else if (nameLower.contains("kms")) resolved = "/companies/kms-hq.jpg";
                    else if (nameLower.contains("nashtech")) resolved = "/companies/nashtech-hq.jpg";
                    else if (nameLower.contains("axon")) resolved = "/companies/axon-hq.jpg";
                    else if (nameLower.contains("fpt")) resolved = "/companies/fpt-campus.png";
                    else if (nameLower.contains("vng")) resolved = "/companies/vng-campus.jpg";
                    else if (nameLower.contains("viettel")) resolved = "/companies/viettel-hq.jpg";
                    else if (nameLower.contains("onemount") || nameLower.contains("one mount")) resolved = "/companies/onemount-og.webp";
                    else if (nameLower.contains("momo")) resolved = "/companies/momo-hq.jpg";
                    if (resolved != null) {
                        c.setBannerUrl(resolved);
                        updated++;
                    }
                }
            }
            if (updated > 0) {
                companyRepository.saveAll(companies);
                log.info("Demo companies: populated missing bannerUrl for {} companies", updated);
            }
        } catch (Exception e) {
            log.warn("Could not seed company banners: {}", e.getMessage());
        }
    }

    private void seedDemoConversationsIfNeeded() {
        try {
            // Seed realistic conversation for Application #1 (FPT Software <-> Nguyễn Văn An)
            jobApplicationRepository.findById(1L).ifPresent(app -> {
                if (messageRepository.countByApplicationId(1L) == 0 && app.getJob() != null) {
                    Long recUserId = recruiterProfileRepository.findById(app.getJob().getRecruiterId())
                            .map(RecruiterProfile::getUserId).orElse(2L);
                    Long candUserId = candidateProfileRepository.findById(app.getCandidateProfileId())
                            .map(CandidateProfile::getUserId).orElse(12L);
                    LocalDateTime base = LocalDateTime.now().minusHours(6);
                    messageRepository.saveAll(List.of(
                            ApplicationMessage.builder()
                                    .applicationId(1L)
                                    .senderUserId(recUserId)
                                    .senderSide("COMPANY")
                                    .content("Hello Nguyen Van An, FPT Software's hiring committee is very impressed with your 88% AI Match Score for the Fresher .NET Backend Developer position. We have scheduled your Round 1 interview via Google Meet.")
                                    .readAt(base.plusMinutes(10))
                                    .createdAt(base)
                                    .build(),
                            ApplicationMessage.builder()
                                    .applicationId(1L)
                                    .senderUserId(candUserId)
                                    .senderSide("CANDIDATE")
                                    .content("Hello FPT Software HR team! I have received the interview invitation and am very excited about this opportunity. Could you share which areas the technical interview will focus on?")
                                    .readAt(base.plusMinutes(25))
                                    .createdAt(base.plusMinutes(15))
                                    .build(),
                            ApplicationMessage.builder()
                                    .applicationId(1L)
                                    .senderUserId(recUserId)
                                    .senderSide("COMPANY")
                                    .content("The interview will last 45 minutes and focus on C#, ASP.NET Core Web API, Entity Framework Core, and SQL database design. Best of luck with your preparation!")
                                    .readAt(null)
                                    .createdAt(base.plusMinutes(30))
                                    .build()
                    ));
                }
            });

            // Seed realistic conversation for Application #2 (FPT Software <-> Phạm Minh Đức)
            jobApplicationRepository.findById(2L).ifPresent(app -> {
                if (messageRepository.countByApplicationId(2L) == 0 && app.getJob() != null) {
                    Long recUserId = recruiterProfileRepository.findById(app.getJob().getRecruiterId())
                            .map(RecruiterProfile::getUserId).orElse(2L);
                    Long candUserId = candidateProfileRepository.findById(app.getCandidateProfileId())
                            .map(CandidateProfile::getUserId).orElse(13L);
                    LocalDateTime base = LocalDateTime.now().minusHours(3);
                    messageRepository.saveAll(List.of(
                            ApplicationMessage.builder()
                                    .applicationId(2L)
                                    .senderUserId(recUserId)
                                    .senderSide("COMPANY")
                                    .content("Hello Minh Duc, FPT Software HR is reviewing your CV in the Screening stage. Could you share your GitHub link for your most recent .NET projects here?")
                                    .readAt(base.plusMinutes(12))
                                    .createdAt(base)
                                    .build(),
                            ApplicationMessage.builder()
                                    .applicationId(2L)
                                    .senderUserId(candUserId)
                                    .senderSide("CANDIDATE")
                                    .content("Hello HR team, here is my .NET 8 Microservices repository: https://github.com/phamminhduc-dev/dotnet-clean-arch. Looking forward to your feedback!")
                                    .readAt(null)
                                    .createdAt(base.plusMinutes(20))
                                    .build()
                    ));
                }
            });
        } catch (Exception e) {
            log.warn("Could not seed demo conversations: {}", e.getMessage());
        }
    }
}
