package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recruiter_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    /** ADMIN, RECRUITER or INTERVIEWER — see {@link com.talentbridge.backend.service.HiringTeamService}. */
    @Column(name = "team_role", nullable = false, length = 20)
    @Builder.Default
    private String teamRole = "RECRUITER";

    @Column(name = "is_company_admin", nullable = false)
    @Builder.Default
    private Boolean isCompanyAdmin = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
