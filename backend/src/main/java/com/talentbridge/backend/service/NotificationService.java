package com.talentbridge.backend.service;

import com.talentbridge.backend.entity.Notification;
import com.talentbridge.backend.event.DomainEvents;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void notify(Long userId, String type, String title, String content, String referenceType, Long referenceId) {
        if (userId == null) return;
        Notification saved = notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .content(content)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build());
        eventPublisher.publishEvent(new DomainEvents.NotificationCreated(saved.getId()));
    }

    /** Skips creating a duplicate while an identical unread notification is still pending (e.g. chat bursts). */
    @Transactional
    public void notifyOnce(Long userId, String type, String title, String content, String referenceType, Long referenceId) {
        if (userId == null) return;
        if (notificationRepository.existsByUserIdAndTypeAndReferenceTypeAndReferenceIdAndIsReadFalse(userId, type, referenceType, referenceId)) {
            return;
        }
        notify(userId, type, title, content, referenceType, referenceId);
    }

    @Transactional(readOnly = true)
    public List<Notification> latest(Long userId, int limit) {
        return notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId, PageRequest.of(0, Math.max(1, Math.min(limit, 100))));
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (!n.getUserId().equals(userId)) {
            throw new AccessDeniedException("Không có quyền với thông báo này");
        }
        if (!Boolean.TRUE.equals(n.getIsRead())) {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
        return n;
    }

    @Transactional
    public int markAllRead(Long userId) {
        return notificationRepository.markAllRead(userId, LocalDateTime.now());
    }
}
