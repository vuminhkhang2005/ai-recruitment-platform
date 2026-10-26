package com.talentbridge.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentbridge.backend.entity.EmailLog;
import com.talentbridge.backend.repository.EmailLogRepository;
import jakarta.mail.internet.InternetAddress;
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
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from:TalentBridge <no-reply@talentbridge.vn>}")
    private String mailFrom;

    @Value("${spring.mail.host:localhost}")
    private String smtpHost;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.google-script-url:}")
    private String googleScriptUrl;

    @Value("${app.mail.google-script-fallback-url:}")
    private String googleScriptFallbackUrl;

    @Value("${app.mail.google-script-secret:}")
    private String googleScriptSecret;

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
        sendEmail(
                toEmail,
                subject,
                heading,
                recipientName,
                paragraphs,
                details,
                ctaText,
                ctaUrl,
                signOff,
                icsContent,
                referenceType,
                referenceId,
                null,
                null
        );
    }

    /**
     * Sends an email using 1 single verified technical sender (Google Apps Script Relay, Brevo, Resend, or SMTP)
     * while dynamically customizing the Sender Display Name (e.g. "Lê Thu Hà — FPT Software") and Reply-To header.
     */
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
            Long referenceId,
            String senderDisplayName,
            String replyToEmail
    ) {
        if (!mailEnabled) {
            log.info("Email disabled. Skipping email to {} with subject '{}'", toEmail, subject);
            saveLog(toEmail, subject, "base.html", "DISABLED", null, referenceType, referenceId);
            return;
        }

        String effectiveDisplayName = StringUtils.hasText(senderDisplayName)
                ? senderDisplayName.trim()
                : extractDisplayName(mailFrom);
        String actualFromEmail = resolveActualSenderEmail();

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
            context.setVariable("senderDisplayName", StringUtils.hasText(senderDisplayName) ? senderDisplayName.trim() : null);
            context.setVariable("replyToEmail", StringUtils.hasText(replyToEmail) ? replyToEmail.trim() : null);

            String htmlBody = templateEngine.process("email/base.html", context);
            String plainTextBody = paragraphs != null && !paragraphs.isEmpty()
                    ? String.join("\n\n", paragraphs)
                    : subject;

            // 1. Primary Free Production Relay: Google Apps Script Mail Relay (same as MinLish deploy branch)
            if (StringUtils.hasText(googleScriptUrl) && StringUtils.hasText(googleScriptSecret)) {
                sendViaGoogleAppsScript(toEmail, subject, plainTextBody, htmlBody, effectiveDisplayName, replyToEmail);
                log.info("[Google Apps Script Relay] Email sent from '{}' (Reply-To: {}) to {} | Subject: '{}'",
                        effectiveDisplayName, replyToEmail, toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
                return;
            }

            // 2. Optional Free HTTP API Provider: Brevo
            if (StringUtils.hasText(brevoApiKey)) {
                sendViaBrevoApi(toEmail, recipientName, subject, htmlBody, icsContent, effectiveDisplayName, replyToEmail);
                log.info("[Brevo API] Email sent from '{}' <{}> (Reply-To: {}) to {} | Subject: '{}'",
                        effectiveDisplayName, actualFromEmail, replyToEmail, toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
                return;
            }

            // 3. Optional Free HTTP API Provider: Resend
            if (StringUtils.hasText(resendApiKey)) {
                sendViaResendApi(toEmail, subject, htmlBody, icsContent, effectiveDisplayName, replyToEmail);
                log.info("[Resend API] Email sent from '{}' to {} | Subject: '{}'", effectiveDisplayName, toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
                return;
            }

            // 4. Standard SMTP (Gmail SMTP or Local MailDev)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, icsContent != null, "UTF-8");
            helper.setFrom(new InternetAddress(actualFromEmail, effectiveDisplayName, StandardCharsets.UTF_8.name()));
            if (StringUtils.hasText(replyToEmail)) {
                helper.setReplyTo(new InternetAddress(replyToEmail.trim(), effectiveDisplayName, StandardCharsets.UTF_8.name()));
            }
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (icsContent != null) {
                ByteArrayResource icsResource = new ByteArrayResource(icsContent.getBytes(StandardCharsets.UTF_8));
                helper.addAttachment("invite.ics", icsResource, "text/calendar; charset=UTF-8; method=REQUEST");
            }

            try {
                mailSender.send(message);
                log.info("[SMTP] Email sent from '{}' <{}> (Reply-To: {}) to {} | Subject: '{}'",
                        effectiveDisplayName, actualFromEmail, replyToEmail, toEmail, subject);
                saveLog(toEmail, subject, "base.html", "SENT", null, referenceType, referenceId);
            } catch (Exception smtpEx) {
                if (isLocalDevWithoutSmtpDaemon()) {
                    log.info("[LOCAL DEV OUTBOX] Simulated email from '{}' <{}> (Reply-To: {}) -> to {} | Subject: '{}'",
                            effectiveDisplayName, actualFromEmail, replyToEmail, toEmail, subject);
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

    private void sendViaGoogleAppsScript(
            String toEmail,
            String subject,
            String plainText,
            String htmlBody,
            String senderDisplayName,
            String replyToEmail
    ) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("secret", googleScriptSecret.trim());
        payload.put("to", toEmail);
        payload.put("subject", subject);
        payload.put("text", plainText != null ? plainText : "");
        payload.put("html", htmlBody != null ? htmlBody : "");
        if (StringUtils.hasText(senderDisplayName)) {
            payload.put("name", senderDisplayName);
            payload.put("senderName", senderDisplayName);
            payload.put("fromName", senderDisplayName);
        }
        if (StringUtils.hasText(replyToEmail)) {
            payload.put("replyTo", replyToEmail.trim());
        }

        String json = objectMapper.writeValueAsString(payload);
        String primaryUrl = googleScriptUrl.trim();
        try {
            postToGoogleAppsScriptUrl(primaryUrl, json);
        } catch (Exception primaryEx) {
            if (StringUtils.hasText(googleScriptFallbackUrl)
                    && !primaryUrl.equalsIgnoreCase(googleScriptFallbackUrl.trim())) {
                log.warn("Primary Google Apps Script URL returned error ({}). Falling back to backup relay URL...",
                        primaryEx.getMessage());
                postToGoogleAppsScriptUrl(googleScriptFallbackUrl.trim(), json);
            } else {
                throw primaryEx;
            }
        }
    }

    private void postToGoogleAppsScriptUrl(String targetUrl, String json) throws Exception {
        HttpRequest postReq = HttpRequest.newBuilder()
                .uri(URI.create(targetUrl))
                .timeout(Duration.ofSeconds(25))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(postReq, HttpResponse.BodyHandlers.ofString());
        int status = response.statusCode();

        // Google Apps Script Web App (/exec) executes doPost(e) and returns HTTP 302 Redirect to script.googleusercontent.com
        if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
            String location = response.headers().firstValue("location").orElse(null);
            if (StringUtils.hasText(location)) {
                HttpRequest getRedirect = HttpRequest.newBuilder()
                        .uri(URI.create(location))
                        .timeout(Duration.ofSeconds(20))
                        .GET()
                        .build();
                response = httpClient.send(getRedirect, HttpResponse.BodyHandlers.ofString());
                status = response.statusCode();
            } else {
                // If 302 returned without location, doPost already executed
                return;
            }
        }

        String bodyText = response.body();
        if (status < 200 || status >= 300) {
            throw new IllegalStateException("Google Apps Script mail failed (" + status + ")");
        }
        if (StringUtils.hasText(bodyText) && bodyText.trim().startsWith("{")) {
            try {
                Map<?, ?> bodyMap = objectMapper.readValue(bodyText, Map.class);
                if (Boolean.FALSE.equals(bodyMap.get("ok"))) {
                    throw new IllegalStateException("Google Apps Script error: " + bodyMap.get("message"));
                }
            } catch (IllegalStateException ise) {
                throw ise;
            } catch (Exception ignored) {
            }
        }
    }

    private boolean isLocalDevWithoutSmtpDaemon() {
        boolean isLocalHost = "localhost".equalsIgnoreCase(smtpHost) || "127.0.0.1".equals(smtpHost);
        return isLocalHost && !StringUtils.hasText(smtpUsername);
    }

    private String resolveActualSenderEmail() {
        if (StringUtils.hasText(brevoSenderEmail) && brevoSenderEmail.contains("@")) {
            return brevoSenderEmail.trim();
        }
        if (StringUtils.hasText(smtpUsername) && smtpUsername.contains("@")) {
            return smtpUsername.trim();
        }
        return extractEmailAddress(mailFrom);
    }

    private void sendViaBrevoApi(
            String toEmail,
            String recipientName,
            String subject,
            String htmlBody,
            String icsContent,
            String senderDisplayName,
            String replyToEmail
    ) throws Exception {
        String senderEmail = resolveActualSenderEmail();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sender", Map.of(
                "name", StringUtils.hasText(senderDisplayName) ? senderDisplayName : brevoSenderName,
                "email", senderEmail
        ));
        if (StringUtils.hasText(replyToEmail)) {
            payload.put("replyTo", Map.of(
                    "name", StringUtils.hasText(senderDisplayName) ? senderDisplayName : brevoSenderName,
                    "email", replyToEmail.trim()
            ));
        }
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

    private void sendViaResendApi(
            String toEmail,
            String subject,
            String htmlBody,
            String icsContent,
            String senderDisplayName,
            String replyToEmail
    ) throws Exception {
        String senderEmail = (mailFrom == null || mailFrom.contains("no-reply@talentbridge.vn"))
                ? "onboarding@resend.dev"
                : extractEmailAddress(mailFrom);
        String fromHeader = (StringUtils.hasText(senderDisplayName) ? senderDisplayName : "TalentBridge Recruitment")
                + " <" + senderEmail + ">";

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", fromHeader);
        if (StringUtils.hasText(replyToEmail)) {
            payload.put("reply_to", replyToEmail.trim());
        }
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

    private String extractDisplayName(String rawFrom) {
        if (!StringUtils.hasText(rawFrom)) return "TalentBridge Recruitment";
        int start = rawFrom.indexOf('<');
        if (start > 0) {
            return rawFrom.substring(0, start).trim();
        }
        return "TalentBridge Recruitment";
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
