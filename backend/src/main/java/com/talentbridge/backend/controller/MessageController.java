package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.MessageDtos;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "Real-time Messaging", description = "Nhắn tin trao đổi giữa ứng viên và nhà tuyển dụng theo từng hồ sơ ứng tuyển")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/api/v1/applications/{applicationId}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy lịch sử tin nhắn của một hồ sơ")
    public ResponseEntity<ApiResponse<List<MessageDtos.MessageDto>>> getMessages(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.list(applicationId, userPrincipal.getId())));
    }

    @PostMapping("/api/v1/applications/{applicationId}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gửi tin nhắn mới vào cuộc trò chuyện")
    public ResponseEntity<ApiResponse<MessageDtos.MessageDto>> sendMessage(
            @PathVariable Long applicationId,
            @Valid @RequestBody MessageDtos.SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        MessageDtos.MessageDto sent = messageService.send(applicationId, userPrincipal.getId(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(sent));
    }

    @PatchMapping("/api/v1/applications/{applicationId}/messages/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markRead(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        int count = messageService.markRead(applicationId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("markedRead", count)));
    }

    @GetMapping("/api/v1/messages/threads")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách các cuộc trò chuyện có tin nhắn")
    public ResponseEntity<ApiResponse<List<MessageDtos.ThreadSummary>>> getThreads(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.threads(userPrincipal.getId())));
    }

    @GetMapping("/api/v1/messages/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tổng số tin nhắn chưa đọc của người dùng")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        long count = messageService.unreadCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unreadCount", count)));
    }
}
