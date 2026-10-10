package com.talentbridge.backend.realtime;

import com.talentbridge.backend.dto.MessageDtos;
import com.talentbridge.backend.event.DomainEvents;
import com.talentbridge.backend.repository.NotificationRepository;
import com.talentbridge.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Pushes committed changes to connected browsers over STOMP. */
@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final MessageService messageService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onNotification(DomainEvents.NotificationCreated event) {
        notificationRepository.findById(event.notificationId()).ifPresent(n -> {
            try {
                messagingTemplate.convertAndSendToUser(String.valueOf(n.getUserId()), "/queue/notifications", n);
            } catch (Exception ex) {
                log.warn("Realtime notification push failed: {}", ex.getMessage());
            }
        });
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onMessage(DomainEvents.MessageCreated event) {
        try {
            MessageDtos.MessageDto dto = messageService.loadDto(event.messageId());
            if (dto != null) {
                messagingTemplate.convertAndSend("/topic/applications/" + dto.getApplicationId(), dto);
            }
        } catch (Exception ex) {
            log.warn("Realtime message push failed: {}", ex.getMessage());
        }
    }
}
