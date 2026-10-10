package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Rubric scorecard submitted by one panelist for one interview. */
@Entity
@Table(name = "interview_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "interview_id", nullable = false)
    private Long interviewId;

    @Column(name = "interviewer_user_id", nullable = false)
    private Long interviewerUserId;

    @Column(name = "technical_score", nullable = false)
    private Integer technicalScore;

    @Column(name = "communication_score", nullable = false)
    private Integer communicationScore;

    @Column(name = "problem_solving_score", nullable = false)
    private Integer problemSolvingScore;

    @Column(name = "culture_fit_score", nullable = false)
    private Integer cultureFitScore;

    /** STRONG_HIRE, HIRE, NEUTRAL, NO_HIRE, STRONG_NO_HIRE */
    @Column(nullable = false)
    private String recommendation;

    @Column(name = "feedback_notes", columnDefinition = "TEXT")
    private String feedbackNotes;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
}
