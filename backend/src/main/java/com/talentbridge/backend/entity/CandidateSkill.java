package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_profile_id", nullable = false)
    private Long candidateProfileId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    /** BEGINNER | INTERMEDIATE | ADVANCED | EXPERT */
    @Column(nullable = false)
    @Builder.Default
    private String proficiency = "INTERMEDIATE";

    @Column(name = "years_experience", nullable = false)
    @Builder.Default
    private Integer yearsExperience = 0;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;
}
