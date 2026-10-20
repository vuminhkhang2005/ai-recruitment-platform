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
        RecruiterProfile rp = hiringTeamService.findMember(userId).orElse(null);
        if (rp != null && rp.getCompanyId() != null
                && rp.getCompanyId().equals(HiringTeamService.companyIdOf(app.getJob()))) {
            return COMPANY;
        }
        boolean isCandidate = candidateProfileRepository.findByUserId(userId)
                .map(p -> p.getId().equals(app.getCandidateProfileId()))
                .orElse(false);
        if (isCandidate) {
            return CANDIDATE;
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
        Map<Long, User> usersById = usersMap(messages.stream().map(ApplicationMessage::getSenderUserId).collect(Collectors.toSet()));
        return messages.stream().map(m -> toDto(m, usersById)).toList();
    }

    @Transactional
    public int markRead(Long applicationId, Long userId) {
        JobApplication app = findApp(applicationId);
        String side = requireSide(userId, app);
        LocalDateTime now = LocalDateTime.now();
        int updated = messageRepository.markRead(applicationId, side, now);
        if (updated > 0) {
            List<Long> recipients = resolveCounterpartUserIds(app, side);
            eventPublisher.publishEvent(new DomainEvents.MessagesRead(applicationId, side, now, updated, recipients));
        }
        return updated;
    }

    @Transactional(readOnly = true)
    public List<MessageDtos.ThreadSummary> threads(Long userId) {
        Context ctx = context(userId);
        if (ctx == null || ctx.applications.isEmpty()) {
            return List.of();
        }

        Set<Long> cpIds = ctx.applications.stream()
                .map(JobApplication::getCandidateProfileId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, CandidateProfile> profilesById = candidateProfileRepository.findAllById(cpIds).stream()
                .collect(Collectors.toMap(CandidateProfile::getId, p -> p, (a, b) -> a));

        Set<Long> candidateUserIds = profilesById.values().stream()
                .map(CandidateProfile::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, User> usersById = usersMap(candidateUserIds);

        return ctx.applications.stream()
                .map(a -> {
                    ApplicationMessage last = messageRepository.findFirstByApplicationIdOrderByCreatedAtDescIdDesc(a.getId()).orElse(null);
                    long totalMsgs = messageRepository.countByApplicationId(a.getId());
                    Company company = a.getJob() != null ? a.getJob().getCompany() : null;
                    CandidateProfile cp = profilesById.get(a.getCandidateProfileId());
                    User candUser = cp != null ? usersById.get(cp.getUserId()) : null;
                    String lastSenderName = null;
                    if (last != null) {
                        User lastSender = usersById.containsKey(last.getSenderUserId())
                                ? usersById.get(last.getSenderUserId())
                                : userRepository.findById(last.getSenderUserId()).orElse(null);
                        if (lastSender != null) {
                            lastSenderName = lastSender.getFullName();
                        }
                    }
                    return MessageDtos.ThreadSummary.builder()
                            .applicationId(a.getId())
                            .jobId(a.getJob() != null ? a.getJob().getId() : null)
                            .jobTitle(a.getJob() != null ? a.getJob().getTitle() : null)
                            .jobLocation(a.getJob() != null ? a.getJob().getLocationCity() : null)
                            .companyId(company != null ? company.getId() : null)
                            .companyName(company != null ? company.getName() : null)
                            .companyLogo(company != null ? company.getLogoUrl() : null)
                            .candidateUserId(cp != null ? cp.getUserId() : null)
                            .candidateName(candUser != null ? candUser.getFullName() : "")
                            .candidateAvatar(candUser != null ? candUser.getAvatarUrl() : null)
                            .candidateHeadline(cp != null ? cp.getHeadline() : null)
                            .candidateEmail(candUser != null ? candUser.getEmail() : null)
                            .candidatePhone(candUser != null ? candUser.getPhone() : null)
                            .candidateCity(cp != null ? cp.getCity() : null)
                            .currentStage(a.getCurrentStage())
                            .appliedAt(a.getAppliedAt())
                            .lastMessage(last != null ? preview(last.getContent(), 140) : null)
                            .lastSenderSide(last != null ? last.getSenderSide() : null)
                            .lastSenderName(lastSenderName)
                            .lastMessageAt(last != null ? last.getCreatedAt() : null)
                            .lastMessageReadAt(last != null ? last.getReadAt() : null)
                            .unreadCount(messageRepository.countByApplicationIdAndSenderSideNotAndReadAtIsNull(a.getId(), ctx.side))
                            .totalMessages(totalMsgs)
                            .build();
                })
                .sorted(Comparator
                        .comparing(MessageDtos.ThreadSummary::getLastMessageAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(MessageDtos.ThreadSummary::getAppliedAt, Comparator.nullsLast(Comparator.reverseOrder())))
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
                .map(m -> toDto(m, usersMap(Set.of(m.getSenderUserId()))))
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

        List<Long> recipientIds = resolveCounterpartUserIds(app, side);
        notifyCounterpart(app, side, userId, content, recipientIds);
        eventPublisher.publishEvent(new DomainEvents.MessageCreated(saved.getId(), recipientIds));
        return toDto(saved, usersMap(Set.of(userId)));
    }

    private List<Long> resolveCounterpartUserIds(JobApplication app, String senderSide) {
        if (COMPANY.equals(senderSide)) {
            return candidateProfileRepository.findById(app.getCandidateProfileId())
                    .map(cp -> List.of(cp.getUserId()))
                    .orElse(List.of());
        } else {
            Set<Long> recipients = new LinkedHashSet<>();
            if (app.getJob() != null) {
                recruiterProfileRepository.findById(app.getJob().getRecruiterId())
                        .map(RecruiterProfile::getUserId)
                        .ifPresent(recipients::add);
                Long companyId = HiringTeamService.companyIdOf(app.getJob());
                if (companyId != null) {
                    recipients.addAll(hiringTeamService.managerUserIds(companyId));
                }
            }
            messageRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(app.getId()).stream()
                    .filter(m -> COMPANY.equals(m.getSenderSide()))
                    .map(ApplicationMessage::getSenderUserId)
                    .forEach(recipients::add);
            return List.copyOf(recipients);
        }
    }

    private void notifyCounterpart(JobApplication app, String side, Long senderUserId, String content, List<Long> recipientIds) {
        String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "";
        String senderName = userRepository.findById(senderUserId).map(User::getFullName).orElse("");
        if (COMPANY.equals(side)) {
            String company = app.getJob() != null && app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "Nhà tuyển dụng";
            for (Long recipient : recipientIds) {
                notificationService.notifyOnce(recipient, "NEW_MESSAGE",
                        "Tin nhắn mới từ " + company,
                        senderName + " (" + jobTitle + "): " + preview(content, 120),
                        "APPLICATION", app.getId());
            }
        } else {
            for (Long recipient : recipientIds) {
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
        User u = userRepository.findById(userId).orElse(null);
        boolean isRecruiterUser = u != null && u.getRoles().stream().anyMatch(r -> "ROLE_RECRUITER".equals(r.getName()));
        RecruiterProfile rp = hiringTeamService.findMember(userId).orElse(null);
        if (isRecruiterUser && rp != null && rp.getCompanyId() != null) {
            return new Context(COMPANY, applicationRepository.findAllForCompany(rp.getCompanyId()));
        }
        CandidateProfile cp = candidateProfileRepository.findByUserId(userId).orElse(null);
        if (cp != null) {
            return new Context(CANDIDATE, applicationRepository.findByCandidateProfileId(cp.getId()));
        }
        if (rp != null && rp.getCompanyId() != null) {
            return new Context(COMPANY, applicationRepository.findAllForCompany(rp.getCompanyId()));
        }
        return null;
    }

    private Map<Long, User> usersMap(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return Map.of();
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));
    }

    private MessageDtos.MessageDto toDto(ApplicationMessage m, Map<Long, User> usersById) {
        User sender = usersById.get(m.getSenderUserId());
        return MessageDtos.MessageDto.builder()
                .id(m.getId())
                .applicationId(m.getApplicationId())
                .senderUserId(m.getSenderUserId())
                .senderName(sender != null ? sender.getFullName() : "")
                .senderAvatar(sender != null ? sender.getAvatarUrl() : null)
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
