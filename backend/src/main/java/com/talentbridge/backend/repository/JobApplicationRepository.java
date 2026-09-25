package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobId(Long jobId);

    boolean existsByJobIdAndCandidateProfileId(Long jobId, Long candidateProfileId);
}
