package com.talentbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Candidate ↔ hiring team messaging. */
public final class MessageDtos {

    private MessageDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        @Size(max = 2000, message = "Tin nhắn tối đa 2000 ký tự")
        private String content;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDto {
        private Long id;
        private Long applicationId;
        private Long senderUserId;
        private String senderName;
        /** CANDIDATE or COMPANY */
        private String senderSide;
        private String content;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThreadSummary {
        private Long applicationId;
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private String companyLogo;
        private Long candidateUserId;
        private String candidateName;
        private String currentStage;
        private String lastMessage;
        private String lastSenderSide;
        private LocalDateTime lastMessageAt;
        private long unreadCount;
    }
}
