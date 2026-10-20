package com.talentbridge.backend.config;

import com.talentbridge.backend.entity.User;
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

        if (toUpdate.isEmpty()) {
            return;
        }
        toUpdate.forEach(u -> {
            u.setPasswordHash(hash);
            if (u.getEmail() != null && CORE_DEMO_EMAILS.contains(u.getEmail().trim().toLowerCase())) {
                u.setStatus("ACTIVE");
            }
        });
        userRepository.saveAll(toUpdate);
        log.info("Demo accounts: synchronized default password (Password@123) for {} seeded/demo users", toUpdate.size());
    }
}
