package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.ApplicationStageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationStageHistoryRepository extends JpaRepository<ApplicationStageHistory, Long> {
    List<ApplicationStageHistory> findByApplicationIdOrderByCreatedAtAscIdAsc(Long applicationId);
}
