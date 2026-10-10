package com.talentbridge.backend.event;

import com.talentbridge.backend.service.EmailContentFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionalEmailListener {

    private final EmailContentFactory emailContentFactory;

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onApplicationSubmitted(DomainEvents.ApplicationSubmitted event) {
        try {
            emailContentFactory.handleApplicationSubmitted(event);
        } catch (Exception ex) {
            log.error("Failed handling email for ApplicationSubmitted: {}", ex.getMessage(), ex);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onApplicationStageChanged(DomainEvents.ApplicationStageChanged event) {
        try {
            emailContentFactory.handleApplicationStageChanged(event);
        } catch (Exception ex) {
            log.error("Failed handling email for ApplicationStageChanged: {}", ex.getMessage(), ex);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onInterviewChanged(DomainEvents.InterviewChanged event) {
        try {
            emailContentFactory.handleInterviewChanged(event);
        } catch (Exception ex) {
            log.error("Failed handling email for InterviewChanged: {}", ex.getMessage(), ex);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTeamInvitationCreated(DomainEvents.TeamInvitationCreated event) {
        try {
            emailContentFactory.handleTeamInvitationCreated(event);
        } catch (Exception ex) {
            log.error("Failed handling email for TeamInvitationCreated: {}", ex.getMessage(), ex);
        }
    }
}
