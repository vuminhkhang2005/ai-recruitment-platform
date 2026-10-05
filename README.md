# TalentBridge - Nền Tảng Tuyển Dụng Việc Làm IT Thực Tế

TalentBridge là nền tảng tuyển dụng việc làm IT tại Việt Nam được xây dựng theo phong cách và mô hình vận hành của **ITviec / TopCV / LinkedIn**, tối ưu trải nghiệm thực tế cho cả Ứng viên (Candidate) và Nhà tuyển dụng (Recruiter).

---

## 1. Kiến Trúc & Công Nghệ

- **Backend**: Spring Boot 3.3.3, Java 22, Spring Data JPA, Spring Security (JWT), MySQL (`ai_recruitment_db`).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router.
- **Xác thực & Phân quyền**: RBAC chặt chẽ (`ROLE_CANDIDATE`, `ROLE_RECRUITER`) với route guards (`<RequireRole>`).
- **Lưu trữ tệp tin**: Upload và phục vụ CV an toàn qua endpoint xác thực `/api/v1/cvs/{id}/file`.

---

## 2. Tài Khoản Demo (Mật khẩu: `Password@123`)

| Vai trò | Email đăng nhập | Quyền hạn & Chức năng |
| :--- | :--- | :--- |
| **Ứng viên (Candidate)** | `nguyenvanan.it@gmail.com` | Quản lý CV (upload PDF/DOCX), chỉnh sửa kỹ năng, nộp hồ sơ vào tin tuyển dụng, theo dõi trạng thái hồ sơ theo thời gian thực (Đã nộp → Xem xét → Phỏng vấn → Offer / Chưa phù hợp), rút hồ sơ, lưu việc làm, nhận thông báo chuông. |
| **Nhà tuyển dụng (Recruiter)** | `recruiter.vng@vng.com.vn` | Quản lý tin tuyển dụng công ty (VNG Corporation), đăng tin mới / sửa tin (kèm kiểm tra hợp lệ lương, hạn nộp, kỹ năng), tạm dừng / mở lại / đóng tin / xóa tin, xem pipeline ứng viên, xem file CV đính kèm, chuyển vòng ứng tuyển và gửi lý do từ chối. |

---

## 3. Hướng Dẫn Khởi Chạy

### 3.1. Khởi động Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```
Backend lắng nghe tại: `http://localhost:8080/api/v1`

### 3.2. Khởi động Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```
Frontend lắng nghe tại: `http://localhost:5173`

### 3.3. Dữ liệu mẫu & Bảo trì cơ sở dữ liệu

Khi cần làm mới hạn nộp các tin tuyển dụng mẫu, cập nhật điểm khớp kỹ năng thực tế, hoặc nạp mô tả công việc phong phú:

```bash
mysql -u root -p ai_recruitment_db < docs/phase-2-design/04_DEMO_DATA_REFRESH.sql
```

---

## 4. Hệ Thống Định Tuyến (Sitemap)

### Công khai (Public)
- `/`: Trang chủ tìm kiếm việc làm, công ty hàng đầu, việc làm mới nhất.
- `/jobs`: Danh sách việc làm có bộ lọc theo từ khóa, thành phố, cấp bậc, hình thức làm việc.
- `/jobs/:id`: Chi tiết tin tuyển dụng (mô tả, yêu cầu, quyền lợi dạng bullet, bảng % khớp kỹ năng thực tế, modal ứng tuyển).
- `/companies`: Danh bạ công ty công nghệ kèm logo nhận diện.
- `/companies/:id`: Trang chi tiết công ty và danh sách việc làm đang mở.
- `/login`, `/register`: Đăng nhập, đăng ký phân tách rõ ràng vai trò Ứng viên / Nhà tuyển dụng.
- `/employers`: Trang giới thiệu giải pháp đăng tin và dịch vụ dành cho Nhà tuyển dụng.

### Dành cho Ứng viên (Candidate Only)
- `/profile`: Hồ sơ cá nhân, quản lý danh sách CV (upload file PDF/DOCX, đặt làm mặc định, xóa CV), chỉnh sửa kỹ năng và số năm kinh nghiệm.
- `/applications`: Danh sách hồ sơ đã ứng tuyển, hiển thị nhãn trạng thái trực quan, dòng thời gian (timeline) thay đổi trạng thái, lý do từ chối (nếu có), nút rút hồ sơ (cho các hồ sơ chưa xử lý sâu).
- `/saved-jobs`: Danh sách công việc đã lưu.

### Dành cho Nhà tuyển dụng (Recruiter Only)
- `/employer`: Dashboard quản lý tin tuyển dụng của công ty, thống kê số tin đang mở, tổng số hồ sơ, hồ sơ mới cần duyệt, danh sách tin kèm các hành động Sửa / Tạm dừng / Đóng tin / Mở lại / Xóa.
- `/employer/jobs/new`: Form đăng tin tuyển dụng mới với đầy đủ validation (lương min <= max, hạn nộp ở tương lai, tối thiểu 1 kỹ năng).
- `/employer/jobs/:id/edit`: Chỉnh sửa nội dung tin tuyển dụng.
- `/employer/applicants`: Quản lý ứng viên theo dạng Master-Detail: lọc theo tin tuyển dụng, lọc theo trạng thái vòng tuyển dụng, tìm kiếm tên/email, xem file CV đính kèm, chuyển vòng (Đang xem xét → Mời phỏng vấn → Gửi offer → Đã tuyển), từ chối kèm lý do phản hồi cho ứng viên.

### Công cụ nghề nghiệp (Tools)
- `/tools/salary`: **Công cụ tính lương Gross ⇄ Net chuẩn quy định lao động Việt Nam** (Áp dụng mức lương cơ sở mới nhất 2.340.000 đ từ 01/07/2024, giảm trừ bản thân 11 triệu, người phụ thuộc 4.4 triệu, biểu thuế lũy tiến từng phần 7 bậc, hỗ trợ tính hai chiều Gross → Net và Net → Gross, bảng phân tích chi phí người sử dụng lao động).
- `/tools/offer`: So sánh tổng thu nhập đãi ngộ (Total Compensation = Lương cứng + Lương tháng 13 + Thưởng KPI + Cổ phần/RSU + Phúc lợi) và gợi ý kịch bản trao đổi chuyên nghiệp.
- `/tools/cv-builder`: Trình soạn CV chuẩn định dạng ATS với gợi ý từ khóa kỹ năng theo vị trí.
- `/tools/coding`: Môi trường luyện tập thuật toán và đánh giá độ phức tạp Big-O.
- `/tools/roadmap`: Lộ trình phát triển kỹ năng tham khảo cho các vị trí công nghệ phổ biến.

---

## 5. Kiểm Thử Tự Động (Playwright E2E)

Các kịch bản kiểm thử tự động toàn diện được lưu tại thư mục `frontend/`:

```bash
cd frontend
# 1. Kiểm tra luồng công khai, tìm kiếm và định tuyến
node test_phase_b_public.cjs

# 2. Kiểm tra khu vực ứng viên: upload CV, kỹ năng, nộp hồ sơ, timeline
node test_phase_c_candidate.cjs

# 3. Kiểm tra khu vực nhà tuyển dụng: đăng/sửa tin, pipeline ứng viên, xem CV, từ chối
node test_phase_d_employer.cjs

# 4. Kiểm tra toàn trình End-to-End từ Ứng viên -> Nhà tuyển dụng -> Ứng viên
node test_phase_e_full_flow.cjs
```
Tất cả các bài kiểm thử đều đảm bảo thoát với mã 0 (`ALL CHECKS PASSED`) và không có lỗi console.
