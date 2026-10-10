package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.ApplicationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationMessageRepository extends JpaRepository<ApplicationMessage, Long> {

    List<ApplicationMessage> findByApplicationIdOrderByCreatedAtAscIdAsc(Long applicationId);

    Optional<ApplicationMessage> findFirstByApplicationIdOrderByCreatedAtDescIdDesc(Long applicationId);

    /** Unread messages written by the other side of the thread. */
    long countByApplicationIdAndSenderSideNotAndReadAtIsNull(Long applicationId, String viewerSide);

    @Query("SELECT COUNT(m) FROM ApplicationMessage m WHERE m.applicationId IN :applicationIds "
            + "AND m.senderSide <> :viewerSide AND m.readAt IS NULL")
    long countUnread(@Param("applicationIds") Collection<Long> applicationIds, @Param("viewerSide") String viewerSide);

    @Query("SELECT DISTINCT m.applicationId FROM ApplicationMessage m WHERE m.applicationId IN :applicationIds")
    List<Long> findApplicationIdsWithMessages(@Param("applicationIds") Collection<Long> applicationIds);

    @Modifying
    @Query("UPDATE ApplicationMessage m SET m.readAt = :now WHERE m.applicationId = :applicationId "
            + "AND m.senderSide <> :viewerSide AND m.readAt IS NULL")
    int markRead(@Param("applicationId") Long applicationId, @Param("viewerSide") String viewerSide, @Param("now") LocalDateTime now);
}
