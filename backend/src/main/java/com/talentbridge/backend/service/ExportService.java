package com.talentbridge.backend.service;

import com.talentbridge.backend.common.CsvBuilder;
import com.talentbridge.backend.dto.AdminDtos.AdminCompanyDto;
import com.talentbridge.backend.dto.AdminDtos.AdminJobDto;
import com.talentbridge.backend.dto.AdminDtos.AdminUserDto;
import com.talentbridge.backend.dto.AnalyticsDtos.*;
import com.talentbridge.backend.dto.ApplicationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Builds CSV reports (UTF-8 BOM, Excel friendly) for recruiters and administrators.
 * Data access and authorization reuse the existing services, so exports always match what the user can see on screen.
 */
@Service
@RequiredArgsConstructor
public class ExportService {

    private final ApplicationService applicationService;
    private final AnalyticsService analyticsService;
    private final AdminService adminService;

    private static final Map<String, String[]> STAGE_LABELS = Map.of(
            "APPLIED", new String[]{"Mới ứng tuyển", "Applied"},
            "SCREENING", new String[]{"Sàng lọc", "Screening"},
            "INTERVIEW", new String[]{"Phỏng vấn", "Interview"},
            "OFFERED", new String[]{"Đề nghị nhận việc", "Offered"},
            "HIRED", new String[]{"Đã tuyển", "Hired"},
            "REJECTED", new String[]{"Từ chối", "Rejected"},
            "WITHDRAWN", new String[]{"Đã rút hồ sơ", "Withdrawn"}
    );

    private static boolean vi(String lang) {
        return lang == null || !lang.toLowerCase().startsWith("en");
    }

    private static String stageLabel(String stage, boolean vi) {
        if (stage == null) return "";
        String[] l = STAGE_LABELS.get(stage.toUpperCase());
        return l == null ? stage : (vi ? l[0] : l[1]);
    }

    private static String t(boolean vi, String viText, String enText) {
        return vi ? viText : enText;
    }

    private static String pct(double ratio) {
        // Analytics rates are already percentages (0-100) in AnalyticsService
        return BigDecimal.valueOf(ratio).setScale(1, RoundingMode.HALF_UP).toPlainString() + "%";
    }

    // ------------------------------------------------------------------ recruiter exports

    @Transactional(readOnly = true)
    public byte[] exportApplications(Long jobId, Long userId, boolean isAdmin, String lang) {
        boolean vi = vi(lang);
        List<ApplicationResponseDto> apps = jobId != null
                ? applicationService.getApplicationsForJob(jobId, userId, isAdmin)
                : applicationService.getApplicationsForRecruiter(userId);

        CsvBuilder csv = new CsvBuilder();
        csv.row(
                "ID",
                t(vi, "Ứng viên", "Candidate"),
                "Email",
                t(vi, "Số điện thoại", "Phone"),
                t(vi, "Chức danh", "Headline"),
                t(vi, "Thành phố", "City"),
                t(vi, "Kỹ năng", "Skills"),
                t(vi, "Vị trí ứng tuyển", "Job"),
                t(vi, "Vòng hiện tại", "Stage"),
                t(vi, "Điểm ATS (%)", "ATS score (%)"),
                t(vi, "Ngày nộp", "Applied at"),
                t(vi, "Cập nhật", "Updated at"),
                t(vi, "Lịch phỏng vấn kế tiếp", "Next interview"),
                t(vi, "Lý do từ chối", "Rejection reason"),
                "CV"
        );
        apps.stream()
                .sorted(Comparator.comparing(ApplicationResponseDto::getAppliedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(a -> csv.row(
                        a.getId(),
                        a.getCandidateName(),
                        a.getCandidateEmail(),
                        a.getCandidatePhone(),
                        a.getCandidateHeadline(),
                        a.getCandidateCity(),
                        a.getCandidateSkills(),
                        a.getJobTitle(),
                        stageLabel(a.getCurrentStage(), vi),
                        a.getMatchScore() != null ? a.getMatchScore().setScale(0, RoundingMode.HALF_UP) : null,
                        a.getAppliedAt(),
                        a.getUpdatedAt(),
                        a.getNextInterview() != null ? a.getNextInterview().getScheduledStart() : null,
                        a.getRejectionReason(),
                        a.getCvFileName()
                ));
        return csv.toBytes();
    }

    @Transactional(readOnly = true)
    public byte[] exportAnalytics(Long userId, boolean isAdmin, String lang) {
        boolean vi = vi(lang);
        RecruitmentAnalyticsResponseDto a = analyticsService.getCompanyAnalytics(userId, isAdmin);
        CsvBuilder csv = new CsvBuilder();

        csv.row(t(vi, "BÁO CÁO TUYỂN DỤNG", "RECRUITMENT REPORT"), a.getCompanyName());
        csv.blank();

        KpiMetricsDto k = a.getKpis();
        if (k != null) {
            csv.row(t(vi, "Chỉ số", "KPI"), t(vi, "Giá trị", "Value"));
            csv.row(t(vi, "Tổng số tin", "Total jobs"), k.getTotalJobs());
            csv.row(t(vi, "Tin đang tuyển", "Active jobs"), k.getActiveJobs());
            csv.row(t(vi, "Tổng hồ sơ", "Total applications"), k.getTotalApplications());
            csv.row(t(vi, "Hồ sơ mới", "New applications"), k.getFreshApplications());
            csv.row(t(vi, "Lịch phỏng vấn sắp tới", "Scheduled interviews"), k.getScheduledInterviews());
            csv.row(t(vi, "Số ngày xử lý TB", "Avg. days to review"), k.getAvgDaysToReview());
            csv.row(t(vi, "Số ngày tuyển TB", "Avg. days to hire"), k.getAvgDaysToHire());
            csv.blank();
        }

        FunnelMetricsDto f = a.getFunnel();
        if (f != null) {
            csv.row(t(vi, "Phễu tuyển dụng", "Hiring funnel"), t(vi, "Số lượng", "Count"), t(vi, "Tỉ lệ chuyển đổi", "Conversion"));
            csv.row(stageLabel("APPLIED", vi), f.getAppliedCount(), "");
            csv.row(stageLabel("SCREENING", vi), f.getScreeningCount(), pct(f.getScreeningRate()));
            csv.row(stageLabel("INTERVIEW", vi), f.getInterviewCount(), pct(f.getInterviewRate()));
            csv.row(stageLabel("OFFERED", vi), f.getOfferedCount(), pct(f.getOfferRate()));
            csv.row(stageLabel("HIRED", vi), f.getHiredCount(), pct(f.getHireRate()));
            csv.row(stageLabel("REJECTED", vi), f.getRejectedCount(), "");
            csv.row(t(vi, "Tỉ lệ tuyển tổng thể", "Overall hire rate"), "", pct(f.getOverallHireRate()));
            csv.blank();
        }

        QualityDistributionDto q = a.getQuality();
        if (q != null) {
            csv.row(t(vi, "Chất lượng hồ sơ (ATS)", "Applicant quality (ATS)"), t(vi, "Số lượng", "Count"), "%");
            csv.row(t(vi, "Độ khớp cao (≥ 75%)", "High match (≥ 75%)"), q.getHighMatchCount(), pct(q.getHighMatchPct()));
            csv.row(t(vi, "Trung bình (50–74%)", "Medium (50–74%)"), q.getMediumMatchCount(), pct(q.getMediumMatchPct()));
            csv.row(t(vi, "Thấp (< 50%)", "Low (< 50%)"), q.getLowMatchCount(), pct(q.getLowMatchPct()));
            csv.blank();
        }

        if (a.getTopJobs() != null && !a.getTopJobs().isEmpty()) {
            csv.row(t(vi, "Tin tuyển dụng", "Job"), t(vi, "Trạng thái", "Status"), t(vi, "Lượt xem", "Views"),
                    t(vi, "Hồ sơ", "Applications"), t(vi, "Phỏng vấn", "Interviews"), t(vi, "Đã tuyển", "Hired"),
                    t(vi, "Điểm ATS TB", "Avg. ATS score"));
            for (TopJobMetricDto j : a.getTopJobs()) {
                csv.row(j.getJobTitle(), j.getStatus(), j.getViewsCount(), j.getApplicationsCount(),
                        j.getInterviewCount(), j.getHiredCount(), j.getAvgMatchScore());
            }
            csv.blank();
        }

        if (a.getWeeklyTrend() != null && !a.getWeeklyTrend().isEmpty()) {
            csv.row(t(vi, "Theo tuần", "Weekly trend"), t(vi, "Hồ sơ", "Applications"), t(vi, "Phỏng vấn", "Interviews"), t(vi, "Đã tuyển", "Hires"));
            for (TimelinePointDto p : a.getWeeklyTrend()) {
                csv.row(p.getPeriodLabel(), p.getApplicationsCount(), p.getInterviewsCount(), p.getHiresCount());
            }
        }
        return csv.toBytes();
    }

    // ------------------------------------------------------------------ admin exports

    @Transactional(readOnly = true)
    public byte[] exportUsers(String keyword, String role, String status, String lang) {
        boolean vi = vi(lang);
        CsvBuilder csv = new CsvBuilder();
        csv.row("ID", t(vi, "Họ tên", "Full name"), "Email", t(vi, "Số điện thoại", "Phone"), t(vi, "Vai trò", "Roles"),
                t(vi, "Trạng thái", "Status"), t(vi, "Đã xác minh email", "Email verified"), t(vi, "Công ty", "Company"),
                t(vi, "Chức danh", "Headline"), t(vi, "Ngày tạo", "Created at"));
        for (AdminUserDto u : adminService.getUsers(keyword, role, status)) {
            csv.row(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRoles(), u.getStatus(),
                    Boolean.TRUE.equals(u.getIsEmailVerified()) ? t(vi, "Có", "Yes") : t(vi, "Không", "No"),
                    u.getCompanyName(), u.getCandidateHeadline(), u.getCreatedAt());
        }
        return csv.toBytes();
    }

    @Transactional(readOnly = true)
    public byte[] exportCompanies(String keyword, String verificationStatus, String lang) {
        boolean vi = vi(lang);
        CsvBuilder csv = new CsvBuilder();
        csv.row("ID", t(vi, "Tên công ty", "Company"), t(vi, "Ngành", "Industry"), t(vi, "Quy mô", "Size"),
                t(vi, "Mã số thuế", "Tax code"), t(vi, "Thành phố", "City"), t(vi, "Địa chỉ", "Address"), "Website",
                t(vi, "Xác minh", "Verification"), t(vi, "Số tin", "Jobs"), t(vi, "Số HR", "Recruiters"), t(vi, "Ngày tạo", "Created at"));
        for (AdminCompanyDto c : adminService.getCompanies(keyword, verificationStatus)) {
            csv.row(c.getId(), c.getName(), c.getIndustry(), c.getCompanySize(), c.getTaxCode(), c.getCity(), c.getAddress(),
                    c.getWebsite(), c.getVerificationStatus(), c.getJobCount(), c.getRecruiterCount(), c.getCreatedAt());
        }
        return csv.toBytes();
    }

    @Transactional(readOnly = true)
    public byte[] exportJobs(String keyword, String status, Long companyId, String lang) {
        boolean vi = vi(lang);
        CsvBuilder csv = new CsvBuilder();
        csv.row("ID", t(vi, "Tiêu đề", "Title"), t(vi, "Công ty", "Company"), t(vi, "Hình thức", "Type"),
                t(vi, "Cấp bậc", "Level"), t(vi, "Thành phố", "City"), t(vi, "Lương tối thiểu", "Min salary"),
                t(vi, "Lương tối đa", "Max salary"), t(vi, "Tiền tệ", "Currency"), t(vi, "Trạng thái", "Status"),
                t(vi, "Lượt xem", "Views"), t(vi, "Hồ sơ", "Applications"), t(vi, "Ngày đăng", "Published at"));
        for (AdminJobDto j : adminService.getJobs(keyword, status, companyId)) {
            csv.row(j.getId(), j.getTitle(), j.getCompanyName(), j.getJobType(), j.getExpLevel(), j.getLocationCity(),
                    j.getMinSalary(), j.getMaxSalary(), j.getCurrency(), j.getStatus(), j.getViewsCount(),
                    j.getApplicationsCount(), j.getPublishedAt() != null ? j.getPublishedAt() : j.getCreatedAt());
        }
        return csv.toBytes();
    }
}
