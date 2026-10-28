-- ==============================================================================
-- V4: Company reviews (candidate experience ratings) with admin moderation.
--
-- * Only candidates who have applied to at least one job of the company may review it.
-- * One review per (company, author); the author may edit or delete it.
-- * experience_level is derived server-side from the furthest hiring stage reached
--   (APPLIED / INTERVIEWED / HIRED) and shown as a "verified" badge.
-- * Admins can hide abusive reviews (status = HIDDEN) without deleting them.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `company_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `author_user_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL COMMENT 'Overall rating 1..5',
    `title` VARCHAR(150) NOT NULL,
    `pros` TEXT NULL,
    `cons` TEXT NULL,
    `experience_level` ENUM('APPLIED', 'INTERVIEWED', 'HIRED') NOT NULL DEFAULT 'APPLIED'
        COMMENT 'Furthest hiring stage the author reached at this company (verified)',
    `job_title` VARCHAR(255) NULL COMMENT 'Position the author applied for (snapshot)',
    `is_anonymous` BOOLEAN NOT NULL DEFAULT TRUE,
    `status` ENUM('PUBLISHED', 'HIDDEN') NOT NULL DEFAULT 'PUBLISHED',
    `moderation_note` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_review_company_author` (`company_id`, `author_user_id`),
    KEY `idx_review_company_status` (`company_id`, `status`, `created_at`),
    KEY `idx_review_status` (`status`, `created_at`),
    CONSTRAINT `fk_review_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_author` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_review_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Candidate reviews of companies';
