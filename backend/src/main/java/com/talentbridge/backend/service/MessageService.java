package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.MessageDtos;
import com.talentbridge.backend.entity.ApplicationMessage;
import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.Company;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.event.DomainEvents;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.ApplicationMessageRepository;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import com.talentbridge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * One conversation thread per application between the candidate and the company's hiring team
 * (ADMIN / RECRUITER members). Persisted via REST, pushed live via STOMP after commit.
 */
@Service
@RequiredArgsConstructor
public class MessageService {

    public static final String CANDIDATE = "CANDIDATE";
    public static final String COMPANY = "COMPANY";
    private static final int MAX_LENGTH = 2000;

    private final ApplicationMessageRepository messageRepository;
    private final JobApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final HiringTeamService hiringTeamService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    // ------------------------------------------------------------------ access

    /** CANDIDATE, COMPANY, or null when the user may not take part in this thread. */
    @Transactional(readOnly = true)
    public String sideOf(Long userId, JobApplication app) {
        boolean isCandidate = candidateProfileRepository.findByUserId(userId)
                .map(p -> p.getId().equals(app.getCandidateProfileId()))
                .orElse(false);
        if (isCandidate) {
            return CANDIDATE;
        }
        RecruiterProfile rp = hiringTeamService.findMember(userId).orElse(null);
        if (HiringTeamService.isManager(rp) && rp.getCompanyId().equals(HiringTeamService.companyIdOf(app.getJob()))) {
            return COMPANY;
        }
        return null;
    }

    @Transactional(readOnly = true)
    public boolean canAccessThread(Long userId, Long applicationId) {
        return applicationRepository.findById(applicationId).map(app -> sideOf(userId, app) != null).orElse(false);
    }

    private JobApplication findApp(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển #" + applicationId));
    }

    private String requireSide(Long userId, JobApplication app) {
        String side = sideOf(userId, app);
        if (side == null) {
            throw new AccessDeniedException("Bạn không tham gia cuộc trò chuyện này");
        }
        return side;
    }

    // ------------------------------------------------------------------ queries

    @Transactional(readOnly = true)
    public List<MessageDtos.MessageDto> list(Long applicationId, Long userId) {
        JobApplication app = findApp(applicationId);
        requireSide(userId, app);
        List<ApplicationMessage> messages = messageRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(applicationId);
        Map<Long, String> names = names(messages.stream().map(ApplicationMessage::getSenderUserId).collect(Collectors.toSet()));
        return messages.stream().map(m -> toDto(m, names)).toList();
    }

    @Transactional
    public int markRead(Long applicationId, Long userId) {
        JobApplication app = findApp(applicationId);
        String side = requireSide(userId, app);
        return messageRepository.markRead(applicationId, side, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<MessageDtos.ThreadSummary> threads(Long userId) {
        Context ctx = context(userId);
        if (ctx == null || ctx.applications.isEmpty()) {
            return List.of();
        }
        Set<Long> ids = ctx.applications.stream().map(JobApplication::getId).collect(Collectors.toSet());
        Set<Long> withMessages = new LinkedHashSet<>(messageRepository.findApplicationIdsWithMessages(ids));

        Map<Long, String> candidateNames = candidateNames(ctx.applications.stream()
                .filter(a -> withMessages.contains(a.getId())).toList());

        return ctx.applications.stream()
                .filter(a -> withMessages.contains(a.getId()))
                .map(a -> {
                    ApplicationMessage last = messageRepository.findFirstByApplicationIdOrderByCreatedAtDescIdDesc(a.getId()).orElse(null);
                    Company company = a.getJob() != null ? a.getJob().getCompany() : null;
                    CandidateProfile cp = candidateProfileRepository.findById(a.getCandidateProfileId()).orElse(null);
                    return MessageDtos.ThreadSummary.builder()
                            .applicationId(a.getId())
                            .jobId(a.getJob() != null ? a.getJob().getId() : null)
                            .jobTitle(a.getJob() != null ? a.getJob().getTitle() : null)
                            .companyName(company != null ? company.getName() : null)
                            .companyLogo(company != null ? company.getLogoUrl() : null)
                            .candidateUserId(cp != null ? cp.getUserId() : null)
                            .candidateName(candidateNames.get(a.getId()))
                            .currentStage(a.getCurrentStage())
                            .lastMessage(last != null ? preview(last.getContent(), 140) : null)
                            .lastSenderSide(last != null ? last.getSenderSide() : null)
                            .lastMessageAt(last != null ? last.getCreatedAt() : null)
                            .unreadCount(messageRepository.countByApplicationIdAndSenderSideNotAndReadAtIsNull(a.getId(), ctx.side))
                            .build();
                })
                .sorted(Comparator.comparing(MessageDtos.ThreadSummary::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        Context ctx = context(userId);
        if (ctx == null || ctx.applications.isEmpty()) {
            return 0;
        }
        return messageRepository.countUnread(ctx.applications.stream().map(JobApplication::getId).toList(), ctx.side);
    }

    @Transactional(readOnly = true)
    public long unreadCountForApplication(Long applicationId, String viewerSide) {
        return messageRepository.countByApplicationIdAndSenderSideNotAndReadAtIsNull(applicationId, viewerSide);
    }

    @Transactional(readOnly = true)
    public MessageDtos.MessageDto loadDto(Long messageId) {
        return messageRepository.findById(messageId)
                .map(m -> toDto(m, names(Set.of(m.getSenderUserId()))))
                .orElse(null);
    }

    // ------------------------------------------------------------------ commands

    @Transactional
    public MessageDtos.MessageDto send(Long applicationId, Long userId, String rawContent) {
        JobApplication app = findApp(applicationId);
        String side = requireSide(userId, app);
        String content = rawContent == null ? "" : rawContent.strip();
        if (content.isEmpty()) {
            throw new BadRequestException("Nội dung tin nhắn không được để trống");
        }
        if (content.length() > MAX_LENGTH) {
            throw new BadRequestException("Tin nhắn tối đa " + MAX_LENGTH + " ký tự");
        }

        ApplicationMessage saved = messageRepository.save(ApplicationMessage.builder()
                .applicationId(app.getId())
                .senderUserId(userId)
                .senderSide(side)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build());

        notifyCounterpart(app, side, userId, content);
        eventPublisher.publishEvent(new DomainEvents.MessageCreated(saved.getId()));
        return toDto(saved, names(Set.of(userId)));
    }

    private void notifyCounterpart(JobApplication app, String side, Long senderUserId, String content) {
        String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "";
        String senderName = userRepository.findById(senderUserId).map(User::getFullName).orElse("");
        if (COMPANY.equals(side)) {
            candidateProfileRepository.findById(app.getCandidateProfileId()).ifPresent(cp -> {
                String company = app.getJob() != null && app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "Nhà tuyển dụng";
                notificationService.notifyOnce(cp.getUserId(), "NEW_MESSAGE",
                        "Tin nhắn mới từ " + company,
                        senderName + " (" + jobTitle + "): " + preview(content, 120),
                        "APPLICATION", app.getId());
            });
        } else {
            // job owner + every team member who already took part in the thread
            Set<Long> recipients = new LinkedHashSet<>();
            if (app.getJob() != null) {
                recruiterProfileRepository.findById(app.getJob().getRecruiterId()).map(RecruiterProfile::getUserId).ifPresent(recipients::add);
            }
            messageRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(app.getId()).stream()
                    .filter(m -> COMPANY.equals(m.getSenderSide()))
                    .map(ApplicationMessage::getSenderUserId)
                    .forEach(recipients::add);
            for (Long recipient : recipients) {
                notificationService.notifyOnce(recipient, "NEW_MESSAGE",
                        "Tin nhắn mới từ ứng viên " + senderName,
                        jobTitle + ": " + preview(content, 120),
                        "APPLICATION", app.getId());
            }
        }
    }

    // ------------------------------------------------------------------ helpers

    private record Context(String side, List<JobApplication> applications) {
    }

    private Context context(Long userId) {
        CandidateProfile cp = candidateProfileRepository.findByUserId(userId).orElse(null);
        if (cp != null) {
            return new Context(CANDIDATE, applicationRepository.findByCandidateProfileId(cp.getId()));
        }
        RecruiterProfile rp = hiringTeamService.findMember(userId).orElse(null);
        if (HiringTeamService.isManager(rp)) {
            return new Context(COMPANY, applicationRepository.findAllForCompany(rp.getCompanyId()));
        }
        return null;
    }

    private Map<Long, String> names(Set<Long> userIds) {
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
    }

    private Map<Long, String> candidateNames(List<JobApplication> apps) {
        Map<Long, Long> appToUser = apps.stream()
                .map(a -> Map.entry(a.getId(), candidateProfileRepository.findById(a.getCandidateProfileId()).map(CandidateProfile::getUserId).orElse(-1L)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        Map<Long, String> userNames = names(appToUser.values().stream().filter(Objects::nonNull).collect(Collectors.toSet()));
        return appToUser.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> userNames.getOrDefault(e.getValue(), "")));
    }

    private MessageDtos.MessageDto toDto(ApplicationMessage m, Map<Long, String> names) {
        return MessageDtos.MessageDto.builder()
                .id(m.getId())
                .applicationId(m.getApplicationId())
                .senderUserId(m.getSenderUserId())
                .senderName(names.getOrDefault(m.getSenderUserId(), ""))
                .senderSide(m.getSenderSide())
                .content(m.getContent())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .build();
    }

    static String preview(String text, int max) {
        if (text == null) return "";
        String oneLine = text.replaceAll("\\s+", " ").strip();
        return oneLine.length() <= max ? oneLine : oneLine.substring(0, max - 1) + "…";
    }
}
