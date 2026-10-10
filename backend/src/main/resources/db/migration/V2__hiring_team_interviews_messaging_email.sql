-- ==============================================================================
-- V2: Hiring team (company-level RBAC), interview panel, application messaging,
--     team invitations and e-mail delivery log.
--
-- V1 is the baseline = docs/phase-2-design/02_DATABASE_SCHEMA_DDL.sql (+ seed).
-- Flyway runs with baseline-on-migrate, so an existing database is stamped V1
-- and only this script is applied on top of it.
-- ==============================================================================

-- 1. Team role of each recruiter inside their company --------------------------
--    ADMIN       : manages company profile + team, full ATS access
--    RECRUITER   : manages all jobs/applicants of the company
--    INTERVIEWER : only sees applications they are on the interview panel for
ALTER TABLE `recruiter_profiles`
    ADD COLUMN `team_role` ENUM('ADMIN', 'RECRUITER', 'INTERVIEWER') NOT NULL DEFAULT 'RECRUITER'
        COMMENT 'Vai trò trong hội đồng tuyển dụng của công ty' AFTER `job_title`;

UPDATE `recruiter_profiles` SET `team_role` = 'ADMIN' WHERE `is_company_admin` = TRUE;

-- 2. Interview panel (who interviews / scores a given interview) ----------------
CREATE TABLE IF NOT EXISTS `interview_panelists` (
    `interview_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`interview_id`, `user_id`),
    KEY `idx_panelist_user` (`user_id`),
    CONSTRAINT `fk_panelist_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_panelist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thành viên hội đồng phỏng vấn';

-- 3. Candidate <-> hiring team conversation, one thread per application ---------
CREATE TABLE IF NOT EXISTS `application_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `sender_user_id` BIGINT UNSIGNED NOT NULL,
    `sender_side` ENUM('CANDIDATE', 'COMPANY') NOT NULL COMMENT 'Phía gửi tin',
    `content` TEXT NOT NULL,
    `read_at` DATETIME(3) DEFAULT NULL COMMENT 'Thời điểm phía bên kia đã đọc',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_msg_app_created` (`application_id`, `created_at`),
    KEY `idx_msg_sender` (`sender_user_id`),
    CONSTRAINT `fk_msg_app` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tin nhắn giữa ứng viên và nhà tuyển dụng';

-- 4. Invitations for joining a company's hiring team ---------------------------
CREATE TABLE IF NOT EXISTS `company_invitations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(100) DEFAULT NULL,
    `job_title` VARCHAR(100) DEFAULT NULL,
    `team_role` ENUM('ADMIN', 'RECRUITER', 'INTERVIEWER') NOT NULL DEFAULT 'RECRUITER',
    `token` CHAR(64) NOT NULL COMMENT 'Mã bí mật trong đường link mời',
    `invited_by_user_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    `expires_at` DATETIME(3) NOT NULL,
    `accepted_at` DATETIME(3) DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_invitation_token` (`token`),
    KEY `idx_invitation_company` (`company_id`, `status`),
    KEY `idx_invitation_email` (`email`, `status`),
    CONSTRAINT `fk_invitation_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_invitation_inviter` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lời mời tham gia hội đồng tuyển dụng';

-- 5. Outbound e-mail log (audit trail of every transactional e-mail) ----------
CREATE TABLE IF NOT EXISTS `email_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `to_email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(300) NOT NULL,
    `template` VARCHAR(60) NOT NULL COMMENT 'Mã mẫu email: APPLICATION_RECEIVED, INTERVIEW_INVITE...',
    `status` ENUM('SENT', 'FAILED', 'DISABLED') NOT NULL,
    `error_message` VARCHAR(500) DEFAULT NULL,
    `reference_type` VARCHAR(50) DEFAULT NULL,
    `reference_id` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_email_to` (`to_email`, `created_at`),
    KEY `idx_email_ref` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Nhật ký gửi email giao dịch';

-- 6. Make seeded ATS data consistent with company ownership --------------------
--    (seed script attributed every note/evaluation to user #2 regardless of company)
UPDATE `application_notes` n
    JOIN `job_applications` a ON a.`id` = n.`application_id`
    JOIN `jobs` j ON j.`id` = a.`job_id`
    JOIN `recruiter_profiles` rp ON rp.`id` = j.`recruiter_id`
SET n.`author_user_id` = rp.`user_id`;

UPDATE `interview_evaluations` e
    JOIN `interviews` i ON i.`id` = e.`interview_id`
    JOIN `job_applications` a ON a.`id` = i.`application_id`
    JOIN `jobs` j ON j.`id` = a.`job_id`
    JOIN `recruiter_profiles` rp ON rp.`id` = j.`recruiter_id`
SET e.`interviewer_user_id` = rp.`user_id`;

INSERT IGNORE INTO `interview_panelists` (`interview_id`, `user_id`)
SELECT i.`id`, rp.`user_id`
FROM `interviews` i
    JOIN `job_applications` a ON a.`id` = i.`application_id`
    JOIN `jobs` j ON j.`id` = a.`job_id`
    JOIN `recruiter_profiles` rp ON rp.`id` = j.`recruiter_id`;
