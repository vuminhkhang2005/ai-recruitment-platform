package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {

    List<JobSkill> findByJobId(Long jobId);

    List<JobSkill> findByJobIdIn(java.util.Collection<Long> jobIds);

    /**
     * Bulk delete executed immediately. A derived deleteBy would queue entity removals that Hibernate
     * flushes after the re-inserted rows, violating the (job_id, skill_id) unique key on update.
     */
    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM JobSkill js WHERE js.job.id = :jobId")
    void deleteByJobId(@Param("jobId") Long jobId);
}
