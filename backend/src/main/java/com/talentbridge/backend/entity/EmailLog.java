package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Audit trail of every transactional e-mail the platform attempted to send. */
@Entity
@Table(name = "email_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "to_email", nullable = false, length = 191)
    private String toEmail;

    @Column(nullable = false, length = 300)
    private String subject;

    @Column(nullable = false, length = 60)
    private String template;

    /** SENT, FAILED, DISABLED */
    @Column(nullable = false)
    private String status;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
