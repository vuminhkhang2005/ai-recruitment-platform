package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.CompanyInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyInvitationRepository extends JpaRepository<CompanyInvitation, Long> {

    Optional<CompanyInvitation> findByToken(String token);

    List<CompanyInvitation> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    List<CompanyInvitation> findByCompanyIdAndEmailAndStatus(Long companyId, String email, String status);
}
