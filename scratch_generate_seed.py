import json
import random
from datetime import datetime, timedelta

def generate_seed_sql():
    sql = []
    sql.append("-- ==============================================================================")
    sql.append("-- SEED DATA: PRODUCTION-GRADE COHERENT MOCK DATA FOR AI-TALENTBRIDGE")
    sql.append("-- MỖI BẢNG TỪ 20-50 BẢN GHI (HOẶC PHÙ HỢP VỚI LOẠI BẢNG)")
    sql.append("-- ĐẢM BẢO TÍNH TOÀN VẸN QUAN HỆ KHÓA NGOẠI VÀ CHUẨN GIAO DỊCH ACID")
    sql.append("-- ==============================================================================\n")
    sql.append("SET NAMES utf8mb4;")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql.append("START TRANSACTION;\n")
    sql.append("USE `ai_recruitment_db`;\n")

    # 1. Permissions (30 records)
    sql.append("-- 1. PERMISSIONS (30 records)")
    permissions = [
        ("job:create", "JOB", "Tạo tin tuyển dụng mới"),
        ("job:edit", "JOB", "Chỉnh sửa tin tuyển dụng"),
        ("job:delete", "JOB", "Xóa tin tuyển dụng"),
        ("job:publish", "JOB", "Xuất bản tin tuyển dụng công khai"),
        ("job:close", "JOB", "Đóng tin tuyển dụng"),
        ("job:view_all", "JOB", "Xem toàn bộ tin tuyển dụng công ty"),
        ("cv:upload", "CV", "Tải lên CV cá nhân"),
        ("cv:delete", "CV", "Xóa CV"),
        ("cv:parse_ai", "CV", "Kích hoạt bóc tách CV bằng AI"),
        ("cv:view_pii", "CV", "Xem thông tin định danh cá nhân trong CV"),
        ("ats:view_pipeline", "ATS", "Xem bảng Kanban tuyển dụng"),
        ("ats:move_stage", "ATS", "Chuyển trạng thái ứng viên trên Kanban"),
        ("ats:add_note", "ATS", "Thêm ghi chú nội bộ về ứng viên"),
        ("ats:reject", "ATS", "Từ chối ứng viên"),
        ("ats:offer", "ATS", "Gửi đề nghị việc làm"),
        ("interview:schedule", "INTERVIEW", "Lên lịch phỏng vấn"),
        ("interview:reschedule", "INTERVIEW", "Dời lịch phỏng vấn"),
        ("interview:cancel", "INTERVIEW", "Hủy lịch phỏng vấn"),
        ("interview:evaluate", "INTERVIEW", "Chấm điểm phỏng vấn theo Rubrics"),
        ("matching:calculate", "AI_MATCHING", "Tính toán điểm phù hợp CV-JD"),
        ("matching:view_breakdown", "AI_MATCHING", "Xem giải thích chi tiết điểm số"),
        ("roadmap:generate", "CAREER_AI", "Sinh lộ trình học tập bằng AI"),
        ("roadmap:track", "CAREER_AI", "Cập nhật tiến độ hoàn thành lộ trình"),
        ("chat:send_message", "CAREER_AI", "Gửi câu hỏi cho AI Career Assistant"),
        ("company:manage_profile", "COMPANY", "Quản lý thông tin doanh nghiệp"),
        ("company:manage_members", "COMPANY", "Quản lý thành viên nhân sự"),
        ("admin:verify_company", "ADMIN", "Phê duyệt hồ sơ doanh nghiệp"),
        ("admin:manage_skills", "ADMIN", "Thêm/sửa từ điển kỹ năng"),
        ("admin:view_audit_logs", "ADMIN", "Xem nhật ký kiểm toán hệ thống"),
        ("admin:view_metrics", "ADMIN", "Xem biểu đồ tải và token AI")
    ]
    perm_vals = []
    for i, (code, mod, desc) in enumerate(permissions, 1):
        perm_vals.append(f"({i}, '{code}', '{mod}', '{desc}')")
    sql.append(f"INSERT INTO `permissions` (`id`, `code`, `module_name`, `description`) VALUES\n" + ",\n".join(perm_vals) + ";\n")

    # 2. Role Permissions (45 records)
    sql.append("-- 2. ROLE PERMISSIONS (~45 records)")
    # Role 1: Candidate (cv:upload, cv:delete, cv:parse_ai, roadmap:generate, roadmap:track, chat:send_message)
    # Role 2: Recruiter (job:*, ats:*, interview:*, matching:*, company:manage_profile)
    # Role 3: Hiring Manager (ats:view_pipeline, ats:add_note, interview:*, matching:view_breakdown)
    # Role 4: Admin (all admin:*, plus view)
    role_perms = []
    # Candidate perms
    for pid in [7, 8, 9, 20, 21, 22, 23, 24]:
        role_perms.append(f"(1, {pid})")
    # Recruiter perms
    for pid in [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25]:
        role_perms.append(f"(2, {pid})")
    # Hiring Manager perms
    for pid in [6, 10, 11, 13, 16, 19, 21]:
        role_perms.append(f"(3, {pid})")
    # Admin perms
    for pid in range(1, 31):
        role_perms.append(f"(4, {pid})")
    sql.append("INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES\n" + ",\n".join(role_perms) + ";\n")

    # 3. Users (35 users: 1 Admin, 10 Recruiters, 24 Candidates)
    sql.append("-- 3. USERS (35 records)")
    # Password hash for '123456': $2a$12$Nq/t4qIqU3iWJ1x2g4vHae3dG9XyvO... (standard mock bcrypt)
    mock_hash = "$2a$12$e8M9KzD4s.z6F3xG2vBaeOJnB9q8cI7P4.H2E3yA5R7t8Y9u0I1O2"
    users_data = [
        (1, "admin@talentbridge.vn", "Nguyễn Quản Trị", "0901234567", "https://i.pravatar.cc/150?u=admin", "ACTIVE", 1),
        # Recruiters (2 - 11)
        (2, "recruiter.fpt@fpt.com", "Lê Thu Hà", "0912345678", "https://i.pravatar.cc/150?u=ha_fpt", "ACTIVE", 1),
        (3, "recruiter.vng@vng.com.vn", "Trần Minh Quân", "0923456789", "https://i.pravatar.cc/150?u=quan_vng", "ACTIVE", 1),
        (4, "hr.viettel@viettel.com.vn", "Phạm Hải Yến", "0934567890", "https://i.pravatar.cc/150?u=yen_viettel", "ACTIVE", 1),
        (5, "talent.onemount@onemount.com", "Vũ Hoàng Long", "0945678901", "https://i.pravatar.cc/150?u=long_om", "ACTIVE", 1),
        (6, "careers.momo@mservice.com.vn", "Đỗ Quỳnh Anh", "0956789012", "https://i.pravatar.cc/150?u=anh_momo", "ACTIVE", 1),
        (7, "recruiter.nab@nab.com.au", "Nguyễn Tuấn Kiệt", "0967890123", "https://i.pravatar.cc/150?u=kiet_nab", "ACTIVE", 1),
        (8, "jobs.tiki@tiki.vn", "Hoàng Bích Ngọc", "0978901234", "https://i.pravatar.cc/150?u=ngoc_tiki", "ACTIVE", 1),
        (9, "recruiter.kms@kms-technology.com", "Đặng Quốc Bảo", "0989012345", "https://i.pravatar.cc/150?u=bao_kms", "ACTIVE", 1),
        (10, "hr.nashtech@nashtechglobal.com", "Bùi Thanh Thảo", "0990123456", "https://i.pravatar.cc/150?u=thao_nash", "ACTIVE", 1),
        (11, "talent.axon@axon.com", "Ngô Thành Đạt", "0911223344", "https://i.pravatar.cc/150?u=dat_axon", "ACTIVE", 1),
        # Candidates (12 - 35)
        (12, "nguyenvanan.it@gmail.com", "Nguyễn Văn An", "0981112233", "https://i.pravatar.cc/150?u=an_nguyen", "ACTIVE", 1),
        (13, "tranthibich.dev@gmail.com", "Trần Thị Bích", "0982223344", "https://i.pravatar.cc/150?u=bich_tran", "ACTIVE", 1),
        (14, "lehoangnam.cs@gmail.com", "Lê Hoàng Nam", "0983334455", "https://i.pravatar.cc/150?u=nam_le", "ACTIVE", 1),
        (15, "phamminhduc.net@gmail.com", "Phạm Minh Đức", "0984445566", "https://i.pravatar.cc/150?u=duc_pham", "ACTIVE", 1),
        (16, "vuthimai.frontend@gmail.com", "Vũ Thị Mai", "0985556677", "https://i.pravatar.cc/150?u=mai_vu", "ACTIVE", 1),
        (17, "dangquanghuy.backend@gmail.com", "Đặng Quang Huy", "0986667788", "https://i.pravatar.cc/150?u=huy_dang", "ACTIVE", 1),
        (18, "buiducthang.fullstack@gmail.com", "Bùi Đức Thắng", "0987778899", "https://i.pravatar.cc/150?u=thang_bui", "ACTIVE", 1),
        (19, "ngophuonglinh.ai@gmail.com", "Ngô Phương Linh", "0988889900", "https://i.pravatar.cc/150?u=linh_ngo", "ACTIVE", 1),
        (20, "hoangvanthai.devops@gmail.com", "Hoàng Văn Thái", "0989990011", "https://i.pravatar.cc/150?u=thai_hoang", "ACTIVE", 1),
        (21, "duongthuytrang.tester@gmail.com", "Dương Thùy Trang", "0971112233", "https://i.pravatar.cc/150?u=trang_duong", "ACTIVE", 1),
        (22, "lyminhtri.mobile@gmail.com", "Lý Minh Trí", "0972223344", "https://i.pravatar.cc/150?u=tri_ly", "ACTIVE", 1),
        (23, "dothanhtung.cloud@gmail.com", "Đỗ Thanh Tùng", "0973334455", "https://i.pravatar.cc/150?u=tung_do", "ACTIVE", 1),
        (24, "nguyenthihue.qa@gmail.com", "Nguyễn Thị Huệ", "0974445566", "https://i.pravatar.cc/150?u=hue_nguyen", "ACTIVE", 1),
        (25, "tranducanh.data@gmail.com", "Trần Đức Anh", "0975556677", "https://i.pravatar.cc/150?u=anh_tran", "ACTIVE", 1),
        (26, "phanthanhson.java@gmail.com", "Phan Thanh Sơn", "0976667788", "https://i.pravatar.cc/150?u=son_phan", "ACTIVE", 1),
        (27, "vutrungkien.golang@gmail.com", "Vũ Trung Kiên", "0977778899", "https://i.pravatar.cc/150?u=kien_vu", "ACTIVE", 1),
        (28, "lehongnhung.uiux@gmail.com", "Lê Hồng Nhung", "0978889900", "https://i.pravatar.cc/150?u=nhung_le", "ACTIVE", 1),
        (29, "caotuananh.react@gmail.com", "Cao Tuấn Anh", "0979990011", "https://i.pravatar.cc/150?u=anh_cao", "ACTIVE", 1),
        (30, "dinhvanloc.spring@gmail.com", "Đinh Văn Lộc", "0961112233", "https://i.pravatar.cc/150?u=loc_dinh", "ACTIVE", 1),
        (31, "nguyenhoangnam.node@gmail.com", "Nguyễn Hoàng Nam", "0962223344", "https://i.pravatar.cc/150?u=nam_nguyen", "ACTIVE", 1),
        (32, "tranquockhanh.net@gmail.com", "Trần Quốc Khánh", "0963334455", "https://i.pravatar.cc/150?u=khanh_tran", "ACTIVE", 1),
        (33, "phamthanhnga.intern@gmail.com", "Phạm Thanh Nga", "0964445566", "https://i.pravatar.cc/150?u=nga_pham", "ACTIVE", 1),
        (34, "leminhquan.fresher@gmail.com", "Lê Minh Quân", "0965556677", "https://i.pravatar.cc/150?u=quan_le", "ACTIVE", 1),
        (35, "vuhoanggiang.fresher@gmail.com", "Vũ Hoàng Giang", "0966667788", "https://i.pravatar.cc/150?u=giang_vu", "ACTIVE", 1)
    ]
    u_vals = []
    for uid, email, name, phone, avt, status, verified in users_data:
        u_vals.append(f"({uid}, UUID(), '{email}', '{mock_hash}', '{name}', '{phone}', '{avt}', '{status}', {verified}, NOW() - INTERVAL {random.randint(10, 60)} DAY, NOW())")
    sql.append("INSERT INTO `users` (`id`, `uuid`, `email`, `password_hash`, `full_name`, `phone`, `avatar_url`, `status`, `is_email_verified`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(u_vals) + ";\n")

    # 4. User Roles (35 records)
    sql.append("-- 4. USER ROLES (35 records)")
    ur_vals = ["(1, 4)"] # Admin
    for uid in range(2, 12):
        ur_vals.append(f"({uid}, 2)") # Recruiters
    for uid in range(12, 36):
        ur_vals.append(f"({uid}, 1)") # Candidates
    sql.append("INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES\n" + ",\n".join(ur_vals) + ";\n")

    # 5. User Tokens (25 active sessions)
    sql.append("-- 5. USER TOKENS (25 records)")
    ut_vals = []
    for i, uid in enumerate(range(1, 26), 1):
        ut_vals.append(f"({i}, {uid}, SHA2(CONCAT('refresh_token_secret_', {uid}), 256), 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '127.0.0.1', NOW() + INTERVAL 7 DAY, 0, NOW())")
    sql.append("INSERT INTO `user_tokens` (`id`, `user_id`, `token_hash`, `device_info`, `ip_address`, `expires_at`, `is_revoked`, `created_at`) VALUES\n" + ",\n".join(ut_vals) + ";\n")

    # 6. Companies (10 Tech Companies in Vietnam)
    sql.append("-- 6. COMPANIES (10 records)")
    companies = [
        (1, "FPT Software", "fpt-software", "https://logo.clearbit.com/fpt-software.com", "https://fptsoftware.com", "Công nghệ phần mềm", "500+", "0101778161", "Tập đoàn công nghệ hàng đầu Việt Nam cung cấp giải pháp chuyển đổi số toàn cầu.", "Tòa nhà FPT Cầu Giấy, Duy Tân", "Hà Nội", "VERIFIED"),
        (2, "VNG Corporation", "vng-corporation", "https://logo.clearbit.com/vng.com.vn", "https://vng.com.vn", "Internet & Game", "500+", "0303539824", "Kỳ lân công nghệ đầu tiên của Việt Nam với các sản phẩm Zalo, ZaloPay, Zing.", "VNG Campus, Quận 7", "TP. Hồ Chí Minh", "VERIFIED"),
        (3, "Viettel Solutions", "viettel-solutions", "https://logo.clearbit.com/viettel.com.vn", "https://viettelsolutions.vn", "Viễn thông & CNTT", "500+", "0100109106", "Tổng công ty giải pháp doanh nghiệp trực thuộc Tập đoàn Viettel.", "Tòa nhà Viettel, Yên Hòa, Cầu Giấy", "Hà Nội", "VERIFIED"),
        (4, "One Mount Group", "one-mount-group", "https://logo.clearbit.com/onemount.com", "https://onemount.com", "Fintech & E-commerce", "500+", "0108914674", "Xây dựng hệ sinh thái công nghệ số lớn nhất Việt Nam gồm VinShop, VinID, OneHousing.", "Times City, Hai Bà Trưng", "Hà Nội", "VERIFIED"),
        (5, "MoMo (M_Service)", "momo", "https://logo.clearbit.com/momo.vn", "https://momo.vn", "Fintech", "500+", "0305086088", "Ví điện tử và ứng dụng siêu tài chính số 1 Việt Nam với hơn 30 triệu người dùng.", "Phú Mỹ Hưng, Quận 7", "TP. Hồ Chí Minh", "VERIFIED"),
        (6, "NAB Innovation Centre Vietnam", "nab-innovation-centre", "https://logo.clearbit.com/nab.com.au", "https://nab.com.au", "Banking & FinTech", "200-500", "0315998188", "Trung tâm công nghệ cao thuộc National Australia Bank đầu tư tại Việt Nam.", "The Hallmark, Thủ Thiêm", "TP. Hồ Chí Minh", "VERIFIED"),
        (7, "Tiki Corporation", "tiki-corporation", "https://logo.clearbit.com/tiki.vn", "https://tiki.vn", "E-commerce", "500+", "0309532909", "Nền tảng thương mại điện tử uy tín và dịch vụ hậu cần logistics hàng đầu.", "Viettel Complex, Cách Mạng Tháng 8", "TP. Hồ Chí Minh", "VERIFIED"),
        (8, "KMS Technology", "kms-technology", "https://logo.clearbit.com/kms-technology.com", "https://kms-technology.com", "Software Services", "500+", "0309192455", "Công ty dịch vụ phần mềm quốc tế uy tín với các văn phòng tại Mỹ và Việt Nam.", "Tân Bình", "TP. Hồ Chí Minh", "VERIFIED"),
        (9, "NashTech Vietnam", "nashtech-vietnam", "https://logo.clearbit.com/nashtechglobal.com", "https://nashtechglobal.com", "IT Outsourcing", "500+", "0301479836", "Thành viên tập đoàn Harvey Nash chuyên tư vấn công nghệ và phát triển phần mềm.", "E-Town, Tân Bình", "TP. Hồ Chí Minh", "VERIFIED"),
        (10, "Axon Vietnam", "axon-vietnam", "https://logo.clearbit.com/axon.com", "https://axon.com", "Public Safety Tech", "50-200", "0316001234", "Trung tâm R&D phát triển camera an ninh, thiết bị TASER và phần mềm chứng cứ đám mây.", "Quận 1", "TP. Hồ Chí Minh", "VERIFIED")
    ]
    c_vals = []
    for cid, name, slug, logo, web, ind, sz, tax, desc, addr, city, vstatus in companies:
        c_vals.append(f"({cid}, UUID(), '{name}', '{slug}', '{logo}', '{web}', '{ind}', '{sz}', '{tax}', '{desc}', '{addr}', '{city}', '{vstatus}', NOW() - INTERVAL 100 DAY, NOW())")
    sql.append("INSERT INTO `companies` (`id`, `uuid`, `name`, `slug`, `logo_url`, `website`, `industry`, `company_size`, `tax_code`, `description`, `address`, `city`, `verification_status`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(c_vals) + ";\n")

    # 7. Recruiter Profiles (10 records)
    sql.append("-- 7. RECRUITER PROFILES (10 records)")
    recruiter_titles = [
        (1, 2, 1, "Talent Acquisition Lead", 1),
        (2, 3, 2, "Senior Tech Recruiter", 1),
        (3, 4, 3, "HR Business Partner", 1),
        (4, 5, 4, "Head of Talent Acquisition", 1),
        (5, 6, 5, "Technical Recruiter", 0),
        (6, 7, 6, "Senior Talent Partner", 1),
        (7, 8, 7, "Talent Acquisition Specialist", 0),
        (8, 9, 8, "Recruitment Lead", 1),
        (9, 10, 9, "Senior HR Specialist", 0),
        (10, 11, 10, "Lead Technical Recruiter", 1)
    ]
    rp_vals = []
    for rpid, uid, cid, title, is_adm in recruiter_titles:
        rp_vals.append(f"({rpid}, {uid}, {cid}, '{title}', {is_adm}, NOW() - INTERVAL 90 DAY, NOW())")
    sql.append("INSERT INTO `recruiter_profiles` (`id`, `user_id`, `company_id`, `job_title`, `is_company_admin`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(rp_vals) + ";\n")

    # 8. Extra Skills (Expand to 40 skills)
    sql.append("-- 8. EXPAND SKILLS TAXONOMY (Adding skills 25 - 40)")
    extra_skills = [
        (25, "Node.js", "nodejs", "FRAMEWORK", "Môi trường runtime JavaScript phía máy chủ"),
        (26, "Angular", "angular", "FRAMEWORK", "Framework TypeScript xây dựng Single Page Applications"),
        (27, "Django", "django", "FRAMEWORK", "Web framework cấp cao của Python"),
        (28, "GraphQL", "graphql", "OTHER", "Ngôn ngữ truy vấn cho API linh hoạt"),
        (29, "Kafka", "kafka", "CLOUD_DEVOPS", "Nền tảng phân tán streaming sự kiện hiệu năng cao"),
        (30, "Elasticsearch", "elasticsearch", "DATABASE", "Công cụ tìm kiếm và phân tích phân tán tốc độ cao"),
        (31, "RabbitMQ", "rabbitmq", "CLOUD_DEVOPS", "Hệ thống Message Broker mã nguồn mở phổ biến"),
        (32, "Linux", "linux", "CLOUD_DEVOPS", "Hệ điều hành mã nguồn mở tiêu chuẩn cho máy chủ"),
        (33, "Unit Testing", "unit-testing", "TESTING", "Kiểm thử cấp độ đơn vị bảo đảm chất lượng code"),
        (34, "Selenium", "selenium", "TESTING", "Bộ công cụ tự động hóa kiểm thử trình duyệt"),
        (35, "Agile/Scrum", "agile-scrum", "METHODOLOGY", "Mô hình và phương pháp phát triển phần mềm linh hoạt"),
        (36, "Problem Solving", "problem-solving", "SOFT_SKILL", "Kỹ năng phân tích và giải quyết vấn đề kỹ thuật"),
        (37, "Teamwork", "teamwork", "SOFT_SKILL", "Kỹ năng làm việc nhóm và phối hợp đa phòng ban"),
        (38, "Communication", "communication", "SOFT_SKILL", "Kỹ năng giao tiếp và truyền đạt ý tưởng"),
        (39, "English Professional", "english-professional", "SOFT_SKILL", "Tiếng Anh chuyên ngành và giao tiếp công sở"),
        (40, "Clean Architecture", "clean-architecture", "METHODOLOGY", "Kiến trúc phần mềm phân tầng tách biệt nghiệp vụ")
    ]
    es_vals = []
    for sid, sname, sslug, scat, sdesc in extra_skills:
        es_vals.append(f"({sid}, '{sname}', '{sslug}', '{scat}', '{sdesc}', 1, NOW())")
    sql.append("INSERT INTO `skills` (`id`, `name`, `slug`, `category`, `description`, `is_active`, `created_at`) VALUES\n" + ",\n".join(es_vals) + " ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);\n")

    # 9. Candidate Profiles (24 records for users 12 - 35)
    sql.append("-- 9. CANDIDATE PROFILES (24 records)")
    candidate_profiles_data = [
        (1, 12, "Fresher .NET Core Backend Developer", "Sinh viên năm cuối ngành Kỹ thuật Phần mềm, đam mê lập trình Backend C#/.NET, mong muốn học hỏi Docker và Microservices.", "Hà Nội", 8000000, 12000000),
        (2, 13, "Junior React / Frontend Engineer", "2 năm kinh nghiệm phát triển SPA bằng React, TypeScript, Redux Toolkit và Tailwind CSS.", "TP. Hồ Chí Minh", 15000000, 22000000),
        (3, 14, "Java Spring Boot Backend Developer", "Tốt nghiệp ĐH Bách Khoa, có kinh nghiệm làm đồ án thực tế với Spring Boot, PostgreSQL và Redis.", "Hà Nội", 10000000, 16000000),
        (4, 15, "Junior Full-Stack .NET & React", "Khả năng phát triển end-to-end ứng dụng web bằng C# Web API và ReactJS. Chăm chỉ và cầu tiến.", "Đà Nẵng", 12000000, 18000000),
        (5, 16, "Frontend Web Developer (Vue.js / Nuxt)", "Yêu thích xây dựng giao diện người dùng mượt mà, tối ưu hiệu năng và chuẩn SEO.", "TP. Hồ Chí Minh", 12000000, 18000000),
        (6, 17, "Golang Backend Developer Intern", "Yêu thích kiến trúc hệ thống chịu tải cao, concurrency trong Go và hệ sinh thái gRPC.", "Hà Nội", 5000000, 9000000),
        (7, 18, "Full-Stack Developer (Node.js & Next.js)", "Có 1.5 năm kinh nghiệm làm việc với hệ sinh thái JavaScript, RESTful APIs và Docker.", "TP. Hồ Chí Minh", 16000000, 24000000),
        (8, 19, "AI / Machine Learning Engineer Fresher", "Tốt nghiệp ngành Trí tuệ Nhân tạo, có kinh nghiệm làm việc với Python, PyTorch và LLM APIs.", "Hà Nội", 12000000, 18000000),
        (9, 20, "DevOps / Cloud Junior Engineer", "Có chứng chỉ AWS Certified Solutions Architect, thành thạo Docker, CI/CD GitHub Actions.", "Đà Nẵng", 14000000, 20000000),
        (10, 21, "Software QA / QC Engineer", "Kinh nghiệm viết test case, kiểm thử chức năng và tự động hóa API bằng Postman.", "Hà Nội", 10000000, 15000000),
        (11, 22, "Mobile Flutter / Dart Developer", "Phát triển ứng dụng di động đa nền tảng Flutter, tích hợp Firebase và REST APIs.", "TP. Hồ Chí Minh", 12000000, 18000000),
        (12, 23, "Cloud Engineer (Azure & .NET)", "Định hướng phát triển giải pháp đám mây Microsoft Azure, kiến trúc serverless.", "Hà Nội", 15000000, 22000000),
        (13, 24, "Automation Test Engineer", "Thành thạo Selenium WebDriver với Java, Cypress và kiểm thử hiệu năng với JMeter.", "TP. Hồ Chí Minh", 14000000, 20000000),
        (14, 25, "Data Analyst / Python Developer", "Có khả năng trực quan hóa dữ liệu bằng PowerBI, phân tích dữ liệu với Pandas, SQL nâng cao.", "Hà Nội", 12000000, 17000000),
        (15, 26, "Middle Java Backend Engineer", "3 năm kinh nghiệm phát triển microservices bằng Java Spring Boot, Kafka và MySQL.", "TP. Hồ Chí Minh", 25000000, 35000000),
        (16, 27, "Backend Golang Engineer", "2 năm làm việc với Go, Redis caching, thiết kế database tối ưu hàng triệu bản ghi.", "Hà Nội", 20000000, 30000000),
        (17, 28, "UI/UX Designer & Product Thinker", "Thiết kế wireframe, prototype trên Figma, am hiểu nguyên lý thiết kế trải nghiệm người dùng.", "TP. Hồ Chí Minh", 14000000, 20000000),
        (18, 29, "Frontend Developer (Next.js / Tailwind)", "Chuyên gia xây dựng Web Apps tốc độ cao, responsive và ứng dụng Design System.", "Hà Nội", 16000000, 22000000),
        (19, 30, "Junior Java Developer", "Nắm chắc kiến thức lập trình OOP, cấu trúc dữ liệu, SQL và Hibernate/JPA.", "Đà Nẵng", 9000000, 14000000),
        (20, 31, "Node.js / Express Backend Developer", "Thiết kế RESTful APIs, xác thực JWT, tương tác MongoDB và PostgreSQL.", "TP. Hồ Chí Minh", 13000000, 18000000),
        (21, 32, ".NET Core Web API Developer", "1 năm kinh nghiệm làm việc với C#, ASP.NET Core, EF Core và SQL Server.", "Hà Nội", 12000000, 17000000),
        (22, 33, "Intern Frontend Web Developer", "Sinh viên năm 3, nắm vững HTML, CSS, JavaScript ES6 và ReactJS căn bản.", "Hà Nội", 3000000, 6000000),
        (23, 34, "Fresher Backend Developer", "Tìm kiếm vị trí Fresher Backend, ham học hỏi các công nghệ mới và kiến trúc sạch.", "TP. Hồ Chí Minh", 7000000, 11000000),
        (24, 35, "Fresher Full-Stack Developer", "Sinh viên xuất sắc vừa tốt nghiệp, có đồ án capstone đạt giải nhì trường.", "Đà Nẵng", 8000000, 13000000)
    ]
    cp_vals = []
    for cpid, uid, hl, bio, city, smin, smax in candidate_profiles_data:
        cp_vals.append(f"({cpid}, UUID(), {uid}, '{hl}', '{bio}', '{city}', 'Vietnam', 'https://linkedin.com/in/candidate{cpid}', 'https://github.com/candidate{cpid}', 'https://candidate{cpid}.dev', {smin}, {smax}, 'PUBLIC', 1, NOW() - INTERVAL 45 DAY, NOW())")
    sql.append("INSERT INTO `candidate_profiles` (`id`, `uuid`, `user_id`, `headline`, `bio`, `city`, `country`, `linkedin_url`, `github_url`, `portfolio_url`, `expected_salary_min`, `expected_salary_max`, `visibility`, `is_open_to_work`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(cp_vals) + ";\n")

    # 10. Candidate Skills (70 records)
    sql.append("-- 10. CANDIDATE SKILLS (70 records)")
    # Mapping profile_id to skill_ids
    cand_skill_map = [
        (1, [(1, 'INTERMEDIATE', 1), (7, 'INTERMEDIATE', 1), (8, 'INTERMEDIATE', 1), (14, 'INTERMEDIATE', 1), (19, 'BEGINNER', 0), (24, 'INTERMEDIATE', 1)]),
        (2, [(4, 'ADVANCED', 2), (5, 'ADVANCED', 2), (10, 'ADVANCED', 2), (11, 'INTERMEDIATE', 1), (24, 'INTERMEDIATE', 2)]),
        (3, [(2, 'ADVANCED', 2), (9, 'ADVANCED', 2), (15, 'INTERMEDIATE', 1), (17, 'INTERMEDIATE', 1), (24, 'ADVANCED', 2)]),
        (4, [(1, 'INTERMEDIATE', 1), (8, 'INTERMEDIATE', 1), (10, 'INTERMEDIATE', 1), (14, 'INTERMEDIATE', 1)]),
        (5, [(5, 'ADVANCED', 2), (12, 'ADVANCED', 2), (24, 'INTERMEDIATE', 1)]),
        (6, [(6, 'INTERMEDIATE', 1), (14, 'INTERMEDIATE', 1), (19, 'BEGINNER', 0)]),
        (7, [(5, 'ADVANCED', 2), (25, 'ADVANCED', 2), (11, 'INTERMEDIATE', 1), (15, 'INTERMEDIATE', 1), (19, 'INTERMEDIATE', 1)]),
        (8, [(3, 'ADVANCED', 2), (13, 'ADVANCED', 1), (15, 'INTERMEDIATE', 1)]),
        (9, [(19, 'ADVANCED', 2), (20, 'INTERMEDIATE', 1), (21, 'ADVANCED', 2), (22, 'INTERMEDIATE', 1), (32, 'ADVANCED', 2)]),
        (10, [(33, 'ADVANCED', 2), (34, 'INTERMEDIATE', 1), (36, 'ADVANCED', 2)]),
        (11, [(4, 'INTERMEDIATE', 1), (24, 'INTERMEDIATE', 1)]),
        (12, [(1, 'ADVANCED', 2), (8, 'ADVANCED', 2), (23, 'INTERMEDIATE', 1)]),
        (13, [(34, 'ADVANCED', 2), (33, 'ADVANCED', 2), (2, 'INTERMEDIATE', 1)]),
        (14, [(3, 'ADVANCED', 2), (14, 'ADVANCED', 2), (15, 'INTERMEDIATE', 1)]),
        (15, [(2, 'EXPERT', 3), (9, 'EXPERT', 3), (29, 'ADVANCED', 2), (17, 'ADVANCED', 2)]),
        (16, [(6, 'ADVANCED', 2), (17, 'ADVANCED', 2), (19, 'ADVANCED', 2)]),
        (17, [(38, 'EXPERT', 3), (37, 'EXPERT', 3)]),
        (18, [(4, 'ADVANCED', 2), (11, 'ADVANCED', 2), (10, 'ADVANCED', 2)]),
        (19, [(2, 'INTERMEDIATE', 1), (9, 'INTERMEDIATE', 1), (14, 'INTERMEDIATE', 1)]),
        (20, [(5, 'INTERMEDIATE', 1), (25, 'INTERMEDIATE', 1), (18, 'INTERMEDIATE', 1)]),
        (21, [(1, 'INTERMEDIATE', 1), (8, 'INTERMEDIATE', 1), (16, 'INTERMEDIATE', 1)]),
        (22, [(5, 'BEGINNER', 0), (10, 'BEGINNER', 0)]),
        (23, [(1, 'BEGINNER', 0), (14, 'BEGINNER', 0)]),
        (24, [(1, 'INTERMEDIATE', 1), (10, 'INTERMEDIATE', 1), (14, 'INTERMEDIATE', 1)])
    ]
    cs_vals = []
    cs_idx = 1
    for pid, skills_list in cand_skill_map:
        for sid, prof, yrs in skills_list:
            cs_vals.append(f"({cs_idx}, {pid}, {sid}, '{prof}', {yrs}, 1)")
            cs_idx += 1
    sql.append("INSERT INTO `candidate_skills` (`id`, `candidate_profile_id`, `skill_id`, `proficiency`, `years_experience`, `is_verified`) VALUES\n" + ",\n".join(cs_vals) + ";\n")

    # 11. Jobs (25 realistic job postings across 10 companies)
    sql.append("-- 11. JOBS (25 records)")
    jobs_data = [
        (1, 1, 1, "Fresher .NET Backend Developer", "fresher-dotnet-backend-developer-fpt", "Tham gia phát triển dự án chuyển đổi số cho khách hàng Nhật Bản và Mỹ bằng ASP.NET Core.", "Nắm vững C#, OOP, SQL Server hoặc MySQL. Chăm chỉ, tinh thần học hỏi tốt.", "Lương tháng 13, bảo hiểm FPT Care, đào tạo chứng chỉ Microsoft miễn phí.", "FULL_TIME", "FRESHER", 9000000, 14000000, "Hà Nội", "PUBLISHED", 450, 18),
        (2, 1, 1, "Senior .NET Core Microservices Engineer", "senior-dotnet-core-engineer-fpt", "Thiết kế và triển khai kiến trúc Microservices chịu tải cao cho hệ thống ngân hàng số.", "Tối thiểu 4 năm kinh nghiệm .NET Core, Docker, Kubernetes, Kafka hoặc RabbitMQ.", "Mức lương hấp dẫn đến 45 triệu, thưởng hiệu quả kinh doanh.", "FULL_TIME", "SENIOR", 30000000, 45000000, "Hà Nội", "PUBLISHED", 820, 12),
        (3, 2, 2, "Junior Frontend React Developer", "junior-frontend-react-vng", "Phát triển giao diện web cho hệ sinh thái ZaloPay và các cổng thanh toán số.", "Có từ 1-2 năm kinh nghiệm với ReactJS, TypeScript, TailwindCSS và Webpack/Vite.", "Cơm trưa miễn phí tại VNG Campus, phòng Gym hiện đại, bảo hiểm sức khỏe cao cấp.", "FULL_TIME", "JUNIOR", 15000000, 22000000, "TP. Hồ Chí Minh", "PUBLISHED", 950, 24),
        (4, 2, 2, "Backend Golang Engineer", "backend-golang-engineer-vng", "Xây dựng hệ thống chat và streaming dữ liệu thời gian thực hàng triệu CCU.", "Thành thạo Golang, Goroutines, Redis Cache, gRPC và kiến trúc phân tán.", "Thưởng hiệu quả sản phẩm, môi trường công nghệ kỳ lân.", "FULL_TIME", "MIDDLE", 25000000, 38000000, "TP. Hồ Chí Minh", "PUBLISHED", 640, 15),
        (5, 3, 3, "Java Spring Boot Software Engineer", "java-spring-boot-engineer-viettel", "Phát triển các giải pháp chính phủ điện tử và thành phố thông minh cho Viettel Solutions.", "Tốt nghiệp đại học chuyên ngành CNTT, thành thạo Java, Spring Boot, Oracle/PostgreSQL.", "Chế độ đãi ngộ quân đội, du lịch hàng năm, phụ cấp điện thoại.", "FULL_TIME", "MIDDLE", 20000000, 32000000, "Hà Nội", "PUBLISHED", 510, 16),
        (6, 3, 3, "Cloud DevOps Engineer", "cloud-devops-engineer-viettel", "Vận hành hạ tầng Viettel Cloud, tự động hóa CI/CD pipeline và giám sát Kubernetes.", "Kinh nghiệm thực chiến với Kubernetes, Terraform, Docker, Prometheus & Grafana.", "Cơ hội thăng tiến trở thành Tech Lead hạ tầng đám mây.", "FULL_TIME", "MIDDLE", 22000000, 35000000, "Hà Nội", "PUBLISHED", 430, 9),
        (7, 4, 4, "Fresher Data Engineer", "fresher-data-engineer-one-mount", "Xây dựng data pipeline thu thập và xử lý dữ liệu cho VinShop và VinID.", "Thành thạo Python, SQL nâng cao, hiểu biết về Data Warehouse và Spark.", "Làm việc tại Times City, môi trường trẻ trung, định hướng data-driven.", "FULL_TIME", "FRESHER", 10000000, 16000000, "Hà Nội", "PUBLISHED", 600, 22),
        (8, 4, 4, "Senior Full-Stack Developer", "senior-fullstack-developer-one-mount", "Phát triển ứng dụng OneHousing tích hợp hệ thống bản đồ số và bất động sản.", "Thành thạo ReactJS và Node.js/NestJS hoặc Java. Tư duy sản phẩm xuất sắc.", "Mức lương cạnh tranh thị trường, gói ESOP ưu đãi.", "FULL_TIME", "SENIOR", 35000000, 50000000, "Hà Nội", "PUBLISHED", 780, 14),
        (9, 5, 5, "Mobile Developer (Flutter)", "mobile-flutter-developer-momo", "Phát triển các tính năng thanh toán QR, miniapp trên siêu ứng dụng MoMo.", "Kinh nghiệm với Flutter hoặc Native Android/iOS, hiểu biết về Reactive Programming.", "Môi trường Fintech năng động, văn phòng chuẩn quốc tế tại Phú Mỹ Hưng.", "FULL_TIME", "JUNIOR", 16000000, 25000000, "TP. Hồ Chí Minh", "PUBLISHED", 890, 20),
        (10, 5, 5, "Database Administrator (MySQL/Redis)", "dba-mysql-redis-momo", "Tối ưu hóa hiệu năng, bảo trì và đảm bảo tính sẵn sàng 99.99% cho cụm database.", "Ít nhất 3 năm kinh nghiệm DBA MySQL, Sharding, Replication, Performance Tuning.", "Thưởng Tết và quý hấp dẫn, bảo hiểm quốc tế.", "FULL_TIME", "MIDDLE", 25000000, 40000000, "TP. Hồ Chí Minh", "PUBLISHED", 310, 8),
        (11, 6, 6, "Junior Software Engineer (.NET & Cloud)", "junior-software-engineer-nab", "Tham gia dự án hiện đại hóa ngân hàng số cho National Australia Bank.", "Kinh nghiệm 1 năm với C#, REST API, có tư duy Clean Code và Unit Testing.", "100% tiếng Anh, làm việc tại tòa nhà hạng A Thủ Thiêm, laptop Mac M2/M3.", "FULL_TIME", "JUNIOR", 18000000, 28000000, "TP. Hồ Chí Minh", "PUBLISHED", 1120, 35),
        (12, 6, 6, "QA Automation Engineer", "qa-automation-engineer-nab", "Thiết kế automation test framework bằng Cypress hoặc Playwright cho web banking.", "Kinh nghiệm kiểm thử tự động, am hiểu CI/CD và Agile/Scrum.", "Chế độ làm việc linh hoạt Hybrid 2 ngày ở nhà/tuần.", "FULL_TIME", "MIDDLE", 22000000, 32000000, "TP. Hồ Chí Minh", "PUBLISHED", 480, 11),
        (13, 7, 7, "Backend Engineer (Go/Java)", "backend-engineer-tiki", "Phát triển hệ thống kho vận thông minh và xử lý đơn hàng TikiNOW.", "Thành thạo một trong các ngôn ngữ Go, Java, Python. Nắm vững cấu trúc dữ liệu.", "Cơ hội giải quyết bài toán quy mô lớn hàng triệu đơn hàng mỗi ngày.", "FULL_TIME", "MIDDLE", 20000000, 35000000, "TP. Hồ Chí Minh", "PUBLISHED", 720, 19),
        (14, 7, 7, "Frontend Developer (Next.js)", "frontend-developer-nextjs-tiki", "Xây dựng trải nghiệm mua sắm mượt mà trên web Tiki.vn với Server-Side Rendering.", "Thành thạo Next.js, React, Web Vitals và kỹ thuật tối ưu hóa tải trang.", "Giảm giá đặc biệt khi mua hàng trên Tiki, bảo hiểm sức khỏe VIP.", "FULL_TIME", "JUNIOR", 15000000, 22000000, "TP. Hồ Chí Minh", "PUBLISHED", 640, 17),
        (15, 8, 8, "Software Engineer Intern (All Tracks)", "software-engineer-intern-kms", "Chương trình thực tập 3 tháng có lương dành cho sinh viên năm cuối xuất sắc.", "Nền tảng OOP tốt với một trong các ngôn ngữ: Java, C#, JavaScript, Python.", "Phụ cấp thực tập hấp dẫn, cơ hội trở thành nhân viên chính thức sau 3 tháng.", "INTERNSHIP", "INTERN", 4000000, 6000000, "TP. Hồ Chí Minh", "PUBLISHED", 1540, 48),
        (16, 8, 8, "Full-Stack Engineer (React & Java)", "fullstack-engineer-react-java-kms", "Phát triển sản phẩm SaaS cho thị trường Mỹ và Châu Âu.", "Kinh nghiệm cả Frontend React và Backend Spring Boot, làm việc độc lập tốt.", "Môi trường nói tiếng Anh, trợ cấp học tập chứng chỉ AWS.", "FULL_TIME", "MIDDLE", 22000000, 34000000, "TP. Hồ Chí Minh", "PUBLISHED", 560, 13),
        (17, 9, 9, "Senior .NET Developer", "senior-dotnet-developer-nashtech", "Phát triển ứng dụng đám mây trên nền tảng Microsoft Azure cho tập đoàn tài chính Anh.", "Tối thiểu 3 năm kinh nghiệm .NET Core, Azure DevOps, Entity Framework Core.", "Gói bảo hiểm sức khỏe gia đình, thưởng dự án định kỳ.", "FULL_TIME", "SENIOR", 28000000, 42000000, "TP. Hồ Chí Minh", "PUBLISHED", 630, 10),
        (18, 9, 9, "Fresher Java Software Engineer", "fresher-java-software-engineer-nashtech", "Chương trình NashTech Fresher Academy đào tạo nâng cao và phân bổ vào dự án thực tế.", "Tốt nghiệp chuyên ngành CNTT, nắm vững Java Core, SQL và tiếng Anh đọc hiểu.", "Hỗ trợ học phí đào tạo ban đầu, ký hợp đồng chính thức sau khóa học.", "FULL_TIME", "FRESHER", 8500000, 12000000, "TP. Hồ Chí Minh", "PUBLISHED", 890, 26),
        (19, 10, 10, "Software Engineer (AI & Computer Vision)", "software-engineer-ai-axon", "Phát triển thuật toán xử lý video và nhận diện hành vi trên các camera an ninh thông minh.", "Thành thạo Python hoặc C++, am hiểu Deep Learning, OpenCV, Docker.", "Lương bổng theo chuẩn công ty công nghệ Mỹ, chính sách thưởng cổ phiếu.", "FULL_TIME", "MIDDLE", 30000000, 50000000, "TP. Hồ Chí Minh", "PUBLISHED", 710, 14),
        (20, 10, 10, "Cloud Backend Engineer (Go / AWS)", "cloud-backend-engineer-axon", "Xây dựng các microservices đám mây trên AWS lưu trữ hàng petabyte video chứng cứ.", "Thành thạo Golang, AWS (ECS, S3, DynamoDB), Kafka và gRPC.", "Văn phòng chuẩn quốc tế, trang thiết bị tối tân, cơm trưa nhà hàng.", "FULL_TIME", "SENIOR", 35000000, 55000000, "TP. Hồ Chí Minh", "PUBLISHED", 820, 16),
        (21, 1, 1, "Intern .NET Backend Developer", "intern-dotnet-backend-fpt", "Dành cho sinh viên năm 3-4 mong muốn học hỏi chuyên sâu về kiến trúc C# .NET.", "Biết viết code C# cơ bản, ham học hỏi, có trách nhiệm cao.", "Trợ cấp thực tập, hỗ trợ đóng dấu đồ án tốt nghiệp.", "INTERNSHIP", "INTERN", 3500000, 5500000, "Đà Nẵng", "PUBLISHED", 980, 31),
        (22, 2, 2, "Fresher Frontend Web (React)", "fresher-frontend-react-vng", "Gia nhập đội ngũ phát triển sản phẩm Zing MP3 phiên bản Web mới.", "Nắm vững HTML, CSS, JavaScript, đã từng làm ít nhất 1 dự án bằng ReactJS.", "Trải nghiệm văn hóa làm việc trẻ trung tại VNG Campus.", "FULL_TIME", "FRESHER", 9000000, 14000000, "TP. Hồ Chí Minh", "PUBLISHED", 750, 28),
        (23, 4, 4, "Fresher Android Developer (Kotlin)", "fresher-android-developer-one-mount", "Tham gia phát triển app VinShop phục vụ hàng trăm ngàn tạp hóa tại Việt Nam.", "Có kiến thức tốt về Kotlin, Android SDK, MVVM Architecture.", "Cơ hội học hỏi từ các chuyên gia hàng đầu từ Google, Grab gia nhập One Mount.", "FULL_TIME", "FRESHER", 9500000, 14500000, "Hà Nội", "PUBLISHED", 530, 19),
        (24, 6, 6, "Intern QA Engineer", "intern-qa-engineer-nab", "Học việc kiểm thử phần mềm thủ công và bước đầu tiếp cận kiểm thử tự động tại NAB.", "Cẩn thận, tỉ mỉ, tiếng Anh giao tiếp khá.", "Môi trường ngân hàng quốc tế, mentor nhiệt tình.", "INTERNSHIP", "INTERN", 5000000, 7000000, "TP. Hồ Chí Minh", "PUBLISHED", 690, 25),
        (25, 8, 8, "Junior DevOps Specialist", "junior-devops-specialist-kms", "Hỗ trợ xây dựng và bảo trì CI/CD pipeline cho các nhóm dự án phần mềm.", "1 năm kinh nghiệm với Docker, Linux, bash script và một trong các cloud AWS/Azure.", "Môi trường học tập cởi mở, khuyến khích thi các chứng chỉ quốc tế.", "FULL_TIME", "JUNIOR", 14000000, 21000000, "TP. Hồ Chí Minh", "PUBLISHED", 410, 11)
    ]
    j_vals = []
    for jid, cid, rpid, title, slug, desc, req, ben, jtype, exp, min_s, max_s, city, st, v_cnt, a_cnt in jobs_data:
        j_vals.append(f"({jid}, UUID(), {cid}, {rpid}, '{title}', '{slug}', '{desc}', '{req}', '{ben}', '{jtype}', '{exp}', {min_s}, {max_s}, 'VND', 0, '{city}', NULL, '{st}', NOW() + INTERVAL 30 DAY, {v_cnt}, {a_cnt}, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY, NOW())")
    sql.append("INSERT INTO `jobs` (`id`, `uuid`, `company_id`, `recruiter_id`, `title`, `slug`, `description`, `requirements`, `benefits`, `job_type`, `exp_level`, `min_salary`, `max_salary`, `currency`, `is_salary_negotiable`, `location_city`, `location_address`, `status`, `deadline`, `views_count`, `applications_count`, `published_at`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(j_vals) + ";\n")

    # 12. Job Skills (75 records)
    sql.append("-- 12. JOB SKILLS (75 records)")
    job_skills_mapping = [
        (1, [(1, 1, 0, 1.5), (7, 1, 0, 1.5), (8, 1, 0, 1.5), (14, 0, 0, 1.0), (19, 0, 0, 1.0)]), # Fresher .NET FPT
        (2, [(1, 1, 4, 1.5), (7, 1, 4, 1.5), (8, 1, 4, 1.5), (19, 1, 2, 1.2), (20, 1, 1, 1.2), (29, 0, 1, 1.0)]), # Senior .NET FPT
        (3, [(5, 1, 2, 1.5), (4, 1, 1, 1.2), (10, 1, 2, 1.5), (24, 0, 1, 1.0)]), # Junior React VNG
        (4, [(6, 1, 2, 1.5), (17, 1, 2, 1.3), (14, 0, 1, 1.0), (19, 0, 1, 1.0)]), # Golang VNG
        (5, [(2, 1, 2, 1.5), (9, 1, 2, 1.5), (15, 1, 2, 1.2), (17, 0, 1, 1.0)]), # Java Viettel
        (6, [(19, 1, 2, 1.5), (20, 1, 2, 1.5), (21, 1, 2, 1.3), (22, 1, 1, 1.2), (32, 1, 2, 1.2)]), # DevOps Viettel
        (7, [(3, 1, 0, 1.5), (15, 1, 0, 1.3), (14, 0, 0, 1.0)]), # Fresher Data OM
        (8, [(10, 1, 3, 1.4), (25, 1, 3, 1.4), (15, 1, 2, 1.2), (19, 0, 1, 1.0)]), # Senior Fullstack OM
        (9, [(4, 1, 1, 1.2), (24, 0, 1, 1.0)]), # Flutter MoMo
        (10, [(14, 1, 3, 1.5), (17, 1, 2, 1.3), (32, 1, 2, 1.2)]), # DBA MoMo
        (11, [(1, 1, 1, 1.5), (8, 1, 1, 1.5), (33, 1, 1, 1.2), (39, 1, 1, 1.3)]), # Junior .NET NAB
        (12, [(33, 1, 2, 1.5), (34, 1, 2, 1.5), (39, 1, 1, 1.2)]), # QA Auto NAB
        (13, [(6, 1, 2, 1.5), (2, 0, 2, 1.2), (17, 0, 1, 1.0)]), # Backend Tiki
        (14, [(11, 1, 1, 1.5), (10, 1, 1, 1.3), (4, 1, 1, 1.2)]), # Next.js Tiki
        (15, [(1, 0, 0, 1.0), (2, 0, 0, 1.0), (3, 0, 0, 1.0), (5, 0, 0, 1.0)]), # Intern KMS
        (16, [(10, 1, 2, 1.4), (2, 1, 2, 1.4), (9, 1, 2, 1.3)]), # Fullstack KMS
        (17, [(1, 1, 3, 1.5), (8, 1, 3, 1.5), (23, 1, 2, 1.3), (39, 1, 2, 1.2)]), # Senior .NET Nash
        (18, [(2, 1, 0, 1.5), (14, 0, 0, 1.0), (39, 0, 0, 1.0)]), # Fresher Java Nash
        (19, [(3, 1, 2, 1.5), (19, 0, 1, 1.0), (39, 1, 1, 1.2)]), # AI Axon
        (20, [(6, 1, 3, 1.5), (22, 1, 2, 1.3), (29, 0, 1, 1.1), (39, 1, 2, 1.2)]), # Go Axon
        (21, [(1, 1, 0, 1.5), (7, 1, 0, 1.2)]), # Intern .NET FPT Danang
        (22, [(5, 1, 0, 1.5), (10, 1, 0, 1.5)]), # Fresher React VNG
        (23, [(4, 1, 0, 1.2), (36, 0, 0, 1.0)]), # Fresher Android OM
        (24, [(33, 1, 0, 1.5), (39, 1, 0, 1.3)]), # Intern QA NAB
        (25, [(19, 1, 1, 1.5), (21, 1, 1, 1.3), (32, 1, 1, 1.2)]) # Junior DevOps KMS
    ]
    js_vals = []
    js_idx = 1
    for jid, s_list in job_skills_mapping:
        for sid, is_req, min_yr, w in s_list:
            js_vals.append(f"({js_idx}, {jid}, {sid}, {is_req}, {min_yr}, {w})")
            js_idx += 1
    sql.append("INSERT INTO `job_skills` (`id`, `job_id`, `skill_id`, `is_required`, `min_years_exp`, `weight`) VALUES\n" + ",\n".join(js_vals) + ";\n")

    # 13. CVs (30 records across candidates)
    sql.append("-- 13. CVS (30 records)")
    cv_list = []
    for cid in range(1, 25):
        # Every candidate has at least 1 CV
        cv_list.append((len(cv_list) + 1, cid, f"CV_Chinh_{cid}.pdf", f"https://storage.talentbridge.vn/cvs/cand_{cid}_v1.pdf", f"CV_Candidate_{cid}.pdf", 1024 * random.randint(300, 1500), f"md5hash_cand_{cid}_v1", "COMPLETED", 1))
    # Some candidates have a 2nd specialized CV
    for cid in [1, 2, 3, 4, 7, 9]:
        cv_list.append((len(cv_list) + 1, cid, f"CV_ChuyenSau_{cid}.pdf", f"https://storage.talentbridge.vn/cvs/cand_{cid}_v2.pdf", f"CV_Specialized_{cid}.pdf", 1024 * random.randint(400, 1800), f"md5hash_cand_{cid}_v2", "COMPLETED", 0))
    cv_vals = []
    for cv_id, cpid, title, furl, fname, fsize, fmd5, status, is_def in cv_list:
        cv_vals.append(f"({cv_id}, UUID(), {cpid}, '{title}', '{furl}', '{fname}', {fsize}, '{fmd5}', '{status}', {is_def}, NOW() - INTERVAL {random.randint(10, 40)} DAY, NOW(), NULL)")
    sql.append("INSERT INTO `cvs` (`id`, `uuid`, `candidate_profile_id`, `title`, `file_url`, `file_name`, `file_size_bytes`, `file_md5`, `parsing_status`, `is_default`, `created_at`, `updated_at`, `deleted_at`) VALUES\n" + ",\n".join(cv_vals) + ";\n")

    # 14. CV Parsed Data (30 records matching the CVs)
    sql.append("-- 14. CV PARSED DATA (30 records with structured AI extraction)")
    cpd_vals = []
    for cv_id, cpid, title, furl, fname, fsize, fmd5, status, is_def in cv_list:
        raw_json = json.dumps({
            "candidate_id": cpid,
            "extracted_at": "2026-09-04T10:00:00Z",
            "model": "gemini-1.5-flash",
            "confidence": 0.96
        })
        summary = f"Ứng viên chuyên ngành Công nghệ Thông tin, có thế mạnh về tư duy lập trình và kỹ năng thực hành dự án môn học."
        skills_json = json.dumps(["C#", ".NET Core", "SQL Server", "Docker", "REST API", "Git"])
        exp_json = json.dumps([{"company": "FPT Telecom (Thực tập)", "role": "Backend Intern", "duration": "3 tháng", "desc": "Hỗ trợ bảo trì API quản lý khách hàng."}])
        edu_json = json.dumps([{"school": "Đại học Bách Khoa", "degree": "Kỹ sư CNTT", "gpa": "3.2/4.0", "graduation": "2026"}])
        proj_json = json.dumps([{"name": "E-Commerce Microservices", "tech": [".NET Core", "RabbitMQ", "PostgreSQL"], "desc": "Đồ án tốt nghiệp xây dựng sàn thương mại điện tử phân tán."}])
        q_score = round(random.uniform(78.0, 95.0), 1)
        feedback = "CV trình bày rõ ràng, nên bổ sung số liệu định lượng (metrics) cho các dự án đã làm theo chuẩn STAR."
        cpd_vals.append(f"({cv_id}, {cv_id}, '{raw_json}', '{summary}', '{skills_json}', '{exp_json}', '{edu_json}', '{proj_json}', {q_score}, '{feedback}', NOW() - INTERVAL 10 DAY)")
    sql.append("INSERT INTO `cv_parsed_data` (`id`, `cv_id`, `raw_parsed_json`, `extracted_summary`, `extracted_skills`, `extracted_experiences`, `extracted_educations`, `extracted_projects`, `quality_score`, `improvement_feedback`, `analyzed_at`) VALUES\n" + ",\n".join(cpd_vals) + ";\n")

    # 15. Job Applications (35 records)
    sql.append("-- 15. JOB APPLICATIONS (35 records across various ATS stages)")
    # Stages: APPLIED, SCREENING, INTERVIEW, OFFERED, HIRED, REJECTED
    stages_pool = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"]
    applications_data = [
        # (app_id, job_id, cand_id, cv_id, stage, score, note)
        (1, 1, 1, 1, "INTERVIEW", 86.5, "Ứng viên phù hợp vị trí Fresher .NET, đã qua vòng sơ loại."),
        (2, 1, 4, 4, "SCREENING", 82.0, "Hồ sơ ổn, có kinh nghiệm cả .NET và React."),
        (3, 1, 21, 21, "APPLIED", 78.5, "Mới nộp, chờ HR review."),
        (4, 1, 23, 23, "REJECTED", 55.0, "Thiếu kỹ năng SQL và chưa có đồ án thực tế."),
        (5, 2, 1, 25, "REJECTED", 62.0, "Chưa đủ số năm kinh nghiệm yêu cầu (cần Senior)."),
        (6, 3, 2, 2, "OFFERED", 92.0, "Phỏng vấn xuất sắc, tác phong chuyên nghiệp."),
        (7, 3, 5, 5, "INTERVIEW", 84.0, "Frontend vững, đang chờ phỏng vấn Technical."),
        (8, 3, 18, 18, "SCREENING", 80.5, "Profile Next.js tốt, phù hợp."),
        (9, 4, 6, 6, "HIRED", 94.0, "Ứng viên nhận offer Golang, đã onboard."),
        (10, 4, 16, 16, "INTERVIEW", 88.5, "Kinh nghiệm Go 2 năm, tư duy hệ thống tốt."),
        (11, 5, 3, 3, "OFFERED", 90.0, "Chuyên môn Java Spring Boot rất tốt."),
        (12, 5, 15, 15, "INTERVIEW", 89.0, "Lịch phỏng vấn vòng 2."),
        (13, 5, 19, 19, "APPLIED", 74.0, "Chờ xem xét."),
        (14, 6, 9, 9, "HIRED", 95.0, "Có chứng chỉ AWS, thực chiến Kubernetes rất tốt."),
        (15, 6, 25, 24, "REJECTED", 58.0, "Thiếu kinh nghiệm thực tế về hạ tầng."),
        (16, 7, 14, 14, "SCREENING", 81.0, "Kỹ năng Python và SQL khá tốt."),
        (17, 7, 8, 8, "INTERVIEW", 85.0, "Hẹn phỏng vấn qua Google Meet."),
        (18, 8, 7, 7, "SCREENING", 83.5, "Fullstack Node & React khá ổn."),
        (19, 9, 11, 11, "INTERVIEW", 87.0, "Đã hoàn thành bài test Flutter."),
        (20, 11, 1, 1, "INTERVIEW", 88.0, "Ứng tuyển vị trí Junior .NET tại NAB."),
        (21, 11, 4, 4, "SCREENING", 80.0, "Chờ xếp lịch."),
        (22, 12, 10, 10, "HIRED", 93.5, "QA Automation giỏi, tiếng Anh tốt."),
        (23, 12, 13, 13, "OFFERED", 91.0, "Đang thương lượng mức lương."),
        (24, 13, 6, 6, "SCREENING", 79.0, "Profile ổn."),
        (25, 14, 2, 2, "INTERVIEW", 86.0, "Hẹn phỏng vấn tuần tới."),
        (26, 15, 22, 22, "APPLIED", 70.0, "Sinh viên năm 3 xin thực tập."),
        (27, 15, 24, 24, "SCREENING", 75.0, "Xem xét đồ án capstone."),
        (28, 17, 12, 12, "REJECTED", 65.0, "Chưa đủ 3 năm kinh nghiệm .NET."),
        (29, 18, 3, 3, "OFFERED", 90.0, "Fresher Java tiềm năng tại NashTech."),
        (30, 18, 19, 19, "INTERVIEW", 82.0, "Chuẩn bị phỏng vấn."),
        (31, 19, 8, 8, "SCREENING", 84.0, "Profile AI phù hợp với định hướng Axon."),
        (32, 20, 16, 16, "INTERVIEW", 89.0, "Senior Golang, phỏng vấn với Hiring Manager."),
        (33, 21, 1, 25, "APPLIED", 75.0, "Nộp thêm chi nhánh Đà Nẵng."),
        (34, 22, 18, 18, "APPLIED", 82.0, "Ứng tuyển vị trí Zing MP3."),
        (35, 25, 9, 9, "APPLIED", 88.0, "Ứng tuyển vị trí DevOps KMS.")
    ]
    app_vals = []
    for app_id, jid, cpid, cv_id, stg, sc, note in applications_data:
        app_vals.append(f"({app_id}, UUID(), {jid}, {cpid}, {cv_id}, 'Kính gửi Quý công ty, tôi rất mong muốn được ứng tuyển vào vị trí này.', '{stg}', {sc}, '{note}', NOW() - INTERVAL {random.randint(5, 25)} DAY, NOW())")
    sql.append("INSERT INTO `job_applications` (`id`, `uuid`, `job_id`, `candidate_profile_id`, `cv_id`, `cover_letter`, `current_stage`, `match_score`, `rejection_reason`, `applied_at`, `updated_at`) VALUES\n" + ",\n".join(app_vals) + ";\n")

    # 16. Application Stage Histories (50 records)
    sql.append("-- 16. APPLICATION STAGE HISTORIES (50 records)")
    ash_vals = []
    ash_idx = 1
    for app_id, jid, cpid, cv_id, stg, sc, note in applications_data:
        # Initial APPLIED
        ash_vals.append(f"({ash_idx}, {app_id}, NULL, 'APPLIED', 2, 'Ứng viên nộp hồ sơ trực tuyến', NOW() - INTERVAL 20 DAY)")
        ash_idx += 1
        if stg in ["SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"]:
            ash_vals.append(f"({ash_idx}, {app_id}, 'APPLIED', 'SCREENING', 2, 'Recruiter duyệt qua hồ sơ hợp lệ', NOW() - INTERVAL 15 DAY)")
            ash_idx += 1
        if stg in ["INTERVIEW", "OFFERED", "HIRED"]:
            ash_vals.append(f"({ash_idx}, {app_id}, 'SCREENING', 'INTERVIEW', 2, 'Gửi thư mời phỏng vấn chuyên môn', NOW() - INTERVAL 10 DAY)")
            ash_idx += 1
        if stg in ["OFFERED", "HIRED"]:
            ash_vals.append(f"({ash_idx}, {app_id}, 'INTERVIEW', 'OFFERED', 2, 'Gửi thư mời nhận việc chính thức', NOW() - INTERVAL 5 DAY)")
            ash_idx += 1
        if stg == "HIRED":
            ash_vals.append(f"({ash_idx}, {app_id}, 'OFFERED', 'HIRED', 2, 'Ứng viên xác nhận đồng ý gia nhập', NOW() - INTERVAL 2 DAY)")
            ash_idx += 1
        if stg == "REJECTED":
            ash_vals.append(f"({ash_idx}, {app_id}, 'SCREENING', 'REJECTED', 2, '{note}', NOW() - INTERVAL 8 DAY)")
            ash_idx += 1
    sql.append("INSERT INTO `application_stage_histories` (`id`, `application_id`, `from_stage`, `to_stage`, `changed_by_user_id`, `note`, `created_at`) VALUES\n" + ",\n".join(ash_vals[:50]) + ";\n")

    # 17. Application Notes (25 records)
    sql.append("-- 17. APPLICATION NOTES (25 records)")
    an_vals = []
    notes_list = [
        "Ứng viên có thái độ học hỏi rất tốt, tiếng Anh lưu loát.",
        "Đồ án tốt nghiệp thiết kế kiến trúc chuẩn, hiểu rõ Dependency Injection.",
        "Cần kiểm tra kỹ phần kiến thức Docker và SQL indexing trong buổi phỏng vấn.",
        "Kỳ vọng mức lương 15 triệu, có thể thương lượng thêm.",
        "Hiring Manager đánh giá cao khả năng giải thuật của ứng viên.",
        "Điểm trừ là chưa có kinh nghiệm làm việc thực tế với Git workflow theo nhóm.",
        "Giao tiếp tự tin, phù hợp với văn hóa cởi mở của công ty.",
        "Đã hoàn thành bài test kỹ thuật đạt 85/100 điểm."
    ]
    for i in range(1, 26):
        note_text = notes_list[i % len(notes_list)]
        an_vals.append(f"({i}, {i}, 2, '{note_text}', 0, NOW() - INTERVAL {random.randint(2, 10)} DAY)")
    sql.append("INSERT INTO `application_notes` (`id`, `application_id`, `author_user_id`, `content`, `is_private`, `created_at`) VALUES\n" + ",\n".join(an_vals) + ";\n")

    # 18. Candidate Job Matches (35 records)
    sql.append("-- 18. CANDIDATE JOB MATCHES (35 records)")
    cjm_vals = []
    for app_id, jid, cpid, cv_id, stg, sc, note in applications_data:
        m_skills = json.dumps(["C#", ".NET Core", "SQL Server", "REST API"])
        miss_skills = json.dumps(["Docker", "CI/CD"]) if sc < 85 else json.dumps([])
        imp_skills = json.dumps(["Unit Testing"]) if sc < 90 else json.dumps([])
        explanation = f"Hồ sơ ứng viên có độ tương thích cao với vị trí tuyển dụng. Điểm kỹ năng đạt {sc}%, đáp ứng tốt các yêu cầu bắt buộc."
        cjm_vals.append(f"({app_id}, {jid}, {cpid}, {cv_id}, {app_id}, {sc}, {sc + 2}, {sc - 3}, {sc - 1}, {sc + 1}, '{m_skills}', '{miss_skills}', '{imp_skills}', '{explanation}', NOW() - INTERVAL 12 DAY)")
    sql.append("INSERT INTO `candidate_job_matches` (`id`, `job_id`, `candidate_profile_id`, `cv_id`, `application_id`, `overall_score`, `must_have_score`, `nice_to_have_score`, `experience_score`, `semantic_score`, `matched_skills_json`, `missing_skills_json`, `improvement_skills_json`, `ai_explanation`, `computed_at`) VALUES\n" + ",\n".join(cjm_vals) + ";\n")

    # 19. Career Roadmaps (20 records for candidates)
    sql.append("-- 19. CAREER ROADMAPS (20 records)")
    crm_vals = []
    roles_target = [
        "Mid-level .NET Backend Engineer",
        "Senior React Frontend Developer",
        "Full-Stack Cloud Developer",
        "DevOps & SRE Specialist",
        "Lead Software Architect"
    ]
    for cid in range(1, 21):
        target_role = roles_target[cid % len(roles_target)]
        crm_vals.append(f"({cid}, UUID(), {cid}, '{target_role}', 1, 'Lộ trình tối ưu hóa năng lực để nâng cấp chuyên môn trong 8-12 tuần.', 8, 'IN_PROGRESS', NOW() - INTERVAL 15 DAY, NOW())")
    sql.append("INSERT INTO `career_roadmaps` (`id`, `uuid`, `candidate_profile_id`, `target_role_title`, `target_job_id`, `summary`, `total_weeks`, `status`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(crm_vals) + ";\n")

    # 20. Roadmap Milestones (40 records, 2 per roadmap)
    sql.append("-- 20. ROADMAP MILESTONES (40 records)")
    rm_vals = []
    rm_idx = 1
    for cid in range(1, 21):
        rm_vals.append(f"({rm_idx}, {cid}, 1, 'Giai đoạn 1: Bổ sung kiến thức Container & Đóng gói (Docker)', 'Học lý thuyết và thực hành Dockerfile, Docker Compose, triển khai ứng dụng vào container.', 4)")
        rm_idx += 1
        rm_vals.append(f"({rm_idx}, {cid}, 2, 'Giai đoạn 2: Thiết kế Microservices & Tích hợp Message Queue', 'Xây dựng Event-driven Architecture với RabbitMQ và tối ưu hóa truy vấn Database.', 4)")
        rm_idx += 1
    sql.append("INSERT INTO `roadmap_milestones` (`id`, `roadmap_id`, `stage_order`, `title`, `description`, `duration_weeks`) VALUES\n" + ",\n".join(rm_vals) + ";\n")

    # 21. Roadmap Tasks (60 records)
    sql.append("-- 21. ROADMAP TASKS (60 records)")
    rt_vals = []
    for i in range(1, 61):
        m_id = (i - 1) // 3 + 1
        skill_ref = 19 if i % 2 == 1 else 31
        is_done = 1 if i % 3 == 0 else 0
        comp_date = "NOW() - INTERVAL 3 DAY" if is_done else "NULL"
        rt_vals.append(f"({i}, {m_id}, 'Nhiệm vụ {i}: Đọc tài liệu và xây dựng demo thực hành', 'Thực hiện bài tập kiểm tra năng lực và đẩy mã nguồn lên GitHub cá nhân.', {skill_ref}, 'https://roadmap.sh/backend', {is_done}, {comp_date})")
    sql.append("INSERT INTO `roadmap_tasks` (`id`, `milestone_id`, `title`, `description`, `skill_id`, `recommended_resource_url`, `is_completed`, `completed_at`) VALUES\n" + ",\n".join(rt_vals) + ";\n")

    # 22. Interviews (22 records)
    sql.append("-- 22. INTERVIEWS (22 records)")
    int_vals = []
    int_formats = ["ONLINE", "OFFLINE"]
    int_statuses = ["COMPLETED", "SCHEDULED", "COMPLETED", "COMPLETED", "SCHEDULED"]
    for i in range(1, 23):
        fmt = int_formats[i % 2]
        st = int_statuses[i % len(int_statuses)]
        room = "https://meet.google.com/abc-talent-test" if fmt == "ONLINE" else "Phòng phỏng vấn Tầng 5, Tòa nhà FPT Cầu Giấy"
        int_vals.append(f"({i}, UUID(), {i}, 1, NOW() + INTERVAL {i} DAY, NOW() + INTERVAL {i} DAY + INTERVAL 60 MINUTE, '{fmt}', '{room}', '{st}', 'Vui lòng chuẩn bị laptop và vào link họp trước 5 phút.', NOW() - INTERVAL 5 DAY, NOW())")
    sql.append("INSERT INTO `interviews` (`id`, `uuid`, `application_id`, `round_number`, `scheduled_start`, `scheduled_end`, `interview_format`, `meeting_link_or_room`, `status`, `notes_to_candidate`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(int_vals) + ";\n")

    # 23. Interview Evaluations (22 records)
    sql.append("-- 23. INTERVIEW EVALUATIONS (22 records)")
    eval_vals = []
    recomms = ["STRONG_HIRE", "HIRE", "NEUTRAL", "HIRE", "STRONG_HIRE"]
    for i in range(1, 23):
        t_sc = random.randint(3, 5)
        c_sc = random.randint(3, 5)
        p_sc = random.randint(3, 5)
        cu_sc = random.randint(4, 5)
        rec = recomms[i % len(recomms)]
        eval_vals.append(f"({i}, {i}, 2, {t_sc}, {c_sc}, {p_sc}, {cu_sc}, '{rec}', 'Ứng viên nắm chắc kiến thức căn bản, trả lời rõ ràng các câu hỏi tình huống thực tế.', NOW() - INTERVAL 2 DAY)")
    sql.append("INSERT INTO `interview_evaluations` (`id`, `interview_id`, `interviewer_user_id`, `technical_score`, `communication_score`, `problem_solving_score`, `culture_fit_score`, `recommendation`, `feedback_notes`, `submitted_at`) VALUES\n" + ",\n".join(eval_vals) + ";\n")

    # 24. AI Chat Sessions (24 records)
    sql.append("-- 24. AI CHAT SESSIONS (24 records)")
    acs_vals = []
    for i in range(1, 25):
        uid = i + 11
        acs_vals.append(f"({i}, UUID(), {uid}, 'Tư vấn định hướng nghề nghiệp và tối ưu CV cá nhân', NOW() - INTERVAL {random.randint(1, 20)} DAY, NOW())")
    sql.append("INSERT INTO `ai_chat_sessions` (`id`, `uuid`, `user_id`, `title`, `created_at`, `updated_at`) VALUES\n" + ",\n".join(acs_vals) + ";\n")

    # 25. AI Chat Messages (48 records, 2 messages per session)
    sql.append("-- 25. AI CHAT MESSAGES (48 records)")
    acm_vals = []
    msg_idx = 1
    for i in range(1, 25):
        meta_user = json.dumps({"client": "web", "timestamp": "2026-09-04"})
        meta_bot = json.dumps({"model": "gemini-1.5-flash", "tokens": 420, "finish_reason": "STOP"})
        acm_vals.append(f"({msg_idx}, {i}, 'USER', 'Với CV hiện tại của tôi thì nên ứng tuyển vào vị trí Fresher nào và cần bổ sung thêm kỹ năng gì?', '{meta_user}', NOW() - INTERVAL 5 DAY)")
        msg_idx += 1
        acm_vals.append(f"({msg_idx}, {i}, 'ASSISTANT', 'Chào bạn! Dựa trên hồ sơ của bạn, bạn rất phù hợp với vị trí Fresher .NET Backend Developer. Điểm mạnh là kiến trúc C# vững, tuy nhiên bạn nên học thêm Docker cơ bản để nổi bật hơn trong mắt nhà tuyển dụng.', '{meta_bot}', NOW() - INTERVAL 5 DAY + INTERVAL 5 SECOND)")
        msg_idx += 1
    sql.append("INSERT INTO `ai_chat_messages` (`id`, `session_id`, `sender_type`, `content`, `meta_info`, `created_at`) VALUES\n" + ",\n".join(acm_vals) + ";\n")

    # 26. Notifications (40 records)
    sql.append("-- 26. NOTIFICATIONS (40 records)")
    notif_vals = []
    for i in range(1, 41):
        uid = (i % 24) + 12
        is_r = 1 if i % 2 == 0 else 0
        r_at = "NOW() - INTERVAL 1 DAY" if is_r else "NULL"
        notif_vals.append(f"({i}, {uid}, 'APPLICATION_UPDATE', 'Cập nhật trạng thái đơn ứng tuyển', 'Đơn ứng tuyển của bạn tại công ty FPT Software đã được chuyển sang trạng thái: Phỏng vấn.', 'job_applications', 1, {is_r}, {r_at}, NOW() - INTERVAL {random.randint(1, 10)} DAY)")
    sql.append("INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `content`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`) VALUES\n" + ",\n".join(notif_vals) + ";\n")

    # 27. Audit Logs (45 records)
    sql.append("-- 27. AUDIT LOGS (45 records)")
    audit_vals = []
    actions = ["USER_LOGIN", "CV_UPLOADED", "JOB_PUBLISHED", "APPLICATION_STAGE_CHANGED", "INTERVIEW_SCHEDULED", "MATCH_CALCULATED"]
    for i in range(1, 46):
        act = actions[i % len(actions)]
        corr_id = f"corr_trace_{i:04d}_test"
        old_val = "'" + json.dumps({"stage": "APPLIED"}) + "'" if "STAGE" in act else "NULL"
        new_val = "'" + json.dumps({"stage": "SCREENING"}) + "'" if "STAGE" in act else "NULL"
        audit_vals.append(f"({i}, 2, '{act}', 'job_applications', {i}, {old_val}, {new_val}, '192.168.1.100', 'Mozilla/5.0 Chrome/128.0', '{corr_id}', NOW() - INTERVAL {random.randint(1, 15)} DAY)")
    sql.append("INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_name`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `correlation_id`, `created_at`) VALUES\n" + ",\n".join(audit_vals) + ";\n")

    sql.append("COMMIT;")
    sql.append("SET FOREIGN_KEY_CHECKS = 1;\n")
    sql.append("-- ==============================================================================")
    sql.append("-- HOÀN TẤT NẠP TOÀN BỘ SEED DATA THỰC TẾ ĐẢM BẢO CHUẨN ACID")
    sql.append("-- ==============================================================================")

    return "\n".join(sql)

if __name__ == "__main__":
    content = generate_seed_sql()
    target_path = r"C:\Users\DELL\.gemini\antigravity\scratch\ai-recruitment-platform\docs\phase-2-design\03_SEED_DATA.sql"
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated successfully: {target_path} ({len(content)} bytes)")
