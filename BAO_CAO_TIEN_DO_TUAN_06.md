# BÁO CÁO TIẾN ĐỘ TUẦN 6
Đề tài: Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp
Nội dung thực hiện: Xây dựng Hệ thống Backend RESTful API, Xác thực bảo mật JWT & HttpOnly Cookie, Phân quyền RBAC, Hoàn thiện bộ CRUD và Tích hợp toàn diện vào Frontend
Sinh viên thực hiện: Vũ Minh Khang - 23110238

1. Mục tiêu tuần 6
Khởi tạo và chuẩn hóa kiến trúc Backend Spring Boot 3 theo mô hình 3 tầng (Controller - Service - Repository) kết hợp DTO Pattern và Global Exception Handling.
Kết nối trực tiếp cơ sở dữ liệu MySQL 8.0 (29 bảng đã thiết kế ở Phase 2) thông qua Spring Data JPA/Hibernate, tối ưu truy vấn nạp dữ liệu.
Triển khai hệ thống xác thực an toàn đa lớp: JWT Access Token kết hợp Refresh Token Rotation, lưu trữ trong HttpOnly Cookie (SameSite=Lax) nhằm triệt tiêu nguy cơ XSS và CSRF, mã hóa mật khẩu Bcrypt và chuẩn bị endpoint OAuth2 (Google, LinkedIn).
Thiết lập hệ thống phân quyền theo vai trò (Role-Based Access Control - RBAC) sử dụng @PreAuthorize cho các nhóm đối tượng: Ứng viên (ROLE_CANDIDATE), Nhà tuyển dụng (ROLE_RECRUITER), Quản trị viên (ROLE_ADMIN).
Xây dựng hoàn chỉnh toàn bộ các luồng thao tác dữ liệu cốt lõi (CRUD) cho 4 phân hệ chính: Jobs (Việc làm), Applications (Hồ sơ ứng tuyển), Companies (Hồ sơ doanh nghiệp), Users (Tài khoản người dùng).
Kiểm thử tự động hóa toàn diện với bộ JUnit 5 & MockMvc (đạt 100% test pass), xuất bản tài liệu Swagger UI / OpenAPI 3.0 và bộ sưu tập Postman Collection.
Tích hợp End-to-End (Frontend ↔ Backend Integration): kết nối tầng API Client, quản lý phiên đăng nhập qua Context API, lưu trữ tin tuyển dụng và đơn ứng tuyển thời gian thực vào MySQL.

2. Các công việc đã hoàn thành
2.1. Thiết kế và chuẩn hóa kiến trúc Backend Spring Boot 3 & RESTful API chuẩn
Tổ chức phân tầng rạch ròi: Controller (tiếp nhận HTTP Request, validate dữ liệu đầu vào qua Jakarta Validation @Valid, ánh xạ DTO), Service & ServiceImpl (đóng gói logic nghiệp vụ, quản lý giao dịch dữ liệu @Transactional), Repository (Spring Data JPA, tối ưu truy vấn JPQL fetch join triệt tiêu lỗi N+1 Query).
Quy chuẩn hóa phản hồi RESTful: Xây dựng lớp phản hồi chuẩn hóa dùng chung ApiResponse<T> và PageResponse<T> theo chuẩn công nghiệp.
Xử lý ngoại lệ tập trung: Xây dựng GlobalExceptionHandler với @RestControllerAdvice, bắt chính xác các ngoại lệ nghiệp vụ (ResourceNotFoundException, DuplicateResourceException, AccessDeniedException, MethodArgumentNotValidException), chuẩn hóa mã HTTP Status (200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
Tài liệu hóa Swagger UI / OpenAPI 3.0: Cung cấp giao diện tương tác API trực quan tại /swagger-ui/index.html với đầy đủ thẻ Tag, Operation summary, Parameter, Schema response và cấu hình xác thực kép (Bearer JWT + Cookie Auth). Bổ sung bộ điều hướng tự động từ các route thông dụng (/docs, /swagger, /swagger-ui).
2.2. Xây dựng Phân hệ Xác thực & Phân quyền bảo mật đa lớp (Auth & RBAC)
Cơ chế Token Kép (Access Token & Refresh Token Rotation):
Access Token thời hạn 30 phút, thuật toán HMAC-SHA384, mã hóa định danh người dùng (userId, uuid, fullName, roles).
Refresh Token chuỗi opaque ngẫu nhiên 64 ký tự hex sinh từ SecureRandom, lưu trong bảng MySQL user_tokens với thời hạn 7 ngày. Khi làm mới, refresh token cũ bị thu hồi để ngăn chặn tấn công Token Replay.
Bảo mật HttpOnly Cookie chống XSS & CSRF:
Đóng gói token trong header Set-Cookie với HttpOnly=true (chặn JavaScript truy cập trái phép), SameSite=Lax (ngăn ngừa CSRF cross-site), Path=/.
Hỗ trợ cơ chế linh hoạt: tự động gửi qua cookie với credentials: 'include' hoặc đính kèm qua header Authorization: Bearer <token>.
Mã hóa mật khẩu: Áp dụng BCryptPasswordEncoder với cost factor 12 ($2a$12$...) bảo vệ an toàn trước tấn công brute-force.
Phân quyền theo vai trò (RBAC) với @PreAuthorize:
ROLE_CANDIDATE: Nộp đơn ứng tuyển (POST /api/v1/applications), theo dõi lịch sử ứng tuyển (GET /api/v1/applications/me), hủy đơn nộp; tự động bị chặn bằng lỗi 403 Forbidden nếu cố tình tạo/sửa tin tuyển dụng.
ROLE_RECRUITER: Đăng tin tuyển dụng mới (POST /api/v1/jobs), chỉnh sửa tin của mình (PUT /api/v1/jobs/:id), đổi trạng thái tin (PATCH /api/v1/jobs/:id/status), truy xuất danh sách ứng viên nộp theo Job (GET /api/v1/applications/job/:jobId), duyệt trạng thái tuyển dụng (PATCH /api/v1/applications/:id/status).
ROLE_ADMIN: Toàn quyền quản trị hệ thống, quản lý công ty, khóa/mở khóa tài khoản người dùng (PATCH /api/v1/users/:id/status).
2.3. Hoàn thiện toàn diện các luồng CRUD (Jobs, Applications, Companies, Users)
CRUD Jobs (Quản lý Tin tuyển dụng): Tìm kiếm từ khóa Full-Text, lọc đa tiêu chí (địa điểm, kinh nghiệm, loại hình công việc, khoảng lương), phân trang linh hoạt; tạo tin đăng mới tự động bóc tách và liên kết kỹ năng (skills, job_skills), quản lý quan hệ khóa ngoại an toàn với recruiter_profiles; cập nhật, chuyển đổi trạng thái (PUBLISHED, CLOSED, DRAFT) và xóa mềm tin đăng.
CRUD Applications (Quản lý Hồ sơ ứng tuyển): Nộp đơn ứng tuyển nhanh (POST /api/v1/applications/quick-apply) tích hợp thuật toán kiểm tra chống nộp trùng lặp (Duplicate Submission Prevention); nộp đơn chính thức cho ứng viên đã đăng nhập kèm CV và thư giới thiệu; truy xuất lịch sử đơn nộp thời gian thực (GET /api/v1/applications/me); cập nhật tiến độ ứng tuyển qua các giai đoạn (APPLIED -> REVIEWING -> INTERVIEW -> OFFERED -> REJECTED).
CRUD Companies & Users: Quản lý danh mục đối tác doanh nghiệp, trang chi tiết công ty theo Slug SEO; API quản lý hồ sơ người dùng (GET /api/v1/users/me), cập nhật hồ sơ, phân quyền Admin quản lý danh sách user.
2.4. Kiểm thử tự động hóa (Automated Testing) & Postman Collection
Xây dựng bộ test tích hợp tự động với JUnit 5, MockMvc, AssertJ: Đạt 18/18 test case PASSED (100% tỷ lệ thành công, 0 lỗi, 0 thất bại):
AuthControllerTest: Kiểm thử đăng ký, đăng nhập thiết lập cookie HttpOnly, đăng xuất xóa cookie.
SecurityRbacTest: Kiểm thử chặn 401 khi chưa xác thực, chặn 403 khi Candidate cố đăng tin tuyển dụng, cấp quyền 200 cho Candidate xem lịch sử ứng tuyển.
JobControllerTest & CompanyControllerTest: Kiểm thử tìm kiếm, lọc, phân trang, chi tiết và xử lý lỗi 404 Not Found.
ApplicationControllerTest: Kiểm thử nộp hồ sơ quick-apply.
Xuất bản bộ sưu tập Postman Collection chuẩn hóa đầy đủ biến môi trường ({{baseUrl}}, {{accessToken}}) phục vụ kiểm thử thủ công và kiểm thử hồi quy.
2.5. Tích hợp End-to-End (Frontend React 19 ↔ Backend Spring Boot 3)
Xây dựng tầng dịch vụ API Client (src/services/api.ts): Cung cấp các hàm gọi API RESTful (loginApi, registerApi, logoutApi, getCurrentUserApi, createJobApi, fetchMyApplicationsApi), quản lý token trong storage và cấu hình credentials: 'include'.
Tầng Quản lý Trạng thái (src/context/AuthContext.tsx): Chuyển đổi từ mock sang xác thực thực tế với backend; tự động duy trì phiên làm việc qua GET /api/v1/auth/me; kết nối 1-click Demo tài khoản thật trong MySQL (khang.candidate@talentbridge.vn và khang.recruiter@talentbridge.vn).
Modal Đăng tin (PostJobModal.tsx): Kết nối form đăng tin trực tiếp vào POST /api/v1/jobs, lưu dữ liệu thực tế vào bảng jobs MySQL.
Modal Quản lý Đơn nộp (AppliedJobsModal.tsx): Tự động đồng bộ và hiển thị đơn nộp thời gian thực từ GET /api/v1/applications/me với badge trạng thái (Mời phỏng vấn, Đang duyệt hồ sơ, Đã nhận Offer) và điểm AI Screening Score.

3. Kết quả đạt được (Deliverables)
Mã nguồn hoàn thiện:
Backend: Trọn bộ mã nguồn Spring Boot 3 tại thư mục backend/ (Controllers, Services, DTOs, Entities, Repositories, Security Config, JWT Helper, Exceptions).
Frontend: Các component tích hợp API thực tế (src/services/api.ts, src/context/AuthContext.tsx, src/components/home/AuthModal.tsx, src/components/home/PostJobModal.tsx, src/components/profile/AppliedJobsModal.tsx).
Kiểm thử hệ thống:
Bộ test tự động JUnit 5 + MockMvc đạt 18/18 test case passed (100%).
Lệnh npm run build trên Frontend chạy thành công, đạt 0 lỗi TypeScript / ESLint, bundle trong 1.03s.
Tài liệu & Công cụ:
Swagger UI OpenAPI 3.0 trực quan tại http://localhost:8080/swagger-ui/index.html.
Postman Collection: docs/TalentBridge_API_Postman_Collection.json.
Lịch sử Git Repository (Commit chuẩn từng luồng riêng biệt):
feat(auth): Triển khai luồng xác thực JWT, HttpOnly Cookies, BCrypt, OAuth2 (aa7eae7).
feat(crud): Hoàn thiện toàn diện CRUD cho Jobs, Applications, Companies, Users và RBAC (1848dd4).
test(backend): Bộ test JUnit 5 & MockMvc (18/18 passed) và Postman Collection (cae4462).
fix(services): Khắc phục quan hệ khóa ngoại recruiterProfileId (1734549).
fix(jobs): Chuẩn hóa enum danh mục kỹ năng và cờ kích hoạt (6e14224).
fix(security): Mở quyền truy cập công khai cho endpoint quick-apply (4bd510f).
feat(frontend): Tích hợp trực tiếp xác thực, HttpOnly Cookies và các thao tác CRUD với backend (e66e6a6).

4. Khó khăn gặp phải & Hướng giải quyết
Khó khăn 1 (Rủi ro bảo mật lưu trữ JWT ở LocalStorage & Tấn công CSRF): Lưu token ở localStorage có nguy cơ bị đánh cắp qua XSS; dùng Cookie thuần túy có nguy cơ bị CSRF và khó kiểm thử trên Swagger/Postman.
Giải pháp: Thiết kế kiến trúc bảo mật lai (Dual-Token Architecture): Backend cấp phát JWT Access Token và Refresh Token đồng thời qua HttpOnly Cookie (SameSite=Lax, Path=/) và trong body phản hồi. Frontend kích hoạt credentials: 'include' kết hợp đính kèm header Authorization: Bearer <token> từ memory/storage, tạo thành lớp phòng thủ chiều sâu (Defense-in-Depth).
Khó khăn 2 (Ràng buộc khóa ngoại khi tạo mới tin tuyển dụng từ tài khoản Recruiter): Bảng jobs trong MySQL tham chiếu khóa ngoại đến recruiter_profiles.id, trong khi thông tin xác thực từ Token chỉ cung cấp users.id. Khi recruiter đăng tin trực tiếp gây lỗi vi phạm ràng buộc khóa ngoại (Foreign Key Constraint Violation).
Giải pháp: Tại JobServiceImpl, bổ sung bước tra cứu ánh xạ tự động recruiterProfileRepository.findByUserId(userId). Nếu hồ sơ recruiter chưa tồn tại, hệ thống tự động khởi tạo profile mặc định trước khi liên kết, đảm bảo tính toàn vẹn của cơ sở dữ liệu.
Khó khăn 3 (Xung đột kiểu dữ liệu Enum khi tự động tạo mới kỹ năng skills): Khi nhà tuyển dụng nhập kỹ năng mới chưa có trong hệ thống, hàm auto-create gán giá trị danh mục là "Tech", trong khi cột category của bảng skills trong MySQL định nghĩa kiểu ENUM('PROGRAMMING_LANGUAGE', 'FRAMEWORK', 'DATABASE', 'CLOUD_DEVOPS', 'TESTING', 'METHODOLOGY', 'SOFT_SKILL', 'OTHER'), dẫn đến lỗi Data truncated for column 'category' at row 1.
Giải pháp: Điều chỉnh giá trị gán danh mục mặc định về "OTHER" đúng với định nghĩa enum của MySQL và bổ sung cờ isActive(true).
Khó khăn 4 (Chặn truy cập trái phép trên endpoint ứng tuyển nhanh): Endpoint POST /api/v1/applications/quick-apply dành cho ứng viên thao tác nhanh từ Landing Page bị cấu hình mặc định của Spring Security chặn lại bằng mã lỗi 401 Unauthorized.
Giải pháp: Bổ sung cấu hình .requestMatchers("/api/v1/applications/quick-apply").permitAll() trong SecurityConfig.java, cho phép ứng viên nộp hồ sơ mà không bắt buộc phải đăng nhập trước, đồng thời giữ cơ chế kiểm tra chống nộp trùng lặp ở tầng Service.

5. Kế hoạch tuần 7 (Dự kiến: ATS Pipeline Kanban, Quản lý Hồ sơ CV & Chuẩn bị Tích hợp AI)
5.1. Xây dựng phân hệ Quản lý Tuyển dụng Kanban (ATS Pipeline Kanban)
Thiết kế giao diện kéo thả (Drag-and-Drop) quản lý ứng viên theo các cột trạng thái (Ứng tuyển mới, Đã sàng lọc AI, Phỏng vấn, Gửi Offer, Từ chối).
Xây dựng API cập nhật vị trí và giai đoạn tuyển dụng theo thời gian thực (PATCH /api/v1/applications/:id/stage).
5.2. Xây dựng phân hệ Quản lý Hồ sơ Ứng viên (Candidate Profile & CV Management)
Giao diện quản lý thông tin cá nhân, kinh nghiệm làm việc, học vấn, dự án và kỹ năng chuyên môn.
Xây dựng tính năng tải lên và quản lý nhiều phiên bản CV (PDF/DOCX), hỗ trợ xem trước (Preview) tài liệu trực tiếp trên trình duyệt.
5.3. Nghiên cứu & Chuẩn bị Pipeline Tích hợp Trí tuệ nhân tạo (Phase 4 AI Integration)
Thiết kế kiến trúc CV Parser sử dụng Google Gemini AI API: Trích xuất thông tin phi cấu trúc từ file CV thành cấu trúc JSON chuẩn hóa (Skills, Work Experience, Education, Projects).
Xây dựng prompt templates phục vụ tính toán điểm tương thích ATS Match Score và phân tích lỗ hổng kỹ năng (Skill Gap Analysis).

AI hỗ trợ
Google Antigravity
Gemini 3.8 Flash
Prompt
"Tư vấn thiết kế kiến trúc bảo mật xác thực kép JWT + Refresh Token Rotation lưu trong HttpOnly Cookie (SameSite=Lax) kết hợp Authorization Header trên Spring Boot 3 và Spring Security 6."
"Gợi ý cấu trúc GlobalExceptionHandler chuẩn RESTful API với Spring Web @RestControllerAdvice và ApiResponse generic DTO."
"Hỗ trợ viết bộ test tự động MockMvc với JUnit 5 kiểm thử phân quyền Role-Based Access Control (RBAC) chặn quyền truy cập 401 và 403."
"Tư vấn phương án cấu hình CORS và proxy Vite để gửi kèm HttpOnly Cookie (credentials: 'include') an toàn giữa Frontend React và Backend Spring Boot."
"Tra cứu nguyên nhân và giải pháp cho lỗi MySQL Data truncated for column 'category' khi thực hiện persist entity Skill trong JPA Hibernate."
AI tạo ra
Khung code mẫu (boilerplate) cho JwtAuthenticationFilter, JwtCookieHelper và cấu trúc SecurityConfig chuẩn Spring Security 6 stateless.
Cấu trúc mẫu cho các lớp DTO (JobCreateRequestDto, AuthResponseDto, ApiResponse<T>).
Đoạn mã mẫu kịch bản kiểm thử MockMvc cho các phương thức xác thực và kiểm tra vai trò người dùng (RBAC).
Gợi ý cấu hình corsConfigurationSource() với allowCredentials(true) và cấu hình proxy server trong file vite.config.ts.
SV đã sửa
Trực tiếp thiết kế và tinh chỉnh cơ chế bảo mật HttpOnly Cookie: Bổ sung cấu hình đường dẫn path riêng biệt (/api/v1/auth) cho Refresh Token, tích hợp cơ chế tự động dọn sạch Cookie khi Đăng xuất (Set-Cookie Max-Age=0).
Tự tay debug và khắc phục các lỗi nghiệp vụ cơ sở dữ liệu: Fix lỗi vi phạm khóa ngoại recruiterProfileId khi recruiter đăng tin tuyển dụng, chuẩn hóa giá trị Enum cho bảng skills về đúng tập giá trị MySQL ('OTHER') và kích hoạt cờ isActive=true.
Cấu hình phân quyền chuẩn xác trên Spring Security: Bổ sung quyền truy cập công khai cho endpoint quick-apply, thiết lập đầy đủ @PreAuthorize theo từng role cụ thể (ROLE_CANDIDATE, ROLE_RECRUITER, ROLE_ADMIN).
Hoàn thiện tích hợp End-to-End vào Frontend: Viết lại toàn bộ tầng client api.ts, nâng cấp AuthContext.tsx tự động phục hồi phiên và đồng bộ dữ liệu thực tế từ MySQL thay vì mock data, kết nối các modal Đăng tin tuyển dụng và Quản lý Đơn nộp.
Tổ chức quy chuẩn Git Workflow: Phân tách toàn bộ quá trình phát triển thành các commit riêng biệt theo chuẩn Conventional Commits trên GitHub repository (không dồn nhiều luồng vào 1 commit).
