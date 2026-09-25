package com.talentbridge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "recruiter_id", nullable = false)
    private Long recruiterId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String requirements;

    @Column(columnDefinition = "LONGTEXT")
    private String benefits;

    @Column(name = "job_type", nullable = false)
    private String jobType;

    @Column(name = "exp_level", nullable = false)
    private String expLevel;

    @Column(name = "min_salary", precision = 12, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "max_salary", precision = 12, scale = 2)
    private BigDecimal maxSalary;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "is_salary_negotiable", nullable = false)
    private Boolean isSalaryNegotiable;

    @Column(name = "location_city", nullable = false, length = 100)
    private String locationCity;

    @Column(name = "location_address", length = 300)
    private String locationAddress;

    @Column(nullable = false)
    private String status;

    private LocalDateTime deadline;

    @Column(name = "views_count", nullable = false)
    private Integer viewsCount;

    @Column(name = "applications_count", nullable = false)
    private Integer applicationsCount;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobSkill> jobSkills = new ArrayList<>();
}
