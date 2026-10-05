package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.CandidateSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {
    List<CandidateSkill> findByCandidateProfileId(Long candidateProfileId);

    @Modifying
    @Query("DELETE FROM CandidateSkill cs WHERE cs.candidateProfileId = :profileId")
    void deleteAllByCandidateProfileId(@Param("profileId") Long profileId);
}
