package com.talentbridge.backend.service;

import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.event.DomainEvents;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailContentFactory {

    private final EmailService emailService;
    private final JobApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final CompanyInvitationRepository invitationRepository;
    private final CompanyRepository companyRepository;
    private final HiringTeamService hiringTeamService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private static final DateTimeFormatter VI_DATETIME = DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy");
    private static final DateTimeFormatter ICS_DATE = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    private User resolveCandidateUser(JobApplication app) {
        if (app == null || app.getCandidateProfileId() == null) return null;
        return candidateProfileRepository.findById(app.getCandidateProfileId())
                .flatMap(cp -> userRepository.findById(cp.getUserId()))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public void handleApplicationSubmitted(DomainEvents.ApplicationSubmitted event) {
        JobApplication app = applicationRepository.findById(event.applicationId()).orElse(null);
        if (app == null) return;
        Job job = app.getJob();
        Company company = job.getCompany();
        User candidate = resolveCandidateUser(app);
        if (candidate == null) return;

        LocalDateTime appliedTime = app.getAppliedAt() != null ? app.getAppliedAt() : LocalDateTime.now();

        // 1. Email to candidate
        String candidateSubject = "Xác nhận nộp hồ sơ: " + job.getTitle() + " - " + company.getName();
        Map<String, String> candDetails = new LinkedHashMap<>();
        candDetails.put("Vị trí", job.getTitle());
        candDetails.put("Công ty", company.getName());
        candDetails.put("Thời gian nộp", appliedTime.format(VI_DATETIME));
        candDetails.put("Địa điểm làm việc", job.getLocationCity() != null ? job.getLocationCity() : "Toàn quốc");

        emailService.sendEmail(
                candidate.getEmail(),
                candidateSubject,
                "Hồ sơ ứng tuyển đã được ghi nhận",
                candidate.getFullName(),
                List.of(
                        "Hồ sơ ứng tuyển của bạn đã được chuyển trực tiếp đến bộ phận tuyển dụng của " + company.getName() + ".",
                        "Nhà tuyển dụng sẽ xem xét hồ sơ và liên hệ với bạn trong thời gian sớm nhất."
                ),
                candDetails,
                "Theo dõi trạng thái hồ sơ",
                frontendUrl + "/my-applications",
                "Trân trọng,\nĐội ngũ Tuyển dụng " + company.getName(),
                null,
                "APPLICATION",
                app.getId()
        );

        // 2. Email to company hiring managers
        List<Long> managerIds = hiringTeamService.managerUserIds(company.getId());
        List<User> managers = userRepository.findAllById(managerIds);
        for (User manager : managers) {
            String recruiterSubject = "[Hồ sơ mới] " + candidate.getFullName() + " ứng tuyển " + job.getTitle();
            Map<String, String> recDetails = new LinkedHashMap<>();
            recDetails.put("Ứng viên", candidate.getFullName());
            recDetails.put("Email", candidate.getEmail());
            if (candidate.getPhone() != null) recDetails.put("Số điện thoại", candidate.getPhone());
            recDetails.put("Vị trí", job.getTitle());

            emailService.sendEmail(
                    manager.getEmail(),
                    recruiterSubject,
                    "Có ứng viên mới nộp hồ sơ",
                    manager.getFullName(),
                    List.of("Hệ thống vừa tiếp nhận hồ sơ ứng tuyển mới cho công việc '" + job.getTitle() + "'."),
                    recDetails,
                    "Xem danh sách ứng viên",
                    frontendUrl + "/employer/applicants?jobId=" + job.getId(),
                    "Trân trọng,\nTalentBridge ATS",
                    null,
                    "APPLICATION",
                    app.getId()
            );
        }
    }

    @Transactional(readOnly = true)
    public void handleApplicationStageChanged(DomainEvents.ApplicationStageChanged event) {
        if (!event.sendEmail()) return;
        JobApplication app = applicationRepository.findById(event.applicationId()).orElse(null);
        if (app == null) return;
        Job job = app.getJob();
        Company company = job.getCompany();
        User candidate = resolveCandidateUser(app);
        if (candidate == null) return;

        String toStage = event.toStage();
        String subject;
        String heading;
        List<String> paragraphs;
        Map<String, String> details = new LinkedHashMap<>();
        details.put("Vị trí", job.getTitle());
        details.put("Công ty", company.getName());

        switch (toStage) {
            case "SCREENING" -> {
                subject = "Cập nhật hồ sơ: Đang xem xét hồ sơ vị trí " + job.getTitle();
                heading = "Hồ sơ của bạn đang được xem xét";
                paragraphs = List.of(
                        "Hồ sơ ứng tuyển của bạn cho vị trí " + job.getTitle() + " tại " + company.getName() + " đã vượt qua vòng lọc ban đầu và đang được bộ phận chuyên môn xem xét chi tiết.",
                        "Chúng tôi sẽ cập nhật kết quả các bước tiếp theo sớm nhất có thể."
                );
            }
            case "INTERVIEW" -> {
                subject = "Lời mời phỏng vấn: " + job.getTitle() + " tại " + company.getName();
                heading = "Lời mời tham gia phỏng vấn";
                paragraphs = List.of(
                        "Chúc mừng bạn! " + company.getName() + " đánh giá cao hồ sơ của bạn và trân trọng mời bạn tham gia vòng phỏng vấn cho vị trí " + job.getTitle() + ".",
                        "Lịch phỏng vấn cụ thể sẽ được gửi kèm trong email tiếp theo hoặc bạn có thể theo dõi trên hệ thống."
                );
            }
            case "OFFERED" -> {
                subject = "Chúc mừng! Thư mời nhận việc (Offer) từ " + company.getName();
                heading = "Thư mời nhận việc chính thức";
                paragraphs = List.of(
                        "Chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn! " + company.getName() + " trân trọng gửi đến bạn lời mời gia nhập đội ngũ.",
                        "Vui lòng đăng nhập vào TalentBridge để kiểm tra chi tiết thư mời và phản hồi."
                );
            }
            case "HIRED" -> {
                subject = "Chào mừng bạn gia nhập " + company.getName() + "!";
                heading = "Chào mừng thành viên mới";
                paragraphs = List.of(
                        "Chúc mừng bạn đã chính thức hoàn tất thủ tục và gia nhập " + company.getName() + " với vị trí " + job.getTitle() + "!",
                        "Chúc bạn có một hành trình làm việc tràn đầy cảm hứng và thành công."
                );
            }
            case "REJECTED" -> {
                subject = "Thông báo kết quả ứng tuyển: " + job.getTitle() + " - " + company.getName();
                heading = "Cảm ơn bạn đã quan tâm ứng tuyển";
                paragraphs = List.of(
                        "Lời đầu tiên, " + company.getName() + " xin chân thành cảm ơn bạn đã dành thời gian và tâm huyết ứng tuyển vào vị trí " + job.getTitle() + ".",
                        "Sau khi cân nhắc kỹ lưỡng giữa các hồ sơ, rất tiếc chúng tôi chưa thể đồng hành cùng bạn ở vị trí này tại thời điểm hiện tại.",
                        "Thông tin của bạn đã được lưu trữ trong cơ sở dữ liệu nhân tài của chúng tôi để ưu tiên liên hệ khi có cơ hội phù hợp hơn trong tương lai. Chúc bạn luôn thành công trên con đường sự nghiệp."
                );
                if (app.getRejectionReason() != null && !app.getRejectionReason().isBlank()) {
                    details.put("Phản hồi từ nhà tuyển dụng", app.getRejectionReason());
                }
            }
            default -> {
                return;
            }
        }

        emailService.sendEmail(
                candidate.getEmail(),
                subject,
                heading,
                candidate.getFullName(),
                paragraphs,
                details,
                "Xem chi tiết hồ sơ",
                frontendUrl + "/my-applications",
                "Trân trọng,\nĐội ngũ Tuyển dụng " + company.getName(),
                null,
                "APPLICATION",
                app.getId()
        );
    }

    @Transactional(readOnly = true)
    public void handleInterviewChanged(DomainEvents.InterviewChanged event) {
        Interview interview = interviewRepository.findById(event.interviewId()).orElse(null);
        if (interview == null) return;
        JobApplication app = applicationRepository.findById(interview.getApplicationId()).orElse(null);
        if (app == null) return;
        Job job = app.getJob();
        Company company = job.getCompany();
        User candidate = resolveCandidateUser(app);
        if (candidate == null) return;

        List<User> panelists = userRepository.findAllById(interview.getPanelistUserIds());
        String change = event.change();

        String formatLabel = switch (interview.getFormat() != null ? interview.getFormat() : "") {
            case "ONLINE" -> "Phỏng vấn Trực tuyến (Online)";
            case "OFFLINE" -> "Phỏng vấn Trực tiếp tại văn phòng";
            case "PHONE" -> "Phỏng vấn qua Điện thoại";
            default -> "Phỏng vấn";
        };

        String timeStr = interview.getScheduledStart().format(VI_DATETIME);
        String durationStr = "45 phút";
        if (interview.getScheduledStart() != null && interview.getScheduledEnd() != null) {
            long minutes = Duration.between(interview.getScheduledStart(), interview.getScheduledEnd()).toMinutes();
            if (minutes > 0) durationStr = minutes + " phút";
        }

        Map<String, String> details = new LinkedHashMap<>();
        details.put("Vị trí", job.getTitle());
        details.put("Công ty", company.getName());
        details.put("Vòng", "Vòng " + interview.getRoundNumber());
        details.put("Hình thức", formatLabel);
        details.put("Thời gian", timeStr + " (" + durationStr + ")");
        if (interview.getLocation() != null && !interview.getLocation().isBlank()) {
            details.put("Địa điểm / Link", interview.getLocation());
        }

        String icsMethod = "CANCELLED".equals(change) ? "CANCEL" : "REQUEST";
        String icsStatus = "CANCELLED".equals(change) ? "CANCELLED" : "CONFIRMED";
        String icsSummary = ("CANCELLED".equals(change) ? "[ĐÃ HUỶ] " : "") + "Phỏng vấn " + job.getTitle() + " - " + company.getName();
        String icsDescription = "Vòng phỏng vấn " + interview.getRoundNumber() + " cho vị trí " + job.getTitle()
                + "\nỨng viên: " + candidate.getFullName()
                + "\nĐịa điểm/Link: " + (interview.getLocation() != null ? interview.getLocation() : "Cập nhật sau");

        LocalDateTime start = interview.getScheduledStart();
        LocalDateTime end = interview.getScheduledEnd() != null ? interview.getScheduledEnd() : start.plusMinutes(45);
        String icsContent = buildIcs(
                "interview-" + interview.getId() + "@talentbridge.vn",
                icsSummary,
                icsDescription,
                interview.getLocation(),
                start,
                end,
                icsMethod,
                icsStatus
        );

        String subjectPrefix = switch (change) {
            case "RESCHEDULED" -> "[Đổi lịch] ";
            case "CANCELLED" -> "[Huỷ lịch] ";
            default -> "[Lịch phỏng vấn] ";
        };

        // 1. Send to candidate
        String candSubject = subjectPrefix + job.getTitle() + " - " + company.getName();
        String candHeading = switch (change) {
            case "RESCHEDULED" -> "Thông báo thay đổi thời gian phỏng vấn";
            case "CANCELLED" -> "Thông báo huỷ lịch phỏng vấn";
            default -> "Thư mời tham gia buổi phỏng vấn";
        };
        List<String> candParagraphs = switch (change) {
            case "RESCHEDULED" -> List.of(
                    "Lịch phỏng vấn cho vị trí " + job.getTitle() + " tại " + company.getName() + " đã được dời sang thời gian mới.",
                    "File lịch (.ics) đính kèm đã được cập nhật tương ứng vào ứng dụng Lịch của bạn."
            );
            case "CANCELLED" -> List.of(
                    "Buổi phỏng vấn cho vị trí " + job.getTitle() + " tại " + company.getName() + " dự kiến vào " + timeStr + " đã được huỷ bỏ.",
                    "Chúng tôi sẽ thông báo lại cho bạn nếu có sắp xếp mới."
            );
            default -> List.of(
                    "Trân trọng mời bạn tham gia buổi phỏng vấn với hội đồng tuyển dụng của " + company.getName() + ".",
                    "File lịch đính kèm (.ics) cho phép bạn thêm nhanh vào Google Calendar, Apple Calendar hoặc Outlook."
            );
        };

        emailService.sendEmail(
                candidate.getEmail(),
                candSubject,
                candHeading,
                candidate.getFullName(),
                candParagraphs,
                details,
                "Xem chi tiết trên TalentBridge",
                frontendUrl + "/my-applications",
                "Trân trọng,\nĐội ngũ Tuyển dụng " + company.getName(),
                icsContent,
                "INTERVIEW",
                interview.getId()
        );

        // 2. Send to panelists
        for (User panelist : panelists) {
            String panSubject = subjectPrefix + "Phỏng vấn ứng viên " + candidate.getFullName() + " - " + job.getTitle();
            String panHeading = switch (change) {
                case "RESCHEDULED" -> "Cập nhật lịch phỏng vấn ứng viên";
                case "CANCELLED" -> "Lịch phỏng vấn ứng viên đã được huỷ";
                default -> "Bạn được phân công làm người phỏng vấn";
            };
            List<String> panParagraphs = switch (change) {
                case "CANCELLED" -> List.of("Buổi phỏng vấn ứng viên " + candidate.getFullName() + " dự kiến vào " + timeStr + " đã bị huỷ.");
                default -> List.of(
                        "Bạn có lịch tham gia hội đồng phỏng vấn ứng viên " + candidate.getFullName() + " cho vị trí " + job.getTitle() + ".",
                        "Vui lòng xem hồ sơ CV của ứng viên trước buổi phỏng vấn và gửi phiếu đánh giá (Scorecard) sau khi hoàn tất."
                );
            };

            Map<String, String> panDetails = new LinkedHashMap<>(details);
            panDetails.put("Ứng viên", candidate.getFullName() + " (" + candidate.getEmail() + ")");

            emailService.sendEmail(
                    panelist.getEmail(),
                    panSubject,
                    panHeading,
                    panelist.getFullName(),
                    panParagraphs,
                    panDetails,
                    "Xem hồ sơ & Đánh giá",
                    frontendUrl + "/employer/applicants?jobId=" + job.getId() + "&appId=" + app.getId(),
                    "Trân trọng,\nTalentBridge ATS",
                    icsContent,
                    "INTERVIEW",
                    interview.getId()
            );
        }
    }

    @Transactional(readOnly = true)
    public void handleTeamInvitationCreated(DomainEvents.TeamInvitationCreated event) {
        CompanyInvitation invitation = invitationRepository.findById(event.invitationId()).orElse(null);
        if (invitation == null) return;
        Company company = companyRepository.findById(invitation.getCompanyId()).orElse(null);
        if (company == null) return;
        User inviter = userRepository.findById(invitation.getInvitedByUserId()).orElse(null);

        String inviterName = inviter != null ? inviter.getFullName() : "Quản trị viên";
        String roleLabel = TeamService.roleLabel(invitation.getTeamRole());

        String subject = "Lời mời gia nhập Đội ngũ Tuyển dụng tại " + company.getName();
        String heading = "Bạn nhận được lời mời tham gia TalentBridge";

        Map<String, String> details = new LinkedHashMap<>();
        details.put("Công ty", company.getName());
        details.put("Vai trò", roleLabel);
        if (invitation.getJobTitle() != null) details.put("Chức danh", invitation.getJobTitle());
        details.put("Người mời", inviterName);
        details.put("Hạn chấp nhận", invitation.getExpiresAt().format(VI_DATETIME));

        String inviteUrl = frontendUrl + "/invite/" + invitation.getToken();

        emailService.sendEmail(
                invitation.getEmail(),
                subject,
                heading,
                invitation.getFullName() != null ? invitation.getFullName() : "Đồng nghiệp",
                List.of(
                        inviterName + " đã mời bạn tham gia đội ngũ tuyển dụng của " + company.getName() + " trên nền tảng TalentBridge với vai trò " + roleLabel + ".",
                        "Hãy nhấn vào nút bên dưới để kích hoạt tài khoản và cùng đồng hành trong các chiến dịch tuyển dụng."
                ),
                details,
                "Chấp nhận lời mời & Kích hoạt tài khoản",
                inviteUrl,
                "Trân trọng,\nĐội ngũ TalentBridge",
                null,
                "TEAM_INVITATION",
                invitation.getId()
        );
    }

    private String buildIcs(
            String uid,
            String summary,
            String description,
            String location,
            LocalDateTime start,
            LocalDateTime end,
            String method,
            String status
    ) {
        ZoneId vnHcm = ZoneId.of("Asia/Ho_Chi_Minh");
        String dtStart = start.atZone(vnHcm).withZoneSameInstant(ZoneOffset.UTC).format(ICS_DATE);
        String dtEnd = end.atZone(vnHcm).withZoneSameInstant(ZoneOffset.UTC).format(ICS_DATE);
        String dtStamp = LocalDateTime.now().atZone(vnHcm).withZoneSameInstant(ZoneOffset.UTC).format(ICS_DATE);

        return "BEGIN:VCALENDAR\r\n"
                + "VERSION:2.0\r\n"
                + "PRODID:-//TalentBridge//Recruitment Platform//VI\r\n"
                + "CALSCALE:GREGORIAN\r\n"
                + "METHOD:" + method + "\r\n"
                + "BEGIN:VEVENT\r\n"
                + "UID:" + uid + "\r\n"
                + "DTSTAMP:" + dtStamp + "\r\n"
                + "DTSTART:" + dtStart + "\r\n"
                + "DTEND:" + dtEnd + "\r\n"
                + "SUMMARY:" + escapeIcs(summary) + "\r\n"
                + "DESCRIPTION:" + escapeIcs(description) + "\r\n"
                + (location != null ? "LOCATION:" + escapeIcs(location) + "\r\n" : "")
                + "STATUS:" + status + "\r\n"
                + "SEQUENCE:0\r\n"
                + "END:VEVENT\r\n"
                + "END:VCALENDAR\r\n";
    }

    private String escapeIcs(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
