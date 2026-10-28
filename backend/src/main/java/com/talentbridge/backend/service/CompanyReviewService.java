package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.CompanyReviewDtos.*;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Company reviews written by candidates.
 * <ul>
 *   <li>Only candidates who applied to at least one job of the company may write a review (one per company).</li>
 *   <li>The "experience level" badge (APPLIED / INTERVIEWED / HIRED) is derived from the real hiring pipeline, not self-declared.</li>
 *   <li>Anonymous reviews never expose the author's identity through the public API.</li>
 *   <li>Admins can hide / re-publish reviews; every moderation action is written to the audit log.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class CompanyReviewService {

    public static final String PUBLISHED = "PUBLISHED";
    public static final String HIDDEN = "HIDDEN";

    private static final Map<String, Integer> STAGE_RANK = Map.of(
            "APPLIED", 1, "SCREENING", 1, "INTERVIEW", 2, "OFFERED", 2, "HIRED", 3);

    private final CompanyReviewRepository reviewRepository;
    private final CompanyRepository companyRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationStageHistoryRepository stageHistoryRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    // ------------------------------------------------------------------ public

    @Transactional(readOnly = true)
    public ReviewPageDto listPublished(Long companyId, String sort, int page, int size, Long currentUserId) {
        ensureCompany(companyId);
        Sort order = switch (sort == null ? "newest" : sort.toLowerCase()) {
            case "highest" -> Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("createdAt"));
            case "lowest" -> Sort.by(Sort.Order.asc("rating"), Sort.Order.desc("createdAt"));
            default -> Sort.by(Sort.Order.desc("createdAt"));
        };
        int safeSize = Math.max(1, Math.min(size, 50));
        Page<CompanyReview> result = reviewRepository.findByCompanyIdAndStatus(
                companyId, PUBLISHED, PageRequest.of(Math.max(0, page), safeSize, order));

        Map<Long, User> authors = loadUsers(result.getContent().stream().map(CompanyReview::getAuthorUserId).toList());
        List<ReviewDto> items = result.getContent().stream()
                .map(r -> toDto(r, authors.get(r.getAuthorUserId()), currentUserId, null, false))
                .toList();

        return ReviewPageDto.builder()
                .summary(summary(companyId))
                .items(items)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewSummaryDto summary(Long companyId) {
        long[] buckets = new long[5];
        long count = 0;
        long sum = 0;
        for (Object[] row : reviewRepository.ratingHistogram(companyId)) {
            int rating = ((Number) row[0]).intValue();
            long n = ((Number) row[1]).longValue();
            if (rating >= 1 && rating <= 5) {
                buckets[5 - rating] += n;
                count += n;
                sum += (long) rating * n;
            }
        }
        Double avg = count == 0 ? null : round1((double) sum / count);
        return ReviewSummaryDto.builder()
                .companyId(companyId)
                .average(avg)
                .count(count)
                .distribution(Arrays.stream(buckets).boxed().toList())
                .build();
    }

    /** companyId → [average (1 decimal), count] of published reviews, for company cards and lists. */
    @Transactional(readOnly = true)
    public Map<Long, double[]> ratingSummaryByCompany() {
        Map<Long, double[]> map = new HashMap<>();
        for (Object[] row : reviewRepository.ratingSummaryByCompany()) {
            map.put(((Number) row[0]).longValue(),
                    new double[]{round1(((Number) row[1]).doubleValue()), ((Number) row[2]).doubleValue()});
        }
        return map;
    }

    // ------------------------------------------------------------------ candidate

    @Transactional(readOnly = true)
    public ReviewEligibilityDto eligibility(Long companyId, Long userId) {
        ensureCompany(companyId);
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return ReviewEligibilityDto.builder().canReview(false).reason("NOT_CANDIDATE").build();
        }
        Optional<CompanyReview> existing = reviewRepository.findByCompanyIdAndAuthorUserId(companyId, userId);
        if (existing.isPresent()) {
            User me = userRepository.findById(userId).orElse(null);
            return ReviewEligibilityDto.builder()
                    .canReview(false)
                    .reason("ALREADY_REVIEWED")
                    .experienceLevel(existing.get().getExperienceLevel())
                    .myReview(toDto(existing.get(), me, userId, null, false))
                    .build();
        }
        List<JobApplication> apps = jobApplicationRepository.findByCandidateProfileIdAndCompanyId(profile.getId(), companyId);
        if (apps.isEmpty()) {
            return ReviewEligibilityDto.builder().canReview(false).reason("NO_APPLICATION").build();
        }
        return ReviewEligibilityDto.builder()
                .canReview(true)
                .reason("OK")
                .experienceLevel(experienceLevel(apps))
                .build();
    }

    @Transactional
    public ReviewDto create(Long companyId, Long userId, ReviewRequestDto req) {
        Company company = ensureCompany(companyId);
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AccessDeniedException("Chỉ ứng viên mới có thể đánh giá công ty."));
        if (reviewRepository.findByCompanyIdAndAuthorUserId(companyId, userId).isPresent()) {
            throw new BadRequestException("Bạn đã đánh giá công ty này. Hãy chỉnh sửa đánh giá hiện có.");
        }
        List<JobApplication> apps = jobApplicationRepository.findByCandidateProfileIdAndCompanyId(profile.getId(), companyId);
        if (apps.isEmpty()) {
            throw new BadRequestException("Bạn chỉ có thể đánh giá công ty mà bạn đã từng ứng tuyển.");
        }
        validateContent(req);

        JobApplication latest = apps.stream()
                .max(Comparator.comparing(JobApplication::getAppliedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                .orElse(apps.get(0));

        CompanyReview saved = reviewRepository.save(CompanyReview.builder()
                .companyId(companyId)
                .authorUserId(userId)
                .rating(req.getRating())
                .title(req.getTitle().trim())
                .pros(trimToNull(req.getPros()))
                .cons(trimToNull(req.getCons()))
                .experienceLevel(experienceLevel(apps))
                .jobTitle(latest.getJob() != null ? latest.getJob().getTitle() : null)
                .isAnonymous(!Boolean.FALSE.equals(req.getAnonymous()))
                .status(PUBLISHED)
                .build());
        return toDto(saved, userRepository.findById(userId).orElse(null), userId, company.getName(), false);
    }

    @Transactional
    public ReviewDto updateMine(Long companyId, Long userId, ReviewRequestDto req) {
        CompanyReview review = reviewRepository.findByCompanyIdAndAuthorUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa có đánh giá nào cho công ty này."));
        validateContent(req);
        review.setRating(req.getRating());
        review.setTitle(req.getTitle().trim());
        review.setPros(trimToNull(req.getPros()));
        review.setCons(trimToNull(req.getCons()));
        review.setIsAnonymous(!Boolean.FALSE.equals(req.getAnonymous()));
        // Hidden reviews stay hidden after an edit until an admin re-publishes them.
        CompanyReview saved = reviewRepository.save(review);
        return toDto(saved, userRepository.findById(userId).orElse(null), userId, null, false);
    }

    @Transactional
    public void deleteMine(Long companyId, Long userId) {
        CompanyReview review = reviewRepository.findByCompanyIdAndAuthorUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa có đánh giá nào cho công ty này."));
        reviewRepository.delete(review);
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public List<ReviewDto> listForModeration(String status, String keyword) {
        String st = StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status) ? status.toUpperCase() : null;
        String kw = StringUtils.hasText(keyword) ? "%" + keyword.trim().toLowerCase() + "%" : null;
        List<CompanyReview> reviews = reviewRepository.searchForModeration(st, kw);
        Map<Long, User> authors = loadUsers(reviews.stream().map(CompanyReview::getAuthorUserId).toList());
        Map<Long, String> companyNames = companyRepository.findAllById(
                        reviews.stream().map(CompanyReview::getCompanyId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Company::getId, Company::getName));
        return reviews.stream()
                .map(r -> toDto(r, authors.get(r.getAuthorUserId()), null, companyNames.get(r.getCompanyId()), true))
                .toList();
    }

    @Transactional
    public ReviewDto moderate(Long reviewId, Long adminUserId, ModerateReviewRequestDto req) {
        String newStatus = req.getStatus() == null ? "" : req.getStatus().trim().toUpperCase();
        if (!PUBLISHED.equals(newStatus) && !HIDDEN.equals(newStatus)) {
            throw new BadRequestException("Trạng thái không hợp lệ. Chỉ chấp nhận PUBLISHED hoặc HIDDEN.");
        }
        if (HIDDEN.equals(newStatus) && !StringUtils.hasText(req.getNote())) {
            throw new BadRequestException("Vui lòng nhập lý do khi ẩn đánh giá.");
        }
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá #" + reviewId));
        String oldStatus = review.getStatus();
        review.setStatus(newStatus);
        review.setModerationNote(trimToNull(req.getNote()));
        CompanyReview saved = reviewRepository.save(review);

        auditLogRepository.save(AuditLog.builder()
                .userId(adminUserId)
                .action(HIDDEN.equals(newStatus) ? "COMPANY_REVIEW_HIDDEN" : "COMPANY_REVIEW_PUBLISHED")
                .entityName("company_reviews")
                .entityId(reviewId)
                .oldValues("{\"status\":\"" + oldStatus + "\"}")
                .newValues("{\"status\":\"" + newStatus + "\",\"note\":" + jsonString(req.getNote()) + "}")
                .ipAddress("127.0.0.1")
                .userAgent("TalentBridge-Admin-Console/1.0")
                .correlationId(UUID.randomUUID().toString())
                .build());

        String companyName = companyRepository.findById(saved.getCompanyId()).map(Company::getName).orElse(null);
        return toDto(saved, userRepository.findById(saved.getAuthorUserId()).orElse(null), null, companyName, true);
    }

    // ------------------------------------------------------------------ helpers

    /** Furthest stage reached across the candidate's applications at the company (stage history included). */
    public String experienceLevel(List<JobApplication> apps) {
        int best = 1;
        for (JobApplication a : apps) {
            best = Math.max(best, STAGE_RANK.getOrDefault(a.getCurrentStage(), 1));
            if (best < 3 && a.getId() != null) {
                for (ApplicationStageHistory h : stageHistoryRepository.findByApplicationIdOrderByCreatedAtAscIdAsc(a.getId())) {
                    best = Math.max(best, STAGE_RANK.getOrDefault(h.getToStage(), 1));
                }
            }
        }
        return best >= 3 ? "HIRED" : best == 2 ? "INTERVIEWED" : "APPLIED";
    }

    private void validateContent(ReviewRequestDto req) {
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new BadRequestException("Số sao phải từ 1 đến 5.");
        }
        int len = (req.getPros() == null ? 0 : req.getPros().trim().length())
                + (req.getCons() == null ? 0 : req.getCons().trim().length());
        if (len < 20) {
            throw new BadRequestException("Hãy chia sẻ thêm ưu điểm hoặc nhược điểm (tối thiểu 20 ký tự) để đánh giá hữu ích hơn.");
        }
    }

    private Company ensureCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công ty #" + companyId));
    }

    private Map<Long, User> loadUsers(Collection<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        return userRepository.findAllById(new HashSet<>(ids)).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private ReviewDto toDto(CompanyReview r, User author, Long currentUserId, String companyName, boolean adminView) {
        boolean anonymous = Boolean.TRUE.equals(r.getIsAnonymous());
        boolean showIdentity = adminView || !anonymous;
        return ReviewDto.builder()
                .id(r.getId())
                .companyId(r.getCompanyId())
                .companyName(companyName)
                .rating(r.getRating())
                .title(r.getTitle())
                .pros(r.getPros())
                .cons(r.getCons())
                .experienceLevel(r.getExperienceLevel())
                .jobTitle(r.getJobTitle())
                .anonymous(anonymous)
                .authorName(showIdentity && author != null ? author.getFullName() : null)
                .authorAvatarUrl(showIdentity && author != null ? author.getAvatarUrl() : null)
                .authorEmail(adminView && author != null ? author.getEmail() : null)
                .mine(currentUserId != null && currentUserId.equals(r.getAuthorUserId()))
                .status(r.getStatus())
                .moderationNote(adminView || (currentUserId != null && currentUserId.equals(r.getAuthorUserId())) ? r.getModerationNote() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private static String trimToNull(String s) {
        return StringUtils.hasText(s) ? s.trim() : null;
    }

    private static double round1(double v) {
        return BigDecimal.valueOf(v).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private static String jsonString(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }
}
