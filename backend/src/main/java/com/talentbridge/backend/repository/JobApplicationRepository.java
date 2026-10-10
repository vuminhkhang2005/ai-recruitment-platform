package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobId(Long jobId);

    List<JobApplication> findByCandidateProfileId(Long candidateProfileId);

    Optional<JobApplication> findByUuid(String uuid);

    Optional<JobApplication> findByJobIdAndCandidateProfileId(Long jobId, Long candidateProfileId);

    boolean existsByJobIdAndCandidateProfileId(Long jobId, Long candidateProfileId);

    boolean existsByCvIdAndJobRecruiterId(Long cvId, Long recruiterId);

    boolean existsByCvIdAndJobCompanyId(Long cvId, Long companyId);

    @Query("SELECT a FROM JobApplication a JOIN FETCH a.job j WHERE j.recruiterId = :recruiterProfileId ORDER BY a.appliedAt DESC")
    List<JobApplication> findAllForRecruiter(@Param("recruiterProfileId") Long recruiterProfileId);

    /** Every application to any job of the company (hiring team view). */
    @Query("SELECT a FROM JobApplication a JOIN FETCH a.job j WHERE j.company.id = :companyId ORDER BY a.appliedAt DESC")
    List<JobApplication> findAllForCompany(@Param("companyId") Long companyId);

    /** Applications where the user sits on at least one interview panel (interviewer view). */
    @Query("SELECT DISTINCT a FROM JobApplication a JOIN FETCH a.job j, Interview i "
            + "WHERE i.applicationId = a.id AND :userId MEMBER OF i.panelistUserIds ORDER BY a.appliedAt DESC")
    List<JobApplication> findAllForPanelist(@Param("userId") Long userId);

    /** CV visible to an interviewer only through an application they are on the panel for. */
    @Query("SELECT COUNT(a) > 0 FROM JobApplication a, Interview i "
            + "WHERE i.applicationId = a.id AND a.cvId = :cvId AND :userId MEMBER OF i.panelistUserIds")
    boolean existsByCvIdForPanelist(@Param("cvId") Long cvId, @Param("userId") Long userId);
}
