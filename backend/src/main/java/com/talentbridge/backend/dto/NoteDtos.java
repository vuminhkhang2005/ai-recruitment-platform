package com.talentbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Internal hiring-team notes on an application. */
public final class NoteDtos {

    private NoteDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateNoteRequest {
        @NotBlank(message = "Nội dung ghi chú không được để trống")
        @Size(max = 3000, message = "Ghi chú tối đa 3000 ký tự")
        private String content;
        private Boolean isPrivate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NoteDto {
        private Long id;
        private Long applicationId;
        private Long authorUserId;
        private String authorName;
        private String authorRole;
        private String content;
        private Boolean isPrivate;
        private Boolean mine;
        private LocalDateTime createdAt;
    }
}
