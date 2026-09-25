package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Optional<Job> findByUuid(String uuid);

    Optional<Job> findBySlug(String slug);

    List<Job> findTop6ByStatusOrderByCreatedAtDesc(String status);

    long countByCompanyId(Long companyId);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.id = :id")
    Optional<Job> findByIdWithCompany(@Param("id") Long id);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.uuid = :uuid")
    Optional<Job> findByUuidWithCompany(@Param("uuid") String uuid);
}
