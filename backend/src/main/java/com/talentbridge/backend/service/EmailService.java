package com.talentbridge.backend.service;

import com.talentbridge.backend.entity.EmailLog;
import com.talentbridge.backend.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from:TalentBridge <no-reply@talentbridge.vn>}")
    private String mailFrom;

    public void sendEmail(
            String toEmail,
            String subject,
            String heading,
            String recipientName,
            List<String> paragraphs,
            Map<String, String> details,
            String ctaText,
            String ctaUrl,
            String signOff,
            String icsContent,
            String referenceType,
            Long referenceId
    ) {
        if (!mailEnabled) {
            log.info("Email disabled. Skipping email to {} with subject '{}'", toEmail, subject);
            saveLog(toEmail, subject, "base.html", "DISABLED", null, referenceType, referenceId);
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("subject", subject);
            context.setVariable("heading", heading);
            context.setVariable("recipientName", recipientName);
            context.setVariable("paragraphs", paragraphs != null ? paragraphs : List.of());
            context.setVariable("details", details != null ? details.entrySet() : null);
            context.setVariable("ctaText", ctaText);
            context.setVariable("ctaUrl", ctaUrl);
            context.setVariable("signOff", signOff != null ? signOff : "Trân trọng,\nĐội ngũ TalentBridge");

            String htmlBody = templateEngine.process("email/base.html", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, icsContent != null, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (icsContent != null) {
                ByteArrayResource icsResource = new ByteArrayResource(icsContent.getBytes(StandardCharsets.UTF_8));
                helper.addAttachment("invite.ics", icsResource, "text/calendar; charset=UTF-8; method=REQUEST");
            }

            mailSender.send(message);
            log.info("Email successfully sent to {} with subject '{}'", toEmail, subject);
            saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage(), ex);
            String err = ex.getMessage();
            if (err != null && err.length() > 490) {
                err = err.substring(0, 490);
            }
            saveLog(toEmail, subject, "base.html", "FAILED", err, referenceType, referenceId);
        }
    }

    private void saveLog(String toEmail, String subject, String template, String status, String error, String refType, Long refId) {
        try {
            emailLogRepository.save(EmailLog.builder()
                    .toEmail(toEmail)
                    .subject(subject)
                    .template(template)
                    .status(status)
                    .errorMessage(error)
                    .referenceType(refType)
                    .referenceId(refId)
                    .build());
        } catch (Exception e) {
            log.warn("Could not save email log: {}", e.getMessage());
        }
    }
}
