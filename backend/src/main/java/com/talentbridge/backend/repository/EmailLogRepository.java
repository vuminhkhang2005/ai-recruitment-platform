package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.EmailLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    List<EmailLog> findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(String referenceType, Long referenceId);

    List<EmailLog> findByToEmailOrderByCreatedAtDesc(String toEmail, Pageable pageable);
}
