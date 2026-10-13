# BÁO CÁO TIẾN ĐỘ TUẦN 2

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Thiết kế Sơ đồ Ca sử dụng (Use Case Diagrams), Thiết kế Mô hình Cơ sở Dữ liệu quan hệ 29 bảng MySQL 8.0 và Xây dựng DDL/Seed Data  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 2
- Thiết kế sơ đồ Ca sử dụng (Use Case Diagram) tổng thể và phân rã ca sử dụng chi tiết cho cả 3 tác nhân: Ứng viên, Nhà tuyển dụng và Quản trị viên trên phần mềm Enterprise Architect.
- Biên soạn tài liệu đặc tả kịch bản Use Case (luồng chính, luồng phụ, tiền/hậu điều kiện) cho các tính năng trọng yếu.
- Thiết kế mô hình dữ liệu quan hệ thực thể (ERD) đạt chuẩn chuẩn hóa bậc 3 (3NF) đáp ứng toàn diện các phân hệ của nền tảng TalentBridge.
- Viết tập lệnh DDL tạo cấu trúc 29 bảng MySQL 8.0 (`02_DATABASE_SCHEMA_DDL.sql`), thiết lập ràng buộc toàn vẹn khóa ngoại, chỉ mục tìm kiếm và tập dữ liệu mẫu ban đầu (`03_SEED_DATA.sql`).
- Lưu trữ toàn bộ hồ sơ thiết kế tại thư mục `docs/phase-1-requirements/` và `docs/phase-2-design/`.

___

## 2. Các công việc đã hoàn thành

### 2.1. Phân tích & Thiết kế Sơ đồ Ca sử dụng (Use Case Modeling)
- Xây dựng mô hình Use Case trên Enterprise Architect (`AI_TalentBridge_UseCases.eapx`): xuất bản sơ đồ Use Case tổng quát và 3 sơ đồ phân rã chi tiết cho từng tác nhân (Candidate, Recruiter, Admin).
- Hoàn thành tài liệu đặc tả Use Case (`07_USE_CASE_SPECIFICATIONS.md`): mô tả chi tiết 15 ca sử dụng cốt lõi bao gồm Đăng ký/Đăng nhập, Tìm kiếm việc làm, Nộp hồ sơ ứng tuyển, Đăng tin tuyển dụng, Quản lý ứng viên theo vòng và Đánh giá phỏng vấn.

### 2.2. Thiết kế Mô hình Cơ sở Dữ liệu Quan hệ (ERD - Database Design)
- Biên soạn tài liệu thiết kế CSDL (`docs/phase-2-design/01_DATABASE_DESIGN_DOCUMENT.md`): thiết kế cấu trúc chi tiết 29 bảng phân chia theo 6 phân hệ logic:
  - Phân hệ Người dùng & Xác thực: `users`, `roles`, `user_roles`, `user_tokens`.
  - Phân hệ Hồ sơ ứng viên: `candidate_profiles`, `resumes`, `skills`, `candidate_skills`, `work_experiences`, `educations`.
  - Phân hệ Việc làm & Kỹ năng: `jobs`, `job_skills`, `categories`, `job_categories`.
  - Phân hệ Đơn ứng tuyển & ATS: `job_applications`, `application_histories`, `application_interviews`.
  - Phân hệ Doanh nghiệp & Nhà tuyển dụng: `companies`, `recruiter_profiles`, `company_locations`.
  - Phân hệ Hệ thống & Tương tác: `saved_jobs`, `notifications`, `audit_logs`.

### 2.3. Xây dựng Script DDL & Dữ liệu Seed Data mẫu
- Viết tập lệnh DDL hoàn chỉnh (`02_DATABASE_SCHEMA_DDL.sql`): cấu hình kiểu dữ liệu tối ưu (UUID, VARCHAR, TEXT, ENUM, TIMESTAMP), thiết lập ràng buộc toàn vẹn tham chiếu `FOREIGN KEY ... ON DELETE CASCADE/RESTRICT`.
- Tối ưu hóa chỉ mục (Indexes): tạo chỉ mục kép trên các trường thường xuyên tìm kiếm và lọc (`job_id, skill_id`, `category_id, location`, `user_id, status`).
- Tạo tập dữ liệu mẫu (`03_SEED_DATA.sql`): nạp trước danh mục ngành nghề, hơn 50 kỹ năng công nghệ chuẩn hóa và các tài khoản demo kiểm thử.

___

## 3. Kết quả đạt được (Deliverables)
- **Tài liệu Use Case**: File thiết kế Enterprise Architect (`.eapx`), các sơ đồ PNG kết xuất và tài liệu đặc tả kịch bản Use Case tại `docs/phase-1-requirements/`.
- **Tài liệu & Schema CSDL**: Tài liệu thiết kế CSDL chi tiết (`01_DATABASE_DESIGN_DOCUMENT.md`), tệp lệnh DDL 29 bảng MySQL (`02_DATABASE_SCHEMA_DDL.sql`) và tập tin dữ liệu mẫu Seed Data (`03_SEED_DATA.sql`).
- **Git Repository**: Commit toàn bộ tài liệu thiết kế và kịch bản cơ sở dữ liệu lên kho mã nguồn (`67bb96a`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn**: Mối quan hệ nhiều-nhiều giữa Tin tuyển dụng (Jobs) và Kỹ năng yêu cầu (Skills) nếu chỉ lưu dạng chuỗi JSON hoặc text thô sẽ không thể thực hiện truy vấn so khớp (matching) và tìm kiếm nâng cao với hiệu năng cao.
  - *Giải pháp*: Chuẩn hóa bảng kỹ năng riêng biệt (`skills`) và xây dựng bảng liên kết trung gian `job_skills` có khóa chính phức hợp `(job_id, skill_id)` kèm chỉ mục kép, cho phép thực hiện các phép nối bảng (JOIN) cực nhanh khi lọc danh sách việc làm theo nhiều kỹ năng.

___

## 5. Kế hoạch tuần 3 (Dự kiến: Thiết lập Dự án Frontend & Xây dựng Giao diện Trang chủ Landing Page)
### 5.1. Khởi tạo Dự án Frontend & Cấu hình Design System
- Khởi tạo dự án Frontend React 19 kết hợp TypeScript và Vite; cấu hình Tailwind CSS theo bộ quy chuẩn thiết kế UI/UX Pro Max.
- Thiết lập bảng màu chủ đạo (Ocean Blue, AI Indigo, Dark Slate), cặp phông chữ Plus Jakarta Sans + Inter và thư viện icon Lucide.
### 5.2. Lập trình Giao diện Trang chủ (Landing Page/Homepage)
- Xây dựng Navbar kính mờ (Frosted Glass) hỗ trợ chuyển đổi giao diện Sáng/Tối (Light/Dark mode) và menu trượt trên mobile.
- Lập trình Hero Section với thanh tìm kiếm đa tiêu chí, thanh chỉ số uy tín (Stats Trust Bar), danh mục nghề nghiệp và danh sách việc làm nổi bật.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 3.8 Flash**

### Prompt
- "Tư vấn thiết kế mô hình dữ liệu quan hệ cho hệ thống tuyển dụng việc làm ATS doanh nghiệp đạt chuẩn chuẩn hóa bậc 3 (3NF)."
- "Gợi ý các trường dữ liệu và ràng buộc khóa ngoại tối ưu cho bảng jobs, skills và job_applications trong MySQL 8.0."
- "Tư vấn cách đánh chỉ mục (Index) hiệu quả trong MySQL cho bảng tin tuyển dụng khi có nhiều tiêu chí lọc như địa điểm, mức lương và danh mục nghề nghiệp."

### AI tạo ra
- Khung cấu trúc DDL mẫu cho các bảng chính `users`, `jobs`, `applications`, `skills`.
- Đoạn mã mẫu cú pháp tạo bảng trung gian với khóa chính phức hợp `PRIMARY KEY (job_id, skill_id)`.

### SV đã sửa
- Trực tiếp rà soát và chuẩn hóa lại toàn bộ kiểu dữ liệu cho 29 bảng theo chuẩn MySQL 8.0: bổ sung các kiểu ENUM chuyên biệt cho trạng thái đơn ứng tuyển, trạng thái việc làm.
- Bổ sung cấu trúc kiểm soát phiên đăng nhập an toàn (`user_tokens`) phục vụ cơ chế Refresh Token Rotation và cờ xóa mềm (`is_deleted`) cho các bảng dữ liệu trọng yếu.
