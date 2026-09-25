-- ==============================================================================
-- DỰ ÁN: NỀN TẢNG TUYỂN DỤNG VÀ ĐỊNH HƯỚNG NGHỀ NGHIỆP TÍCH HỢP AI
-- HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU: MySQL 8.0+ (InnoDB Engine)
-- BẢNG MÃ: utf8mb4 / utf8mb4_0900_ai_ci
-- TẬP LỆNH DDL TOÀN DIỆN (ENTERPRISE DATABASE SCHEMA DEFINITION)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. KHỞI TẠO CƠ SỞ DỮ LIỆU
-- ------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `ai_recruitment_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE `ai_recruitment_db`;

-- ------------------------------------------------------------------------------
-- 2. PHÂN HỆ: IDENTITY & ACCESS MANAGEMENT (RBAC)
-- ------------------------------------------------------------------------------

-- Bảng người dùng toàn hệ thống
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính nội bộ clustered index',
    `uuid` CHAR(36) NOT NULL COMMENT 'Public UUID không lộ ID tự tăng ra API/URL',
    `email` VARCHAR(191) NOT NULL COMMENT 'Email đăng nhập hệ thống',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu băm (BCrypt/Argon2id)',
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Số điện thoại',
    `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL ảnh đại diện',
    `status` ENUM('ACTIVE', 'PENDING_VERIFY', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'PENDING_VERIFY' COMMENT 'Trạng thái tài khoản',
    `is_email_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đã xác thực email hay chưa',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm đăng ký',
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm sửa đổi cuối',
    `deleted_at` DATETIME(3) DEFAULT NULL COMMENT 'Thời điểm soft-delete (NULL là còn hiệu lực)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_uuid` (`uuid`),
    UNIQUE KEY `uq_users_email` (`email`),
    KEY `idx_users_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tài khoản người dùng toàn hệ thống';

-- Bảng danh mục vai trò người dùng (Roles)
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT 'Tên vai trò (ROLE_CANDIDATE, ROLE_RECRUITER,...)',
    `description` VARCHAR(255) DEFAULT NULL COMMENT 'Mô tả vai trò',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh mục vai trò người dùng';

-- Bảng danh mục quyền hạn chi tiết (Permissions)
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL COMMENT 'Mã quyền (job:create, candidate:view_pii,...)',
    `module_name` VARCHAR(50) NOT NULL COMMENT 'Nhóm phân hệ (JOB, ATS, CV, USER)',
    `description` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_permissions_code` (`code`),
    KEY `idx_permissions_module` (`module_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh mục quyền hạn chi tiết';

-- Bảng liên kết N-N: Roles - Permissions
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
    `role_id` TINYINT UNSIGNED NOT NULL,
    `permission_id` SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    CONSTRAINT `fk_role_perm_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_role_perm_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Gán quyền cho vai trò';

-- Bảng liên kết N-N: Users - Roles
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Gán vai trò cho người dùng';

-- Bảng lưu trữ Refresh Token xác thực
DROP TABLE IF EXISTS `user_tokens`;
CREATE TABLE `user_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL COMMENT 'Hash của refresh token',
    `device_info` VARCHAR(255) DEFAULT NULL COMMENT 'Thông tin trình duyệt / thiết bị',
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `expires_at` DATETIME NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_token_hash` (`token_hash`),
    KEY `idx_user_tokens_user` (`user_id`, `is_revoked`, `expires_at`),
    CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Quản lý phiên Refresh Token';

-- ------------------------------------------------------------------------------
-- 3. PHÂN HỆ: MASTER DATA (KỸ NĂNG & DANH MỤC CÔNG NGHỆ)
-- ------------------------------------------------------------------------------

-- Bảng cây từ điển kỹ năng chuẩn hóa toàn hệ thống
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên kỹ năng chuẩn (C#, Docker, React,...)',
    `slug` VARCHAR(120) NOT NULL COMMENT 'Slug tìm kiếm',
    `category` ENUM(
        'PROGRAMMING_LANGUAGE',
        'FRAMEWORK',
        'DATABASE',
        'CLOUD_DEVOPS',
        'TESTING',
        'METHODOLOGY',
        'SOFT_SKILL',
        'OTHER'
    ) NOT NULL DEFAULT 'OTHER' COMMENT 'Phân loại công nghệ',
    `description` VARCHAR(500) DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_skills_name` (`name`),
    UNIQUE KEY `uq_skills_slug` (`slug`),
    KEY `idx_skills_category` (`category`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Từ điển kỹ năng chuẩn hóa';

-- Bảng ánh xạ từ đồng nghĩa kỹ năng (Aliases/Synonyms)
DROP TABLE IF EXISTS `skill_aliases`;
CREATE TABLE `skill_aliases` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `skill_id` BIGINT UNSIGNED NOT NULL,
    `alias_name` VARCHAR(100) NOT NULL COMMENT 'Tên gọi khác (ReactJS, React.js -> React)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_alias_name` (`alias_name`),
    KEY `idx_alias_skill` (`skill_id`),
    CONSTRAINT `fk_alias_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Từ đồng nghĩa kỹ năng cho AI parser';

-- ------------------------------------------------------------------------------
-- 4. PHÂN HỆ: DOANH NGHIỆP & NHÀ TUYỂN DỤNG (COMPANIES & RECRUITERS)
-- ------------------------------------------------------------------------------

-- Bảng hồ sơ công ty tuyển dụng
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL COMMENT 'Tên thương hiệu doanh nghiệp',
    `slug` VARCHAR(220) NOT NULL COMMENT 'Slug trang công ty',
    `logo_url` VARCHAR(500) DEFAULT NULL,
    `banner_url` VARCHAR(500) DEFAULT NULL,
    `website` VARCHAR(255) DEFAULT NULL,
    `industry` VARCHAR(100) DEFAULT NULL,
    `company_size` VARCHAR(50) DEFAULT NULL COMMENT 'Quy mô nhân sự',
    `tax_code` VARCHAR(50) DEFAULT NULL COMMENT 'Mã số thuế doanh nghiệp',
    `description` TEXT DEFAULT NULL COMMENT 'Giới thiệu công ty',
    `address` VARCHAR(300) DEFAULT NULL,
    `city` VARCHAR(100) DEFAULT NULL,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'Kiểm duyệt của Admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_companies_uuid` (`uuid`),
    UNIQUE KEY `uq_companies_slug` (`slug`),
    KEY `idx_companies_status` (`verification_status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Hồ sơ doanh nghiệp tuyển dụng';

-- Bảng thông tin nhân viên tuyển dụng thuộc công ty
DROP TABLE IF EXISTS `recruiter_profiles`;
CREATE TABLE `recruiter_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `job_title` VARCHAR(100) DEFAULT NULL COMMENT 'Chức vụ (Talent Acquisition Specialist,...)',
    `is_company_admin` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Quyền quản lý nhân sự công ty',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_recruiter_user` (`user_id`),
    KEY `idx_recruiter_company` (`company_id`),
    CONSTRAINT `fk_recruiter_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_recruiter_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông tin chuyên viên tuyển dụng';

-- ------------------------------------------------------------------------------
-- 5. PHÂN HỆ: TIN TUYỂN DỤNG & YÊU CẦU CÔNG NGHỆ (JOBS & JD ANALYSIS)
-- ------------------------------------------------------------------------------

-- Bảng tin tuyển dụng
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `recruiter_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(200) NOT NULL COMMENT 'Tiêu đề tin tuyển dụng',
    `slug` VARCHAR(250) NOT NULL,
    `description` LONGTEXT NOT NULL COMMENT 'Mô tả công việc',
    `requirements` LONGTEXT NOT NULL COMMENT 'Yêu cầu chuyên môn',
    `benefits` LONGTEXT DEFAULT NULL COMMENT 'Quyền lợi, đãi ngộ',
    `job_type` ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'REMOTE', 'HYBRID') NOT NULL DEFAULT 'FULL_TIME',
    `exp_level` ENUM('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD') NOT NULL DEFAULT 'FRESHER',
    `min_salary` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Lương tối thiểu (VNĐ)',
    `max_salary` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Lương tối đa (VNĐ)',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `is_salary_negotiable` BOOLEAN NOT NULL DEFAULT FALSE,
    `location_city` VARCHAR(100) NOT NULL COMMENT 'Tỉnh / Thành phố làm việc',
    `location_address` VARCHAR(300) DEFAULT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `deadline` DATETIME DEFAULT NULL COMMENT 'Hạn nộp hồ sơ',
    `views_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Số lượt xem',
    `applications_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Số lượt nộp CV',
    `published_at` DATETIME(3) DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_jobs_uuid` (`uuid`),
    UNIQUE KEY `uq_jobs_slug` (`slug`),
    KEY `idx_jobs_filter` (`status`, `exp_level`, `location_city`, `published_at`),
    KEY `idx_jobs_company` (`company_id`, `status`),
    KEY `idx_jobs_recruiter` (`recruiter_id`),
    FULLTEXT KEY `ft_jobs_search` (`title`, `description`, `requirements`) /*!50100 WITH PARSER ngram */,
    CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_jobs_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiter_profiles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tin tuyển dụng doanh nghiệp';

-- Bảng kỹ năng yêu cầu của từng tin tuyển dụng
DROP TABLE IF EXISTS `job_skills`;
CREATE TABLE `job_skills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT UNSIGNED NOT NULL,
    `skill_id` BIGINT UNSIGNED NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: Bắt buộc (Must-have), FALSE: Ưu tiên (Nice-to-have)',
    `min_years_exp` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Số năm kinh nghiệm tối thiểu',
    `weight` DECIMAL(3, 2) NOT NULL DEFAULT 1.00 COMMENT 'Trọng số điểm trong matching (0.1 - 2.0)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_job_skill` (`job_id`, `skill_id`),
    KEY `idx_job_skills_skill` (`skill_id`),
    CONSTRAINT `fk_job_skills_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_job_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Kỹ năng yêu cầu của tin tuyển dụng';

-- ------------------------------------------------------------------------------
-- 6. PHÂN HỆ: HỒ SƠ ỨNG VIÊN & QUẢN LÝ CV (CANDIDATE & CV MANAGEMENT)
-- ------------------------------------------------------------------------------

-- Bảng hồ sơ chi tiết của ứng viên
DROP TABLE IF EXISTS `candidate_profiles`;
CREATE TABLE `candidate_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `headline` VARCHAR(150) DEFAULT NULL COMMENT 'Tiêu đề hồ sơ (ví dụ: Fresher .NET Backend)',
    `bio` TEXT DEFAULT NULL COMMENT 'Tóm tắt bản thân',
    `city` VARCHAR(100) DEFAULT NULL,
    `country` VARCHAR(50) NOT NULL DEFAULT 'Vietnam',
    `linkedin_url` VARCHAR(255) DEFAULT NULL,
    `github_url` VARCHAR(255) DEFAULT NULL,
    `portfolio_url` VARCHAR(255) DEFAULT NULL,
    `expected_salary_min` DECIMAL(12, 2) DEFAULT NULL,
    `expected_salary_max` DECIMAL(12, 2) DEFAULT NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE', 'ANONYMOUS') NOT NULL DEFAULT 'PUBLIC' COMMENT 'Quyền riêng tư hồ sơ',
    `is_open_to_work` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cand_uuid` (`uuid`),
    UNIQUE KEY `uq_cand_user` (`user_id`),
    KEY `idx_cand_search` (`visibility`, `is_open_to_work`, `city`),
    CONSTRAINT `fk_cand_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Hồ sơ chi tiết của ứng viên';

-- Bảng kỹ năng đã xác thực / khai báo của ứng viên
DROP TABLE IF EXISTS `candidate_skills`;
CREATE TABLE `candidate_skills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `candidate_profile_id` BIGINT UNSIGNED NOT NULL,
    `skill_id` BIGINT UNSIGNED NOT NULL,
    `proficiency` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NOT NULL DEFAULT 'INTERMEDIATE',
    `years_experience` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `is_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Được AI xác thực qua dự án/chứng chỉ',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cand_skill` (`candidate_profile_id`, `skill_id`),
    KEY `idx_cand_skills_skill` (`skill_id`),
    CONSTRAINT `fk_cand_skills_profile` FOREIGN KEY (`candidate_profile_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cand_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Kỹ năng sở hữu của ứng viên';

-- Bảng quản lý các phiên bản file CV của ứng viên
DROP TABLE IF EXISTS `cvs`;
CREATE TABLE `cvs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `candidate_profile_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL COMMENT 'Tên phiên bản CV (CV .NET, CV React,...)',
    `file_url` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn file trên S3/MinIO',
    `file_name` VARCHAR(255) NOT NULL COMMENT 'Tên file gốc người dùng tải lên',
    `file_size_bytes` INT UNSIGNED NOT NULL COMMENT 'Dung lượng file (bytes)',
    `file_md5` CHAR(32) NOT NULL COMMENT 'Mã MD5 chống upload lặp file',
    `parsing_status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái AI bóc tách',
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'CV chính dùng cho ứng tuyển nhanh',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cvs_uuid` (`uuid`),
    KEY `idx_cvs_candidate` (`candidate_profile_id`, `is_default`, `deleted_at`),
    CONSTRAINT `fk_cvs_candidate` FOREIGN KEY (`candidate_profile_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Quản lý các file CV của ứng viên';

-- Bảng dữ liệu có cấu trúc bóc tách từ CV bằng AI
DROP TABLE IF EXISTS `cv_parsed_data`;
CREATE TABLE `cv_parsed_data` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cv_id` BIGINT UNSIGNED NOT NULL,
    `raw_parsed_json` JSON NOT NULL COMMENT 'Toàn bộ payload JSON cấu trúc trả về từ LLM',
    `extracted_summary` TEXT DEFAULT NULL COMMENT 'Tóm tắt tiểu sử AI trích xuất',
    `extracted_skills` JSON DEFAULT NULL COMMENT 'Mảng kỹ năng bóc tách được',
    `extracted_experiences` JSON DEFAULT NULL COMMENT 'Mảng kinh nghiệm bóc tách',
    `extracted_educations` JSON DEFAULT NULL COMMENT 'Mảng học vấn bóc tách',
    `extracted_projects` JSON DEFAULT NULL COMMENT 'Mảng dự án bóc tách',
    `quality_score` DECIMAL(4, 1) DEFAULT NULL COMMENT 'Điểm đánh giá chất lượng CV (0 - 100)',
    `improvement_feedback` TEXT DEFAULT NULL COMMENT 'Lời khuyên sửa đổi CV của AI',
    `analyzed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cv_parsed_cv` (`cv_id`),
    CONSTRAINT `fk_cv_parsed_cv` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Dữ liệu bóc tách CV qua AI';

-- ------------------------------------------------------------------------------
-- 7. PHÂN HỆ: QUY TRÌNH ỨNG TUYỂN & PIPELINE ATS KANBAN
-- ------------------------------------------------------------------------------

-- Bảng đơn nộp ứng tuyển công việc (Tương ứng với 1 Card trên Kanban)
DROP TABLE IF EXISTS `job_applications`;
CREATE TABLE `job_applications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `job_id` BIGINT UNSIGNED NOT NULL,
    `candidate_profile_id` BIGINT UNSIGNED NOT NULL,
    `cv_id` BIGINT UNSIGNED NOT NULL COMMENT 'Bản CV cụ thể được dùng để nộp',
    `cover_letter` TEXT DEFAULT NULL,
    `current_stage` ENUM('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED') NOT NULL DEFAULT 'APPLIED' COMMENT 'Cột trạng thái Kanban',
    `match_score` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Điểm AI Matching sao chép nhanh để sort',
    `rejection_reason` VARCHAR(500) DEFAULT NULL COMMENT 'Lý do từ chối (nếu có)',
    `applied_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_app_uuid` (`uuid`),
    UNIQUE KEY `uq_candidate_job_apply` (`job_id`, `candidate_profile_id`),
    KEY `idx_app_kanban` (`job_id`, `current_stage`, `match_score` DESC),
    KEY `idx_app_candidate` (`candidate_profile_id`, `applied_at` DESC),
    CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_app_cand` FOREIGN KEY (`candidate_profile_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_app_cv` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Đơn ứng tuyển (Thẻ trên Kanban ATS)';

-- Bảng nhật ký chuyển giai đoạn tuyển dụng (Audit Stage Transitions)
DROP TABLE IF EXISTS `application_stage_histories`;
CREATE TABLE `application_stage_histories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `from_stage` ENUM('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED') DEFAULT NULL,
    `to_stage` ENUM('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED') NOT NULL,
    `changed_by_user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Recruiter/Admin thực hiện thao tác',
    `note` TEXT DEFAULT NULL COMMENT 'Ghi chú lý do chuyển giai đoạn',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_stage_hist_app` (`application_id`, `created_at`),
    KEY `idx_stage_hist_user` (`changed_by_user_id`),
    CONSTRAINT `fk_stage_hist_app` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_stage_hist_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử chuyển trạng thái đơn ứng tuyển';

-- Bảng ghi chú nội bộ của Recruiter / Hiring Manager về ứng viên
DROP TABLE IF EXISTS `application_notes`;
CREATE TABLE `application_notes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `author_user_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL COMMENT 'Nội dung trao đổi nội bộ về ứng viên',
    `is_private` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Chỉ người tạo mới xem được',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_notes_app` (`application_id`),
    CONSTRAINT `fk_notes_app` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notes_author` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ghi chú nội bộ cho đơn ứng tuyển';

-- ------------------------------------------------------------------------------
-- 8. PHÂN HỆ: KHỚP NỐI AI & GIẢI THÍCH (CANDIDATE-JOB MATCHING)
-- ------------------------------------------------------------------------------

-- Bảng phân tích mức độ phù hợp và giải thích chi tiết
DROP TABLE IF EXISTS `candidate_job_matches`;
CREATE TABLE `candidate_job_matches` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT UNSIGNED NOT NULL,
    `candidate_profile_id` BIGINT UNSIGNED NOT NULL,
    `cv_id` BIGINT UNSIGNED NOT NULL,
    `application_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Gắn với đơn ứng tuyển nếu đã nộp',
    `overall_score` DECIMAL(5, 2) NOT NULL COMMENT 'Điểm tổng thể (0.00 - 100.00)',
    `must_have_score` DECIMAL(5, 2) NOT NULL COMMENT 'Điểm kỹ năng bắt buộc (Trọng số 45%)',
    `nice_to_have_score` DECIMAL(5, 2) NOT NULL COMMENT 'Điểm kỹ năng ưu tiên (Trọng số 20%)',
    `experience_score` DECIMAL(5, 2) NOT NULL COMMENT 'Điểm kinh nghiệm & dự án (Trọng số 25%)',
    `semantic_score` DECIMAL(5, 2) NOT NULL COMMENT 'Điểm vector ngữ nghĩa (Trọng số 10%)',
    `matched_skills_json` JSON DEFAULT NULL COMMENT 'Mảng kỹ năng khớp hoàn toàn',
    `missing_skills_json` JSON DEFAULT NULL COMMENT 'Mảng kỹ năng bắt buộc bị thiếu',
    `improvement_skills_json` JSON DEFAULT NULL COMMENT 'Mảng kỹ năng cần trau dồi',
    `ai_explanation` TEXT DEFAULT NULL COMMENT 'Đoạn văn AI giải thích khách quan lý do chấm điểm',
    `computed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_match_job_cv` (`job_id`, `cv_id`),
    KEY `idx_match_cand` (`candidate_profile_id`),
    KEY `idx_match_app` (`application_id`),
    CONSTRAINT `fk_match_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_match_cand` FOREIGN KEY (`candidate_profile_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_match_cv` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_match_app` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chi tiết điểm số Matching và giải thích của AI';

-- ------------------------------------------------------------------------------
-- 9. PHÂN HỆ: LỘ TRÌNH NGHỀ NGHIỆP CÁ NHÂN HÓA (SKILL GAP & ROADMAP)
-- ------------------------------------------------------------------------------

-- Bảng lộ trình phát triển nghề nghiệp do AI sinh ra
DROP TABLE IF EXISTS `career_roadmaps`;
CREATE TABLE `career_roadmaps` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `candidate_profile_id` BIGINT UNSIGNED NOT NULL,
    `target_role_title` VARCHAR(150) NOT NULL COMMENT 'Vị trí nghề nghiệp mục tiêu',
    `target_job_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Tin tuyển dụng mục tiêu (nếu có)',
    `summary` TEXT DEFAULT NULL COMMENT 'Tóm tắt chiến lược học tập',
    `total_weeks` TINYINT UNSIGNED NOT NULL DEFAULT 8 COMMENT 'Thời lượng dự kiến (tuần)',
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_roadmap_uuid` (`uuid`),
    KEY `idx_roadmap_cand` (`candidate_profile_id`, `status`),
    CONSTRAINT `fk_roadmap_cand` FOREIGN KEY (`candidate_profile_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_roadmap_job` FOREIGN KEY (`target_job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lộ trình học tập định hướng nghề nghiệp';

-- Bảng các giai đoạn trong lộ trình (Milestones)
DROP TABLE IF EXISTS `roadmap_milestones`;
CREATE TABLE `roadmap_milestones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `roadmap_id` BIGINT UNSIGNED NOT NULL,
    `stage_order` TINYINT UNSIGNED NOT NULL COMMENT 'Thứ tự giai đoạn (1, 2, 3...)',
    `title` VARCHAR(150) NOT NULL COMMENT 'Tên giai đoạn (ví dụ: Nền tảng Docker & CI/CD)',
    `description` TEXT DEFAULT NULL,
    `duration_weeks` TINYINT UNSIGNED NOT NULL DEFAULT 2,
    PRIMARY KEY (`id`),
    KEY `idx_milestone_roadmap` (`roadmap_id`, `stage_order`),
    CONSTRAINT `fk_milestone_roadmap` FOREIGN KEY (`roadmap_id`) REFERENCES `career_roadmaps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Các mốc giai đoạn trong lộ trình';

-- Bảng các nhiệm vụ / khóa học / bài tập cụ thể
DROP TABLE IF EXISTS `roadmap_tasks`;
CREATE TABLE `roadmap_tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `milestone_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(200) NOT NULL COMMENT 'Nhiệm vụ học tập (ví dụ: Đọc docs Dockerfile, làm đồ án mini)',
    `description` TEXT DEFAULT NULL,
    `skill_id` BIGINT UNSIGNED DEFAULT NULL,
    `recommended_resource_url` VARCHAR(500) DEFAULT NULL COMMENT 'Link khóa học / bài hướng dẫn',
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `completed_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_task_milestone` (`milestone_id`),
    KEY `idx_task_skill` (`skill_id`),
    CONSTRAINT `fk_task_milestone` FOREIGN KEY (`milestone_id`) REFERENCES `roadmap_milestones` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_task_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Các đầu việc học tập chi tiết trong mốc lộ trình';

-- ------------------------------------------------------------------------------
-- 10. PHÂN HỆ: QUẢN LÝ PHỎNG VẤN & TIÊU CHÍ RUBRICS (INTERVIEWS & EVALUATION)
-- ------------------------------------------------------------------------------

-- Bảng lịch phỏng vấn
DROP TABLE IF EXISTS `interviews`;
CREATE TABLE `interviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `round_number` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Vòng phỏng vấn (1, 2,...)',
    `scheduled_start` DATETIME NOT NULL COMMENT 'Bắt đầu',
    `scheduled_end` DATETIME NOT NULL COMMENT 'Kết thúc',
    `interview_format` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'ONLINE',
    `meeting_link_or_room` VARCHAR(500) DEFAULT NULL COMMENT 'Google Meet / Zoom link hoặc phòng họp',
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    `notes_to_candidate` TEXT DEFAULT NULL COMMENT 'Ghi chú gửi ứng viên trong thư mời',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_interviews_uuid` (`uuid`),
    KEY `idx_interviews_app` (`application_id`),
    KEY `idx_interviews_schedule` (`status`, `scheduled_start`),
    CONSTRAINT `fk_interviews_app` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch phỏng vấn ứng viên';

-- Bảng phiếu chấm điểm phỏng vấn theo chuẩn Rubrics
DROP TABLE IF EXISTS `interview_evaluations`;
CREATE TABLE `interview_evaluations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `interview_id` BIGINT UNSIGNED NOT NULL,
    `interviewer_user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Người chấm (Kỹ sư / Hiring Manager)',
    `technical_score` TINYINT UNSIGNED NOT NULL COMMENT 'Điểm chuyên môn kỹ thuật (1-5)',
    `communication_score` TINYINT UNSIGNED NOT NULL COMMENT 'Điểm giao tiếp, trình bày (1-5)',
    `problem_solving_score` TINYINT UNSIGNED NOT NULL COMMENT 'Điểm tư duy giải quyết vấn đề (1-5)',
    `culture_fit_score` TINYINT UNSIGNED NOT NULL COMMENT 'Điểm phù hợp văn hóa (1-5)',
    `recommendation` ENUM('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE') NOT NULL DEFAULT 'NEUTRAL',
    `feedback_notes` TEXT DEFAULT NULL COMMENT 'Nhận xét chi tiết',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_interview_evaluator` (`interview_id`, `interviewer_user_id`),
    KEY `idx_eval_interviewer` (`interviewer_user_id`),
    CONSTRAINT `fk_eval_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_eval_user` FOREIGN KEY (`interviewer_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phiếu đánh giá phỏng vấn theo Rubrics';

-- ------------------------------------------------------------------------------
-- 11. PHÂN HỆ: TRỢ LÝ NGHỀ NGHIỆP AI (AI CAREER ASSISTANT SESSIONS)
-- ------------------------------------------------------------------------------

-- Bảng phiên hội thoại cùng AI
DROP TABLE IF EXISTS `ai_chat_sessions`;
CREATE TABLE `ai_chat_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(200) NOT NULL DEFAULT 'Phiên tư vấn mới',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_chat_session_uuid` (`uuid`),
    KEY `idx_chat_session_user` (`user_id`, `created_at` DESC),
    CONSTRAINT `fk_chat_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phiên hội thoại với Trợ lý AI';

-- Bảng tin nhắn trong phiên chat
DROP TABLE IF EXISTS `ai_chat_messages`;
CREATE TABLE `ai_chat_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `session_id` BIGINT UNSIGNED NOT NULL,
    `sender_type` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` LONGTEXT NOT NULL,
    `meta_info` JSON DEFAULT NULL COMMENT 'Lưu trữ model name, tokens consumed, context used',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_chat_msg_session` (`session_id`, `created_at`),
    CONSTRAINT `fk_chat_msg_session` FOREIGN KEY (`session_id`) REFERENCES `ai_chat_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chi tiết tin nhắn hội thoại AI';

-- ------------------------------------------------------------------------------
-- 12. PHÂN HỆ: THÔNG BÁO & NHẬT KÝ KIỂM TOÁN (NOTIFICATIONS & AUDIT)
-- ------------------------------------------------------------------------------

-- Bảng thông báo thời gian thực in-app
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT 'Loại: JOB_MATCH, INTERVIEW_INVITE, APPLICATION_STATUS...',
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `reference_type` VARCHAR(50) DEFAULT NULL COMMENT 'Bảng liên quan (job_applications, jobs)',
    `reference_id` BIGINT UNSIGNED DEFAULT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` DATETIME(3) DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_user_unread_notif` (`user_id`, `is_read`, `created_at` DESC),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông báo in-app cho người dùng';

-- Bảng nhật ký kiểm toán hệ thống (Audit Logs - Bất biến)
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'NULL nếu do hệ thống chạy ngầm',
    `action` VARCHAR(100) NOT NULL COMMENT 'Mã hành động: STAGE_CHANGE, CV_DELETE, MATCH_RUN...',
    `entity_name` VARCHAR(100) NOT NULL COMMENT 'Bảng bị ảnh hưởng',
    `entity_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID bản ghi',
    `old_values` JSON DEFAULT NULL COMMENT 'Dữ liệu trước khi sửa',
    `new_values` JSON DEFAULT NULL COMMENT 'Dữ liệu sau khi sửa',
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `correlation_id` VARCHAR(64) DEFAULT NULL COMMENT 'Mã trace xuyên suốt',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_audit_entity` (`entity_name`, `entity_id`),
    KEY `idx_audit_user` (`user_id`, `created_at` DESC),
    KEY `idx_audit_correlation` (`correlation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Nhật ký kiểm toán hệ thống bất biến';

-- ------------------------------------------------------------------------------
-- 13. DỮ LIỆU BAN ĐẦU (SEED DATA: ROLES, PERMISSIONS, SKILLS TAXONOMY)
-- ------------------------------------------------------------------------------

-- Seed Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'ROLE_CANDIDATE', 'Ứng viên tìm kiếm việc làm và định hướng nghề nghiệp'),
(2, 'ROLE_RECRUITER', 'Chuyên viên tuyển dụng của doanh nghiệp'),
(3, 'ROLE_HIRING_MANAGER', 'Trưởng bộ phận chuyên môn tham gia phỏng vấn'),
(4, 'ROLE_ADMIN', 'Quản trị viên toàn hệ thống');

-- Seed Core Skills Taxonomy (Mẫu danh mục công nghệ chuẩn hóa)
INSERT INTO `skills` (`name`, `slug`, `category`, `description`) VALUES
-- Ngôn ngữ lập trình
('C#', 'c-sharp', 'PROGRAMMING_LANGUAGE', 'Ngôn ngữ lập trình hướng đối tượng của Microsoft'),
('Java', 'java', 'PROGRAMMING_LANGUAGE', 'Ngôn ngữ lập trình hướng đối tượng phổ biến nền tảng JVM'),
('Python', 'python', 'PROGRAMMING_LANGUAGE', 'Ngôn ngữ lập trình đa năng cho AI và Backend'),
('TypeScript', 'typescript', 'PROGRAMMING_LANGUAGE', 'Superset của JavaScript có kiểu dữ liệu tĩnh mạnh'),
('JavaScript', 'javascript', 'PROGRAMMING_LANGUAGE', 'Ngôn ngữ kịch bản cho web frontend và Node.js'),
('Go', 'golang', 'PROGRAMMING_LANGUAGE', 'Ngôn ngữ lập trình hiệu năng cao của Google'),
-- Frameworks & Libraries
('.NET Core', 'dotnet-core', 'FRAMEWORK', 'Framework cross-platform mã nguồn mở của Microsoft'),
('ASP.NET Core', 'asp-net-core', 'FRAMEWORK', 'Web framework xây dựng REST API và Web Apps hiện đại'),
('Spring Boot', 'spring-boot', 'FRAMEWORK', 'Framework nền tảng Java phổ biến cho Backend Enterprise'),
('React', 'react', 'FRAMEWORK', 'Thư viện JavaScript xây dựng giao diện người dùng'),
('Next.js', 'nextjs', 'FRAMEWORK', 'Framework React hỗ trợ SSR và full-stack'),
('Vue.js', 'vuejs', 'FRAMEWORK', 'Framework JavaScript tiến bộ cho UI'),
('FastAPI', 'fastapi', 'FRAMEWORK', 'Web framework Python hiện đại, hiệu năng cao cho AI APIs'),
-- Cơ sở dữ liệu
('MySQL', 'mysql', 'DATABASE', 'Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở'),
('PostgreSQL', 'postgresql', 'DATABASE', 'Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ'),
('SQL Server', 'sql-server', 'DATABASE', 'Hệ quản trị cơ sở dữ liệu quan hệ của Microsoft'),
('Redis', 'redis', 'DATABASE', 'Hệ thống lưu trữ in-memory cache và message broker tốc độ cao'),
('MongoDB', 'mongodb', 'DATABASE', 'Hệ cơ sở dữ liệu NoSQL hướng tài liệu'),
-- Cloud & DevOps
('Docker', 'docker', 'CLOUD_DEVOPS', 'Nền tảng đóng gói ứng dụng trong container'),
('Kubernetes', 'kubernetes', 'CLOUD_DEVOPS', 'Hệ thống điều phối và quản trị container tự động'),
('CI/CD', 'ci-cd', 'CLOUD_DEVOPS', 'Tích hợp liên tục và triển khai phần mềm liên tục'),
('AWS', 'aws', 'CLOUD_DEVOPS', 'Nền tảng điện toán đám mây Amazon Web Services'),
('Azure', 'azure', 'CLOUD_DEVOPS', 'Nền tảng điện toán đám mây Microsoft Azure'),
('Git', 'git', 'METHODOLOGY', 'Hệ thống quản lý phiên bản phân tán');

-- Seed Skill Aliases
INSERT INTO `skill_aliases` (`skill_id`, `alias_name`) VALUES
(1, 'CSharp'), (1, 'C #'), (1, '.NET C#'),
(7, '.NET'), (7, 'Dotnet'), (7, 'Dotnet Core'),
(8, 'ASP.NET'), (8, 'ASP.NET Web API'),
(10, 'ReactJS'), (10, 'React.js'), (10, 'React JS'),
(11, 'Nextjs'), (11, 'Next.JS'),
(14, 'MySQL Database'),
(19, 'Docker Container'), (19, 'Docker Compose');

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- HOÀN TẤT THIẾT LẬP CƠ SỞ DỮ LIỆU MYSQL 8.0 CHUẨN SCALE LỚN
-- ==============================================================================
