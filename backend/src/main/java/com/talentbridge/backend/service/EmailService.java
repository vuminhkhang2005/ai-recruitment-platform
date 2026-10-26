package com.talentbridge.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.util.StringUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from:TalentBridge <no-reply@talentbridge.vn>}")
    private String mailFrom;

    @Value("${spring.mail.host:localhost}")
    private String smtpHost;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.brevo-api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.brevo-sender-email:}")
    private String brevoSenderEmail;

    @Value("${app.mail.brevo-sender-name:TalentBridge Recruitment}")
    private String brevoSenderName;

    @Value("${app.mail.resend-api-key:}")
    private String resendApiKey;

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
            context.setVariable("signOff", signOff);

            String htmlBody = templateEngine.process("email/base.html", context);

            // 1. Free HTTP API Provider #1: Brevo (Sendinblue) — 300 free emails/day to any recipient, works on Render/Railway
            if (StringUtils.hasText(brevoApiKey)) {
                sendViaBrevoApi(toEmail, recipientName, subject, htmlBody, icsContent);
                log.info("[Brevo API] Email successfully sent to {} with subject '{}'", toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
                return;
            }

            // 2. Free HTTP API Provider #2: Resend — 100 free emails/day over HTTPS
            if (StringUtils.hasText(resendApiKey)) {
                sendViaResendApi(toEmail, subject, htmlBody, icsContent);
                log.info("[Resend API] Email successfully sent to {} with subject '{}'", toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
                return;
            }

            // 3. Standard SMTP (Gmail Free App Password 500 emails/day or Local MailDev)
            String effectiveFrom = resolveEffectiveFrom();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, icsContent != null, "UTF-8");
            helper.setFrom(effectiveFrom);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (icsContent != null) {
                ByteArrayResource icsResource = new ByteArrayResource(icsContent.getBytes(StandardCharsets.UTF_8));
                helper.addAttachment("invite.ics", icsResource, "text/calendar; charset=UTF-8; method=REQUEST");
            }

            try {
                mailSender.send(message);
                log.info("[SMTP] Email successfully sent to {} with subject '{}'", toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
            } catch (Exception smtpEx) {
                if (isLocalDevWithoutSmtpDaemon()) {
                    log.info("[LOCAL DEV OUTBOX] Simulated email delivery to {} | Subject: '{}' (Configure BREVO_API_KEY or Gmail MAIL_USERNAME/MAIL_PASSWORD for real inbox delivery)", toEmail, subject);
                    saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
                } else {
                    throw smtpEx;
                }
            }
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage(), ex);
            String err = ex.getMessage();
            if (err != null && err.length() > 490) {
                err = err.substring(0, 490);
            }
            saveLog(toEmail, subject, "base.html", "FAILED", err, referenceType, referenceId);
        }
    }

    private boolean isLocalDevWithoutSmtpDaemon() {
        boolean isLocalHost = "localhost".equalsIgnoreCase(smtpHost) || "127.0.0.1".equals(smtpHost);
        return isLocalHost && !StringUtils.hasText(smtpUsername);
    }

    private String resolveEffectiveFrom() {
        if (StringUtils.hasText(smtpUsername) && smtpUsername.contains("@")
                && (mailFrom == null || mailFrom.contains("no-reply@talentbridge.vn"))) {
            return "TalentBridge Recruitment <" + smtpUsername.trim() + ">";
        }
        return mailFrom;
    }

    private void sendViaBrevoApi(String toEmail, String recipientName, String subject, String htmlBody, String icsContent) throws Exception {
        String senderEmail = StringUtils.hasText(brevoSenderEmail)
                ? brevoSenderEmail.trim()
                : (StringUtils.hasText(smtpUsername) && smtpUsername.contains("@") ? smtpUsername.trim() : extractEmailAddress(mailFrom));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sender", Map.of(
                "name", StringUtils.hasText(brevoSenderName) ? brevoSenderName : "TalentBridge Recruitment",
                "email", senderEmail
        ));
        payload.put("to", List.of(Map.of(
                "email", toEmail,
                "name", StringUtils.hasText(recipientName) ? recipientName : toEmail
        )));
        payload.put("subject", subject);
        payload.put("htmlContent", htmlBody);

        if (StringUtils.hasText(icsContent)) {
            payload.put("attachment", List.of(Map.of(
                    "name", "invite.ics",
                    "content", Base64.getEncoder().encodeToString(icsContent.getBytes(StandardCharsets.UTF_8))
            )));
        }

        String json = objectMapper.writeValueAsString(payload);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .timeout(Duration.ofSeconds(15))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("api-key", brevoApiKey.trim())
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Brevo API returned HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private void sendViaResendApi(String toEmail, String subject, String htmlBody, String icsContent) throws Exception {
        String fromHeader = (mailFrom == null || mailFrom.contains("no-reply@talentbridge.vn"))
                ? "TalentBridge Recruitment <onboarding@resend.dev>"
                : mailFrom;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", fromHeader);
        payload.put("to", List.of(toEmail));
        payload.put("subject", subject);
        payload.put("html", htmlBody);

        if (StringUtils.hasText(icsContent)) {
            payload.put("attachments", List.of(Map.of(
                    "filename", "invite.ics",
                    "content", Base64.getEncoder().encodeToString(icsContent.getBytes(StandardCharsets.UTF_8))
            )));
        }

        String json = objectMapper.writeValueAsString(payload);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + resendApiKey.trim())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Resend API returned HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private String extractEmailAddress(String rawFrom) {
        if (!StringUtils.hasText(rawFrom)) return "no-reply@talentbridge.vn";
        int start = rawFrom.indexOf('<');
        int end = rawFrom.indexOf('>');
        if (start >= 0 && end > start) {
            return rawFrom.substring(start + 1, end).trim();
        }
        return rawFrom.trim();
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
