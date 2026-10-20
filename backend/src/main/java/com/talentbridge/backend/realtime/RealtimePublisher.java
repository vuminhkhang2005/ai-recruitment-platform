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
                if (event.recipientUserIds() != null) {
                    for (Long uid : event.recipientUserIds()) {
                        if (uid != null) {
                            messagingTemplate.convertAndSendToUser(String.valueOf(uid), "/queue/messages", dto);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Realtime message push failed: {}", ex.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onMessagesRead(DomainEvents.MessagesRead event) {
        try {
            MessageDtos.ReadReceiptDto receipt = MessageDtos.ReadReceiptDto.builder()
                    .applicationId(event.applicationId())
                    .readerSide(event.readerSide())
                    .readAt(event.readAt())
                    .count(event.count())
                    .recipientUserIds(event.recipientUserIds())
                    .build();
            messagingTemplate.convertAndSend("/topic/applications/" + event.applicationId() + "/read", receipt);
            if (event.recipientUserIds() != null) {
                for (Long uid : event.recipientUserIds()) {
                    if (uid != null) {
                        messagingTemplate.convertAndSendToUser(String.valueOf(uid), "/queue/messages-read", receipt);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Realtime read-receipt push failed: {}", ex.getMessage());
        }
    }
}
