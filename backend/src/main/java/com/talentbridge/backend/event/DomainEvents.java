package com.talentbridge.backend.event;

/**
 * Domain events published inside service transactions. Listeners react AFTER COMMIT
 * (e-mail delivery, WebSocket pushes) so side effects never fire for rolled-back work.
 */
public final class DomainEvents {

    private DomainEvents() {
    }

    public record ApplicationSubmitted(Long applicationId) {
    }

    /** @param sendEmail false when another e-mail (e.g. interview invitation) already covers this change */
    public record ApplicationStageChanged(Long applicationId, String fromStage, String toStage, boolean sendEmail) {
    }

    /** @param change SCHEDULED, RESCHEDULED or CANCELLED */
    public record InterviewChanged(Long interviewId, String change) {
    }

    public record TeamInvitationCreated(Long invitationId) {
    }

    public record NotificationCreated(Long notificationId) {
    }

    public record MessageCreated(Long messageId) {
    }
}
