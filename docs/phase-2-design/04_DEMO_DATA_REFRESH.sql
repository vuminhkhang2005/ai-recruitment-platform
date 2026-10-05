-- =====================================================================
-- 04_DEMO_DATA_REFRESH.sql
-- Idempotent maintenance script for the local demo database.
--  1. Re-open seeded job postings whose deadline has passed (seed used NOW()+N days).
--  2. Close duplicate postings created by automated UI tests.
--  3. Recompute application match scores from real skill overlap
--     (same formula as MatchingService: required skills weight 1, optional 0.5,
--      matched skill with fewer years than required counts 70%).
-- Usage: mysql -u root -p ai_recruitment_db < 04_DEMO_DATA_REFRESH.sql
-- =====================================================================

-- 1. Extend expired seeded jobs to a spread of future deadlines (10..49 days)
UPDATE jobs
SET deadline = DATE_ADD(NOW(), INTERVAL (10 + (id * 7) % 40) DAY)
WHERE status = 'PUBLISHED'
  AND deleted_at IS NULL
  AND deadline IS NOT NULL
  AND deadline < NOW();

-- 2. Close duplicate postings (same recruiter + same title), keeping the newest one
UPDATE jobs j
JOIN (
    SELECT recruiter_id, title, MAX(id) AS keep_id
    FROM jobs
    WHERE deleted_at IS NULL
    GROUP BY recruiter_id, title
    HAVING COUNT(*) > 1
) d ON d.recruiter_id = j.recruiter_id AND d.title = j.title AND j.id <> d.keep_id
SET j.status = 'CLOSED', j.deleted_at = NOW();

-- 3. Recompute match scores
UPDATE job_applications SET match_score = NULL;

UPDATE job_applications a
JOIN (
    SELECT a2.id,
           ROUND(100 * SUM(CASE
                               WHEN cs.id IS NULL THEN 0
                               WHEN cs.years_experience >= js.min_years_exp THEN js.w
                               ELSE js.w * 0.7
                           END) / SUM(js.w)) AS score
    FROM job_applications a2
    JOIN (SELECT job_id, skill_id, min_years_exp, weight * IF(is_required, 1, 0.5) AS w FROM job_skills) js
         ON js.job_id = a2.job_id
    LEFT JOIN candidate_skills cs
         ON cs.candidate_profile_id = a2.candidate_profile_id AND cs.skill_id = js.skill_id
    WHERE EXISTS (SELECT 1 FROM candidate_skills c WHERE c.candidate_profile_id = a2.candidate_profile_id)
    GROUP BY a2.id
) s ON s.id = a.id
SET a.match_score = s.score;

-- 4. Company logos: the Clearbit logo API has been shut down, so the seeded URLs are broken images.
--    Point the companies we ship logos for to /public/logos, clear the rest (UI falls back to initials).
UPDATE companies SET logo_url = '/logos/fpt.svg'      WHERE logo_url LIKE '%clearbit.com/fpt-software.com%';
UPDATE companies SET logo_url = '/logos/vng.svg'      WHERE logo_url LIKE '%clearbit.com/vng.com.vn%';
UPDATE companies SET logo_url = '/logos/viettel.svg'  WHERE logo_url LIKE '%clearbit.com/viettel.com.vn%';
UPDATE companies SET logo_url = '/logos/onemount.svg' WHERE logo_url LIKE '%clearbit.com/onemount.com%';
UPDATE companies SET logo_url = '/logos/momo.png'     WHERE logo_url LIKE '%clearbit.com/momo.vn%';
UPDATE companies SET logo_url = NULL                  WHERE logo_url LIKE '%logo.clearbit.com%';

-- 5. Normalise city spelling so the city filter finds every job.
UPDATE jobs SET location_city = 'TP. Hồ Chí Minh' WHERE location_city IN ('TP Ho Chi Minh', 'Ho Chi Minh', 'HCM', 'TP HCM');

-- 6. applications_count must reflect real applications, not seeded numbers.
UPDATE jobs j SET applications_count = (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id);

-- 7. Enrich job descriptions, requirements and benefits with realistic multiline content.
UPDATE jobs SET
  description = 'Tham gia phát triển các phân hệ dịch vụ backend trong hệ thống chuyển đổi số doanh nghiệp.\nPhối hợp cùng Tech Lead thiết kế cơ sở dữ liệu và xây dựng RESTful API chuẩn OpenAPI.\nViết unit test, integration test và tối ưu hiệu năng truy vấn dữ liệu.\nTham gia quy trình Agile/Scrum, review mã nguồn và tài liệu hóa giải pháp kỹ thuật.',
  requirements = 'Tốt nghiệp Đại học/Cao đẳng chuyên ngành CNTT hoặc các ngành liên quan.\nNắm vững nền tảng lập trình C#, .NET Core hoặc ASP.NET Web API.\nHiểu biết về cơ sở dữ liệu quan hệ (SQL Server, MySQL, PostgreSQL) và ORM (Entity Framework).\nCó tư duy thuật toán tốt, tinh thần học hỏi nhanh và khả năng đọc hiểu tài liệu tiếng Anh.',
  benefits = 'Mức lương cạnh tranh theo năng lực, xem xét tăng lương định kỳ.\nThưởng tháng 13 và thưởng dự án theo kết quả công việc.\nĐược đào tạo bài bản theo lộ trình nghề nghiệp và tài trợ thi chứng chỉ Microsoft.\nBảo hiểm sức khỏe FPT Care cho bản thân và người thân.\nMôi trường làm việc trẻ trung, trang thiết bị làm việc hiện đại.'
WHERE id = 1;

UPDATE jobs SET
  description = 'Chịu trách nhiệm thiết kế kiến trúc và phát triển hệ thống microservices chịu tải cao (high concurrency).\nXây dựng các dịch vụ giao dịch xử lý hàng chục nghìn request/giây với độ trễ thấp.\nTối ưu hóa hệ thống caching phân tán (Redis), message queue (Kafka/RabbitMQ) và kết nối cơ sở dữ liệu.\nĐóng vai trò chủ chốt trong việc hướng dẫn, mentoring cho các kỹ sư trẻ trong dự án.',
  requirements = 'Tối thiểu 5 năm kinh nghiệm làm việc chuyên sâu với .NET Core / C# trong các hệ thống lớn.\nKinh nghiệm thực chiến với kiến trúc Microservices, Docker, Kubernetes, CI/CD pipeline.\nThành thạo Kafka hoặc RabbitMQ, Redis, Elasticsearch và cơ sở dữ liệu SQL/NoSQL.\nTư duy phân tích hệ thống sắc bén, kỹ năng giải quyết sự cố và khả năng làm việc độc lập cao.',
  benefits = 'Gói thu nhập hấp dẫn, thưởng hiệu suất hàng năm lên tới 3-5 tháng lương.\nCấp máy tính cấu hình cao (MacBook Pro hoặc Dell Precision) và màn hình 4K.\nBảo hiểm sức khỏe cao cấp quốc tế, gói khám sức khỏe tổng quát định kỳ.\nChế độ làm việc linh hoạt (Hybrid working 2 ngày/tuần).\nCơ hội làm việc trực tiếp với các chuyên gia công nghệ hàng đầu.'
WHERE id = 2;

UPDATE jobs SET
  description = 'Phát triển giao diện web cho hệ sinh thái ZaloPay và các cổng thanh toán đối tác quy mô hàng triệu người dùng.\nTham gia thiết kế component UI/UX thân thiện, tối ưu trải nghiệm người dùng mobile web và desktop.\nPhối hợp chặt chẽ với đội ngũ Backend và Product Owner để tích hợp RESTful API.\nTham gia code review, tối ưu hiệu năng render và đảm bảo tiêu chuẩn web performance.',
  requirements = 'Tối thiểu 1-2 năm kinh nghiệm phát triển web với React, Next.js và TypeScript.\nNắm vững HTML5, CSS3, Tailwind CSS và responsive design.\nHiểu biết về RESTful API, quản lý state (Redux Toolkit, Zustand hoặc React Query).\nCó tinh thần trách nhiệm, chủ động tìm tòi công nghệ mới và kỹ năng làm việc nhóm tốt.',
  benefits = 'Thu nhập cạnh tranh, đánh giá tăng lương định kỳ 2 lần/năm.\nThưởng tháng 13 và thưởng hiệu quả kinh doanh dự án theo KPI.\nBảo hiểm sức khỏe cao cấp toàn diện cho nhân viên và người thân.\nCung cấp trang thiết bị làm việc hiện đại (MacBook Pro M-series).\nMôi trường công nghệ năng động, nhiều cơ hội học hỏi và thăng tiến.'
WHERE id = 3;

UPDATE jobs SET
  description = 'Thiết kế, xây dựng và vận hành các dịch vụ backend hiệu năng cao bằng ngôn ngữ Golang.\nXây dựng hệ thống chat thời gian thực, streaming dữ liệu và xử lý tin nhắn phân tán.\nGiám sát độ trễ, tài nguyên hệ thống và tối ưu bộ nhớ thông qua profiling (pprof).\nPhối hợp với nhóm hạ tầng DevOps để triển khai và vận hành trên cụm Kubernetes.',
  requirements = 'Tối thiểu 3 năm kinh nghiệm phát triển backend, trong đó có ít nhất 1.5 năm với Golang.\nHiểu sâu về concurrency model trong Go (goroutines, channels, sync primitives).\nKinh nghiệm làm việc với gRPC, Protocol Buffers, Kafka, Redis và MySQL/PostgreSQL.\nKinh nghiệm vận hành ứng dụng trên Linux và Docker/Kubernetes là một lợi thế lớn.',
  benefits = 'Thu nhập hấp dẫn tương xứng với năng lực, review lương hàng năm.\nThưởng hiệu quả sản phẩm (Product Incentive) và thưởng các dịp lễ tết.\nĐược cấp laptop xịn và phụ cấp ăn trưa, gửi xe, phòng gym nội bộ.\nTham gia các chương trình đào tạo kỹ thuật nội bộ và hội thảo công nghệ quốc tế.\nChế độ nghỉ phép 14 ngày/năm, bảo hiểm sức khỏe VIP.'
WHERE id = 4;

UPDATE jobs SET
  description = 'Tham gia nghiên cứu, thiết kế và phát triển các sản phẩm phần mềm cho khối Chính phủ điện tử và Doanh nghiệp số.\nXây dựng các dịch vụ microservices an toàn, bảo mật cao trên nền tảng Java Spring Boot.\nThiết kế cơ sở dữ liệu quan hệ, tối ưu câu truy vấn phức tạp và đảm bảo tính toàn vẹn dữ liệu.\nTuân thủ nghiêm ngặt quy trình phát triển phần mềm theo tiêu chuẩn CMMI Level 5.',
  requirements = 'Tối thiểu 2-4 năm kinh nghiệm lập trình Java, thành thạo Spring Boot, Spring Security, Hibernate/JPA.\nKinh nghiệm làm việc với cơ sở dữ liệu Oracle hoặc PostgreSQL.\nNắm vững kiến trúc RESTful API, xác thực JWT / OAuth2.\nTác phong làm việc chuyên nghiệp, có khả năng chịu áp lực và giải quyết vấn đề tốt.',
  benefits = 'Lương cạnh tranh cùng các gói đãi ngộ đặc thù của Tập đoàn Viettel.\nThưởng hoàn thành nhiệm vụ, thưởng các ngày lễ lớn trong năm.\nKhám sức khỏe định kỳ tại các bệnh viện uy tín hàng đầu.\nCơ hội tham gia các dự án trọng điểm cấp quốc gia có sức ảnh hưởng sâu rộng.\nLộ trình thăng tiến rõ ràng theo hướng Chuyên gia (Specialist) hoặc Quản lý (Management).'
WHERE id = 5;
