package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.InterviewDtos;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.event.DomainEvents;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Interview scheduling (rounds, panel, online/offline) and rubric scorecards.
 * Candidates see their schedule; the hiring team additionally sees the panel and evaluations.
 * Interviewers only see other panelists' scorecards after submitting their own (reduces bias).
 */
@Service
@RequiredArgsConstructor
public class InterviewService {

    public static final Set<String> FORMATS = Set.of("ONLINE", "OFFLINE");
    public static final Set<String> RECOMMENDATIONS = Set.of("STRONG_HIRE", "HIRE", "NEUTRAL", "NO_HIRE", "STRONG_NO_HIRE");
    private static final Set<String> ACTIVE = Set.of("SCHEDULED", "RESCHEDULED");
    private static final DateTimeFormatter VI_DATE_TIME = DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy");

    private final InterviewRepository interviewRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final JobApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final HiringTeamService hiringTeamService;
    private final ApplicationService applicationService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    // ------------------------------------------------------------------ queries

    @Transactional(readOnly = true)
    public List<InterviewDtos.InterviewDto> listForApplication(Long applicationId, Long userId, boolean isAdmin) {
        JobApplication app = findApp(applicationId);
        List<Interview> interviews = interviewRepository.findByApplicationIdOrderByRoundNumberAscScheduledStartAsc(applicationId);
        if (isAdmin) {
            return interviews.stream().map(i -> toTeamDto(i, app, userId, true)).toList();
        }
        if (isCandidateOwner(userId, app)) {
            return interviews.stream().map(i -> toCandidateDto(i, app)).toList();
        }
        RecruiterProfile rp = hiringTeamService.assertCanViewApplication(userId, app, "Bạn không có quyền xem lịch phỏng vấn của hồ sơ này");
        boolean manager = HiringTeamService.isManager(rp);
        return interviews.stream().map(i -> toTeamDto(i, app, userId, manager)).toList();
    }

    /** Personal agenda: candidate → own interviews; manager → company; interviewer → panels they sit on. */
    @Transactional(readOnly = true)
    public List<InterviewDtos.InterviewDto> upcoming(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        CandidateProfile cp = candidateProfileRepository.findByUserId(userId).orElse(null);
        if (cp != null) {
            return interviewRepository.findUpcomingForCandidate(cp.getId(), now).stream()
                    .map(i -> toCandidateDto(i, findApp(i.getApplicationId())))
                    .toList();
        }
        RecruiterProfile rp = hiringTeamService.findMember(userId).orElse(null);
        if (rp == null) {
            return List.of();
        }
        boolean manager = HiringTeamService.isManager(rp);
        List<Interview> list = manager
                ? interviewRepository.findUpcomingForCompany(rp.getCompanyId(), now)
                : interviewRepository.findUpcomingForPanelist(userId, now);
        return list.stream().map(i -> toTeamDto(i, findApp(i.getApplicationId()), userId, manager)).toList();
    }

    // ------------------------------------------------------------------ commands

    @Transactional
    public InterviewDtos.InterviewDto schedule(Long applicationId, Long userId, InterviewDtos.ScheduleRequest req) {
        JobApplication app = findApp(applicationId);
        RecruiterProfile scheduler = hiringTeamService.assertCanManageApplication(userId, app, "Bạn không có quyền lên lịch phỏng vấn cho hồ sơ này");
        if (Set.of("HIRED", "REJECTED").contains(app.getCurrentStage())) {
            throw new BadRequestException("Hồ sơ đã kết thúc, không thể lên lịch phỏng vấn.");
        }

        validateTimes(req.getScheduledStart(), req.getScheduledEnd());
        String format = normalizeFormat(req.getFormat());
        String location = requireLocation(format, req.getLocation());
        Set<Long> panel = resolvePanel(req.getPanelistUserIds(), scheduler);

        int round = (int) interviewRepository.countByApplicationId(applicationId) + 1;
        Interview saved = interviewRepository.save(Interview.builder()
                .uuid(UUID.randomUUID().toString())
                .applicationId(applicationId)
                .roundNumber(round)
                .scheduledStart(req.getScheduledStart())
                .scheduledEnd(req.getScheduledEnd())
                .format(format)
                .location(location)
                .status("SCHEDULED")
                .notesToCandidate(StringUtils.hasText(req.getNotesToCandidate()) ? req.getNotesToCandidate().strip() : null)
                .panelistUserIds(new HashSet<>(panel))
                .build());

        if (Set.of("APPLIED", "SCREENING").contains(app.getCurrentStage())) {
            applicationService.moveToStage(applicationId, "INTERVIEW", userId,
                    "Lên lịch phỏng vấn vòng " + round + " lúc " + VI_DATE_TIME.format(saved.getScheduledStart()), false);
        }

        String jobTitle = app.getJob().getTitle();
        notifyCandidate(app, "INTERVIEW_SCHEDULED",
                "Lịch phỏng vấn vòng " + round + ": " + jobTitle,
                "Bạn có lịch phỏng vấn " + ("ONLINE".equals(format) ? "trực tuyến" : "trực tiếp") + " lúc " + VI_DATE_TIME.format(saved.getScheduledStart()) + ".");
        notifyPanel(panel, userId, app, "INTERVIEW_PANEL",
                "Bạn được mời phỏng vấn ứng viên " + candidateName(app),
                jobTitle + " · vòng " + round + " · " + VI_DATE_TIME.format(saved.getScheduledStart()));

        eventPublisher.publishEvent(new DomainEvents.InterviewChanged(saved.getId(), "SCHEDULED"));
        return toTeamDto(saved, app, userId, true);
    }

    @Transactional
    public InterviewDtos.InterviewDto update(Long interviewId, Long userId, InterviewDtos.UpdateRequest req) {
        Interview interview = findInterview(interviewId);
        JobApplication app = findApp(interview.getApplicationId());
        RecruiterProfile actor = hiringTeamService.assertCanManageApplication(userId, app, "Bạn không có quyền cập nhật lịch phỏng vấn này");

        if (!ACTIVE.contains(interview.getStatus())) {
            throw new BadRequestException("Buổi phỏng vấn đã " + ("COMPLETED".equals(interview.getStatus()) ? "hoàn thành" : "bị hủy") + ", không thể chỉnh sửa.");
        }

        String jobTitle = app.getJob().getTitle();
        String status = req.getStatus() == null ? null : req.getStatus().trim().toUpperCase();

        if ("CANCELLED".equals(status)) {
            interview.setStatus("CANCELLED");
            Interview saved = interviewRepository.save(interview);
            notifyCandidate(app, "INTERVIEW_CANCELLED", "Lịch phỏng vấn vòng " + saved.getRoundNumber() + " đã bị hủy",
                    jobTitle + ": buổi phỏng vấn lúc " + VI_DATE_TIME.format(saved.getScheduledStart()) + " đã được hủy. Nhà tuyển dụng sẽ liên hệ lại.");
            notifyPanel(saved.getPanelistUserIds(), userId, app, "INTERVIEW_PANEL", "Đã hủy lịch phỏng vấn " + candidateName(app),
                    jobTitle + " · vòng " + saved.getRoundNumber());
            eventPublisher.publishEvent(new DomainEvents.InterviewChanged(saved.getId(), "CANCELLED"));
            return toTeamDto(saved, app, userId, true);
        }
        if ("COMPLETED".equals(status)) {
            interview.setStatus("COMPLETED");
            return toTeamDto(interviewRepository.save(interview), app, userId, true);
        }
        if (status != null && !status.isEmpty() && !ACTIVE.contains(status)) {
            throw new BadRequestException("Trạng thái phỏng vấn không hợp lệ: " + req.getStatus());
        }

        boolean rescheduled = false;
        LocalDateTime start = req.getScheduledStart() != null ? req.getScheduledStart() : interview.getScheduledStart();
        LocalDateTime end = req.getScheduledEnd() != null ? req.getScheduledEnd() : interview.getScheduledEnd();
        if (!start.equals(interview.getScheduledStart()) || !end.equals(interview.getScheduledEnd())) {
            validateTimes(start, end);
            interview.setScheduledStart(start);
            interview.setScheduledEnd(end);
            rescheduled = true;
        }
        if (StringUtils.hasText(req.getFormat())) {
            String format = normalizeFormat(req.getFormat());
            rescheduled |= !format.equals(interview.getFormat());
            interview.setFormat(format);
        }
        if (req.getLocation() != null) {
            String location = requireLocation(interview.getFormat(), req.getLocation());
            rescheduled |= !location.equals(interview.getLocation());
            interview.setLocation(location);
        }
        if (req.getNotesToCandidate() != null) {
            interview.setNotesToCandidate(StringUtils.hasText(req.getNotesToCandidate()) ? req.getNotesToCandidate().strip() : null);
        }
        Set<Long> addedPanelists = Set.of();
        if (req.getPanelistUserIds() != null) {
            Set<Long> panel = resolvePanel(req.getPanelistUserIds(), actor);
            addedPanelists = panel.stream().filter(id -> !interview.getPanelistUserIds().contains(id)).collect(Collectors.toSet());
            interview.getPanelistUserIds().clear();
            interview.getPanelistUserIds().addAll(panel);
        }
        if (rescheduled) {
            interview.setStatus("RESCHEDULED");
        }
        Interview saved = interviewRepository.save(interview);

        if (rescheduled) {
            notifyCandidate(app, "INTERVIEW_RESCHEDULED", "Lịch phỏng vấn vòng " + saved.getRoundNumber() + " được dời",
                    jobTitle + ": thời gian mới " + VI_DATE_TIME.format(saved.getScheduledStart()) + ".");
            notifyPanel(saved.getPanelistUserIds(), userId, app, "INTERVIEW_PANEL", "Dời lịch phỏng vấn " + candidateName(app),
                    jobTitle + " · " + VI_DATE_TIME.format(saved.getScheduledStart()));
            eventPublisher.publishEvent(new DomainEvents.InterviewChanged(saved.getId(), "RESCHEDULED"));
        } else if (!addedPanelists.isEmpty()) {
            notifyPanel(addedPanelists, userId, app, "INTERVIEW_PANEL", "Bạn được mời phỏng vấn ứng viên " + candidateName(app),
                    jobTitle + " · vòng " + saved.getRoundNumber() + " · " + VI_DATE_TIME.format(saved.getScheduledStart()));
        }
        return toTeamDto(saved, app, userId, true);
    }

    @Transactional
    public InterviewDtos.EvaluationDto evaluate(Long interviewId, Long userId, InterviewDtos.EvaluationRequest req) {
        Interview interview = findInterview(interviewId);
        JobApplication app = findApp(interview.getApplicationId());
        RecruiterProfile rp = hiringTeamService.assertCanViewApplication(userId, app, "Bạn không có quyền đánh giá buổi phỏng vấn này");
        boolean panelist = interview.getPanelistUserIds().contains(userId);
        if (!panelist && !HiringTeamService.isManager(rp)) {
            throw new AccessDeniedException("Chỉ thành viên hội đồng phỏng vấn mới gửi được phiếu đánh giá");
        }
        if ("CANCELLED".equals(interview.getStatus())) {
            throw new BadRequestException("Buổi phỏng vấn đã bị hủy, không thể đánh giá.");
        }
        String recommendation = req.getRecommendation() == null ? "" : req.getRecommendation().trim().toUpperCase();
        if (!RECOMMENDATIONS.contains(recommendation)) {
            throw new BadRequestException("Đề xuất tuyển dụng không hợp lệ: " + req.getRecommendation());
        }
        for (Integer score : List.of(req.getTechnicalScore(), req.getCommunicationScore(), req.getProblemSolvingScore(), req.getCultureFitScore())) {
            if (score == null || score < 1 || score > 5) {
                throw new BadRequestException("Điểm đánh giá phải từ 1 đến 5");
            }
        }

        InterviewEvaluation evaluation = evaluationRepository.findByInterviewIdAndInterviewerUserId(interviewId, userId)
                .orElseGet(() -> InterviewEvaluation.builder().interviewId(interviewId).interviewerUserId(userId).build());
        boolean isNew = evaluation.getId() == null;
        evaluation.setTechnicalScore(req.getTechnicalScore());
        evaluation.setCommunicationScore(req.getCommunicationScore());
        evaluation.setProblemSolvingScore(req.getProblemSolvingScore());
        evaluation.setCultureFitScore(req.getCultureFitScore());
        evaluation.setRecommendation(recommendation);
        evaluation.setFeedbackNotes(StringUtils.hasText(req.getFeedbackNotes()) ? req.getFeedbackNotes().strip() : null);
        evaluation.setSubmittedAt(LocalDateTime.now());
        InterviewEvaluation saved = evaluationRepository.save(evaluation);

        if (!panelist) {
            interview.getPanelistUserIds().add(userId);
            interviewRepository.save(interview);
        }

        if (isNew) {
            String evaluator = userRepository.findById(userId).map(User::getFullName).orElse("");
            recruiterProfileRepository.findById(app.getJob().getRecruiterId())
                    .map(RecruiterProfile::getUserId)
                    .filter(ownerId -> !ownerId.equals(userId))
                    .ifPresent(ownerId -> notificationService.notify(ownerId, "INTERVIEW_EVALUATION",
                            "Phiếu đánh giá mới: " + candidateName(app),
                            evaluator + " đề xuất \"" + recommendationLabel(recommendation) + "\" cho vòng " + interview.getRoundNumber() + " – " + app.getJob().getTitle() + ".",
                            "APPLICATION", app.getId()));
        }
        return toEvaluationDto(saved, Map.of(userId, userRepository.findById(userId).map(User::getFullName).orElse("")));
    }

    // ------------------------------------------------------------------ validation

    private void validateTimes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new BadRequestException("Vui lòng chọn thời gian bắt đầu và kết thúc");
        }
        if (!end.isAfter(start)) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        if (Duration.between(start, end).toHours() > 8) {
            throw new BadRequestException("Một buổi phỏng vấn không quá 8 giờ");
        }
        if (start.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BadRequestException("Thời gian phỏng vấn phải ở tương lai");
        }
    }

    private String normalizeFormat(String raw) {
        String format = raw == null ? "" : raw.trim().toUpperCase();
        if (!FORMATS.contains(format)) {
            throw new BadRequestException("Hình thức phỏng vấn không hợp lệ (ONLINE / OFFLINE)");
        }
        return format;
    }

    private String requireLocation(String format, String raw) {
        String location = raw == null ? "" : raw.strip();
        if (location.isEmpty()) {
            throw new BadRequestException("ONLINE".equals(format)
                    ? "Vui lòng nhập link họp trực tuyến (Google Meet, Zoom, Teams...)"
                    : "Vui lòng nhập địa điểm / phòng họp");
        }
        if ("ONLINE".equals(format) && !location.matches("(?i)^https?://\\S+$")) {
            throw new BadRequestException("Link họp trực tuyến phải bắt đầu bằng http:// hoặc https://");
        }
        return location;
    }

    /** Panel members must belong to the same company. Defaults to the scheduler. */
    private Set<Long> resolvePanel(List<Long> requested, RecruiterProfile actor) {
        Set<Long> panel = new LinkedHashSet<>();
        if (requested == null || requested.isEmpty()) {
            panel.add(actor.getUserId());
            return panel;
        }
        Set<Long> companyUserIds = recruiterProfileRepository.findByCompanyIdOrderByIdAsc(actor.getCompanyId()).stream()
                .map(RecruiterProfile::getUserId).collect(Collectors.toSet());
        for (Long id : requested) {
            if (id == null) continue;
            if (!companyUserIds.contains(id)) {
                throw new BadRequestException("Người phỏng vấn #" + id + " không thuộc đội tuyển dụng của công ty");
            }
            panel.add(id);
        }
        if (panel.size() > 10) {
            throw new BadRequestException("Hội đồng phỏng vấn tối đa 10 người");
        }
        return panel;
    }

    // ------------------------------------------------------------------ notifications

    private void notifyCandidate(JobApplication app, String type, String title, String content) {
        candidateProfileRepository.findById(app.getCandidateProfileId())
                .ifPresent(cp -> notificationService.notify(cp.getUserId(), type, title, content, "APPLICATION", app.getId()));
    }

    private void notifyPanel(Collection<Long> panel, Long actorUserId, JobApplication app, String type, String title, String content) {
        for (Long uid : panel) {
            if (!uid.equals(actorUserId)) {
                notificationService.notify(uid, type, title, content, "APPLICATION", app.getId());
            }
        }
    }

    // ------------------------------------------------------------------ mapping

    private boolean isCandidateOwner(Long userId, JobApplication app) {
        return candidateProfileRepository.findByUserId(userId).map(p -> p.getId().equals(app.getCandidateProfileId())).orElse(false);
    }

    private String candidateName(JobApplication app) {
        return candidateProfileRepository.findById(app.getCandidateProfileId())
                .flatMap(cp -> userRepository.findById(cp.getUserId()))
                .map(User::getFullName).orElse("ứng viên");
    }

    private JobApplication findApp(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển #" + id));
    }

    private Interview findInterview(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy buổi phỏng vấn #" + id));
    }

    private InterviewDtos.InterviewDto.InterviewDtoBuilder base(Interview i, JobApplication app) {
        Job job = app.getJob();
        Company company = job != null ? job.getCompany() : null;
        return InterviewDtos.InterviewDto.builder()
                .id(i.getId())
                .uuid(i.getUuid())
                .applicationId(i.getApplicationId())
                .roundNumber(i.getRoundNumber())
                .scheduledStart(i.getScheduledStart())
                .scheduledEnd(i.getScheduledEnd())
                .format(i.getFormat())
                .location(i.getLocation())
                .status(i.getStatus())
                .notesToCandidate(i.getNotesToCandidate())
                .jobId(job != null ? job.getId() : null)
                .jobTitle(job != null ? job.getTitle() : null)
                .companyName(company != null ? company.getName() : null)
                .companyLogo(company != null ? company.getLogoUrl() : null)
                .candidateName(candidateName(app));
    }

    private InterviewDtos.InterviewDto toCandidateDto(Interview i, JobApplication app) {
        Map<Long, User> users = userRepository.findAllById(i.getPanelistUserIds()).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        List<InterviewDtos.PanelistDto> panel = i.getPanelistUserIds().stream()
                .filter(users::containsKey)
                .map(uid -> InterviewDtos.PanelistDto.builder()
                        .userId(uid)
                        .fullName(users.get(uid).getFullName())
                        .jobTitle(recruiterProfileRepository.findByUserId(uid).map(RecruiterProfile::getJobTitle).orElse(null))
                        .build())
                .toList();
        return base(i, app).panelists(panel).build();
    }

    private InterviewDtos.InterviewDto toTeamDto(Interview i, JobApplication app, Long viewerId, boolean manager) {
        List<InterviewEvaluation> evaluations = evaluationRepository.findByInterviewIdInOrderBySubmittedAtAsc(List.of(i.getId()));
        Set<Long> userIds = new HashSet<>(i.getPanelistUserIds());
        evaluations.forEach(e -> userIds.add(e.getInterviewerUserId()));
        Map<Long, String> names = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
        Set<Long> evaluatedIds = evaluations.stream().map(InterviewEvaluation::getInterviewerUserId).collect(Collectors.toSet());

        boolean evaluatedByMe = evaluatedIds.contains(viewerId);
        boolean showEvaluations = manager || evaluatedByMe;

        List<InterviewDtos.PanelistDto> panel = i.getPanelistUserIds().stream()
                .map(uid -> InterviewDtos.PanelistDto.builder()
                        .userId(uid)
                        .fullName(names.getOrDefault(uid, ""))
                        .jobTitle(recruiterProfileRepository.findByUserId(uid).map(RecruiterProfile::getJobTitle).orElse(null))
                        .evaluated(evaluatedIds.contains(uid))
                        .build())
                .toList();

        List<InterviewDtos.EvaluationDto> evalDtos = showEvaluations
                ? evaluations.stream().map(e -> toEvaluationDto(e, names)).toList()
                : evaluations.stream().filter(e -> e.getInterviewerUserId().equals(viewerId)).map(e -> toEvaluationDto(e, names)).toList();
        Double avg = showEvaluations && !evalDtos.isEmpty()
                ? round1(evalDtos.stream().mapToDouble(InterviewDtos.EvaluationDto::getAverageScore).average().orElse(0))
                : null;

        return base(i, app)
                .panelists(panel)
                .evaluations(evalDtos)
                .averageScore(avg)
                .canEvaluate(!"CANCELLED".equals(i.getStatus()) && (manager || i.getPanelistUserIds().contains(viewerId)))
                .evaluatedByMe(evaluatedByMe)
                .build();
    }

    private InterviewDtos.EvaluationDto toEvaluationDto(InterviewEvaluation e, Map<Long, String> names) {
        double avg = (e.getTechnicalScore() + e.getCommunicationScore() + e.getProblemSolvingScore() + e.getCultureFitScore()) / 4.0;
        return InterviewDtos.EvaluationDto.builder()
                .id(e.getId())
                .interviewId(e.getInterviewId())
                .interviewerUserId(e.getInterviewerUserId())
                .interviewerName(names.getOrDefault(e.getInterviewerUserId(), ""))
                .technicalScore(e.getTechnicalScore())
                .communicationScore(e.getCommunicationScore())
                .problemSolvingScore(e.getProblemSolvingScore())
                .cultureFitScore(e.getCultureFitScore())
                .averageScore(round1(avg))
                .recommendation(e.getRecommendation())
                .feedbackNotes(e.getFeedbackNotes())
                .submittedAt(e.getSubmittedAt())
                .build();
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    public static String recommendationLabel(String code) {
        return switch (code) {
            case "STRONG_HIRE" -> "Rất nên tuyển";
            case "HIRE" -> "Nên tuyển";
            case "NO_HIRE" -> "Không nên tuyển";
            case "STRONG_NO_HIRE" -> "Hoàn toàn không phù hợp";
            default -> "Trung lập";
        };
    }
}
