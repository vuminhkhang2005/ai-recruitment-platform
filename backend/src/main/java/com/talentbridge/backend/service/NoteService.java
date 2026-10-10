package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.NoteDtos;
import com.talentbridge.backend.entity.ApplicationNote;
import com.talentbridge.backend.entity.JobApplication;
import com.talentbridge.backend.entity.RecruiterProfile;
import com.talentbridge.backend.entity.User;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.ApplicationNoteRepository;
import com.talentbridge.backend.repository.JobApplicationRepository;
import com.talentbridge.backend.repository.RecruiterProfileRepository;
import com.talentbridge.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** Internal notes of the hiring team on an application — never exposed to candidates. */
@Service
@RequiredArgsConstructor
public class NoteService {

    private static final String DENIED = "Bạn không có quyền xem ghi chú nội bộ của hồ sơ này";

    private final ApplicationNoteRepository noteRepository;
    private final JobApplicationRepository applicationRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final HiringTeamService hiringTeamService;

    @Transactional(readOnly = true)
    public List<NoteDtos.NoteDto> list(Long applicationId, Long userId) {
        JobApplication app = findApp(applicationId);
        hiringTeamService.assertCanViewApplication(userId, app, DENIED);
        List<ApplicationNote> notes = noteRepository.findVisible(applicationId, userId);
        return toDtos(notes, userId);
    }

    @Transactional
    public NoteDtos.NoteDto create(Long applicationId, Long userId, NoteDtos.CreateNoteRequest request) {
        JobApplication app = findApp(applicationId);
        hiringTeamService.assertCanViewApplication(userId, app, DENIED);
        String content = request.getContent() == null ? "" : request.getContent().strip();
        if (content.isEmpty()) {
            throw new BadRequestException("Nội dung ghi chú không được để trống");
        }
        ApplicationNote saved = noteRepository.save(ApplicationNote.builder()
                .applicationId(applicationId)
                .authorUserId(userId)
                .content(content)
                .isPrivate(Boolean.TRUE.equals(request.getIsPrivate()))
                .createdAt(LocalDateTime.now())
                .build());
        return toDtos(List.of(saved), userId).get(0);
    }

    @Transactional
    public void delete(Long noteId, Long userId) {
        ApplicationNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ghi chú #" + noteId));
        if (!note.getAuthorUserId().equals(userId)) {
            throw new AccessDeniedException("Chỉ người viết mới xóa được ghi chú này");
        }
        noteRepository.delete(note);
    }

    private JobApplication findApp(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển #" + applicationId));
    }

    private List<NoteDtos.NoteDto> toDtos(List<ApplicationNote> notes, Long viewerId) {
        Set<Long> authorIds = notes.stream().map(ApplicationNote::getAuthorUserId).collect(Collectors.toSet());
        Map<Long, String> names = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
        Map<Long, String> roles = authorIds.stream()
                .map(id -> Map.entry(id, recruiterProfileRepository.findByUserId(id).map(RecruiterProfile::getTeamRole).orElse("")))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        return notes.stream().map(n -> NoteDtos.NoteDto.builder()
                        .id(n.getId())
                        .applicationId(n.getApplicationId())
                        .authorUserId(n.getAuthorUserId())
                        .authorName(names.getOrDefault(n.getAuthorUserId(), ""))
                        .authorRole(roles.getOrDefault(n.getAuthorUserId(), ""))
                        .content(n.getContent())
                        .isPrivate(n.getIsPrivate())
                        .mine(n.getAuthorUserId().equals(viewerId))
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();
    }
}
