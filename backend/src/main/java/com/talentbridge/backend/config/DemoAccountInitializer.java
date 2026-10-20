package com.talentbridge.backend.config;

import com.talentbridge.backend.entity.ApplicationMessage;
import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.repository.ApplicationMessageRepository;
import com.talentbridge.backend.repository.CandidateProfileRepository;
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

        seedDemoConversationsIfNeeded();
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
                                    .content("Chào Nguyễn Văn An, Hội đồng tuyển dụng FPT Software rất ấn tượng với điểm đối sánh AI (88%) của bạn cho vị trí Fresher .NET Backend Developer. Chúng tôi đã xếp lịch phỏng vấn Vòng 1 qua Google Meet.")
                                    .readAt(base.plusMinutes(10))
                                    .createdAt(base)
                                    .build(),
                            ApplicationMessage.builder()
                                    .applicationId(1L)
                                    .senderUserId(candUserId)
                                    .senderSide("CANDIDATE")
                                    .content("Dạ em chào anh/chị HR FPT Software ạ! Em đã nhận được lịch phỏng vấn và rất hào hứng với cơ hội này. Cho em hỏi vòng phỏng vấn kỹ thuật sẽ tập trung vào phần nào nhất ạ?")
                                    .readAt(base.plusMinutes(25))
                                    .createdAt(base.plusMinutes(15))
                                    .build(),
                            ApplicationMessage.builder()
                                    .applicationId(1L)
                                    .senderUserId(recUserId)
                                    .senderSide("COMPANY")
                                    .content("Buổi phỏng vấn sẽ kéo dài 45 phút, tập trung vào C#, ASP.NET Core Web API, Entity Framework Core và thiết kế cơ sở dữ liệu SQL. Chúc bạn chuẩn bị thật tốt nhé!")
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
                                    .content("Chào Minh Đức, HR FPT Software đang đánh giá CV của bạn ở vòng Sơ loại (Screening). Bạn có thể gửi thêm link GitHub các đồ án .NET gần nhất của bạn tại đây không?")
                                    .readAt(base.plusMinutes(12))
                                    .createdAt(base)
                                    .build(),
                            ApplicationMessage.builder()
                                    .applicationId(2L)
                                    .senderUserId(candUserId)
                                    .senderSide("CANDIDATE")
                                    .content("Em chào HR ạ, em gửi link repo Microservices .NET 8 của em tại https://github.com/phamminhduc-dev/dotnet-clean-arch. Mong sớm nhận được phản hồi từ công ty ạ!")
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
