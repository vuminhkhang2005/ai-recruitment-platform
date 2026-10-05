package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.Cv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvRepository extends JpaRepository<Cv, Long> {
    List<Cv> findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(Long candidateProfileId);

    Optional<Cv> findByIdAndDeletedAtIsNull(Long id);
}
