package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** A candidate's review of a company they applied to. */
@Entity
@Table(name = "company_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String pros;

    @Column(columnDefinition = "TEXT")
    private String cons;

    /** APPLIED | INTERVIEWED | HIRED — derived from the author's furthest hiring stage. */
    @Column(name = "experience_level", nullable = false)
    @Builder.Default
    private String experienceLevel = "APPLIED";

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private Boolean isAnonymous = true;

    /** PUBLISHED | HIDDEN */
    @Column(nullable = false)
    @Builder.Default
    private String status = "PUBLISHED";

    @Column(name = "moderation_note", length = 500)
    private String moderationNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}
