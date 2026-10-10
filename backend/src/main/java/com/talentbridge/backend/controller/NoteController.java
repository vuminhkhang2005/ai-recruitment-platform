package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.config.OpenApiConfig;
import com.talentbridge.backend.dto.NoteDtos;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.NoteService;
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

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@SecurityRequirement(name = OpenApiConfig.COOKIE_AUTH)
@Tag(name = "Internal Notes", description = "Ghi chú nội bộ của Hiring Team về hồ sơ ứng viên (ứng viên không thấy)")
public class NoteController {

    private final NoteService noteService;

    @GetMapping("/api/v1/applications/{applicationId}/notes")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Lấy danh sách ghi chú nội bộ cho hồ sơ")
    public ResponseEntity<ApiResponse<List<NoteDtos.NoteDto>>> listNotes(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.list(applicationId, userPrincipal.getId())));
    }

    @PostMapping("/api/v1/applications/{applicationId}/notes")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Tạo ghi chú nội bộ cho hồ sơ")
    public ResponseEntity<ApiResponse<NoteDtos.NoteDto>> createNote(
            @PathVariable Long applicationId,
            @Valid @RequestBody NoteDtos.CreateNoteRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        NoteDtos.NoteDto note = noteService.create(applicationId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã thêm ghi chú nội bộ", note));
    }

    @DeleteMapping("/api/v1/notes/{noteId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Xoá ghi chú nội bộ của chính mình")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        noteService.delete(noteId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá ghi chú", null));
    }
}
