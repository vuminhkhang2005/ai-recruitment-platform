package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobId(Long jobId);

    List<JobApplication> findByCandidateProfileId(Long candidateProfileId);

    java.util.Optional<JobApplication> findByUuid(String uuid);

    java.util.Optional<JobApplication> findByJobIdAndCandidateProfileId(Long jobId, Long candidateProfileId);

    boolean existsByJobIdAndCandidateProfileId(Long jobId, Long candidateProfileId);
}
