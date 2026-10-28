package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.CompanyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, Long> {

    Page<CompanyReview> findByCompanyIdAndStatus(Long companyId, String status, Pageable pageable);

    Optional<CompanyReview> findByCompanyIdAndAuthorUserId(Long companyId, Long authorUserId);

    /** Rating histogram of published reviews: rows of [rating, count]. */
    @Query("SELECT r.rating, COUNT(r) FROM CompanyReview r WHERE r.companyId = :companyId AND r.status = 'PUBLISHED' GROUP BY r.rating")
    List<Object[]> ratingHistogram(@Param("companyId") Long companyId);

    /** Average rating and count of published reviews for every company: rows of [companyId, avg, count]. */
    @Query("SELECT r.companyId, AVG(r.rating), COUNT(r) FROM CompanyReview r WHERE r.status = 'PUBLISHED' GROUP BY r.companyId")
    List<Object[]> ratingSummaryByCompany();

    /** Admin moderation list, newest first; optional status and keyword (title / pros / cons) filters. */
    @Query("SELECT r FROM CompanyReview r WHERE (:status IS NULL OR r.status = :status) "
            + "AND (:keyword IS NULL OR LOWER(r.title) LIKE :keyword OR LOWER(r.pros) LIKE :keyword OR LOWER(r.cons) LIKE :keyword) "
            + "ORDER BY r.createdAt DESC")
    List<CompanyReview> searchForModeration(@Param("status") String status, @Param("keyword") String keyword);
}
