package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36)
    private String uuid;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "scheduled_start", nullable = false)
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private LocalDateTime scheduledEnd;

    /** ONLINE or OFFLINE */
    @Column(name = "interview_format", nullable = false)
    private String format;

    @Column(name = "meeting_link_or_room", length = 500)
    private String location;

    /** SCHEDULED, RESCHEDULED, COMPLETED, CANCELLED */
    @Column(nullable = false)
    private String status;

    @Column(name = "notes_to_candidate", columnDefinition = "TEXT")
    private String notesToCandidate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "interview_panelists", joinColumns = @JoinColumn(name = "interview_id"))
    @Column(name = "user_id")
    @Builder.Default
    private Set<Long> panelistUserIds = new HashSet<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
