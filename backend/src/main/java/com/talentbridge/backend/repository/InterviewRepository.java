package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationIdOrderByRoundNumberAscScheduledStartAsc(Long applicationId);

    long countByApplicationId(Long applicationId);

    @Query("SELECT i FROM Interview i, JobApplication a WHERE a.id = i.applicationId AND a.job.company.id = :companyId "
            + "AND i.status IN ('SCHEDULED', 'RESCHEDULED') AND i.scheduledEnd >= :from ORDER BY i.scheduledStart ASC")
    List<Interview> findUpcomingForCompany(@Param("companyId") Long companyId, @Param("from") LocalDateTime from);

    @Query("SELECT i FROM Interview i WHERE :userId MEMBER OF i.panelistUserIds "
            + "AND i.status IN ('SCHEDULED', 'RESCHEDULED') AND i.scheduledEnd >= :from ORDER BY i.scheduledStart ASC")
    List<Interview> findUpcomingForPanelist(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("SELECT i FROM Interview i, JobApplication a WHERE a.id = i.applicationId AND a.candidateProfileId = :candidateProfileId "
            + "AND i.status IN ('SCHEDULED', 'RESCHEDULED') AND i.scheduledEnd >= :from ORDER BY i.scheduledStart ASC")
    List<Interview> findUpcomingForCandidate(@Param("candidateProfileId") Long candidateProfileId, @Param("from") LocalDateTime from);
}
