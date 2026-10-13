# BÁO CÁO TIẾN ĐỘ TUẦN 8

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Xây dựng Dịch vụ Email giao dịch & Lịch phỏng vấn (.ics RFC 5545), Kênh nhắn tin thời gian thực (STOMP WebSocket), Phân quyền Đội ngũ tuyển dụng (RBAC), Bảng đánh giá Rubric Scorecard và Kiểm thử tự động toàn trình (Playwright E2E)  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 8
- Xây dựng dịch vụ Email giao dịch tự động tích hợp gửi tệp sự kiện lịch iCalendar (.ics) chuẩn RFC 5545 phục vụ gửi thư mời phỏng vấn và thêm sự kiện 1 chạm vào Google/Outlook Calendar.
- Triển khai kênh nhắn tin hai chiều thời gian thực STOMP over WebSocket (`/ws`), tích hợp bộ chặn bảo mật xác thực JWT và kiểm tra quyền sở hữu đơn nộp chống lỗ hổng IDOR.
- Phát triển phân hệ Đội ngũ tuyển dụng doanh nghiệp (Hiring Team) với cơ chế phân quyền RBAC đa cấp bậc: Quản trị viên (`ROLE_ADMIN`), Chuyên viên tuyển dụng (`ROLE_RECRUITER`), Người phỏng vấn (`ROLE_INTERVIEWER`).
- Xây dựng luồng mời thành viên qua One-Time Token 256-bit hạn 7 ngày (`/invite/:token`) và màn hình kích hoạt tài khoản trực tuyến.
- Triển khai Bảng đánh giá năng lực Rubric Scorecards 4 chiều chuẩn Greenhouse kèm khuyến nghị tuyển dụng, và hệ thống Ghi chú nội bộ phân cấp bảo mật (Shared / Private Notes).
- Hoàn thiện các trang quản trị: Lịch phỏng vấn tổng hợp (`/employer/interviews`), Hồ sơ công ty (`/employer/company`), Đổi mật khẩu an toàn (`/profile#security`).
- Kiểm thử tự động hóa toàn diện với Playwright E2E và JUnit 5 (đạt 100% test pass), xuất bản 4 tài liệu kỹ thuật tại `docs/phase-3-implementation/`.

___

## 2. Các công việc đã hoàn thành

### 2.1. Dịch vụ Email Giao dịch Tự động & Sinh Tệp Lịch (.ics RFC 5545)
- **Kiến trúc Hướng sự kiện (Event-Driven)**: Tích hợp Spring `ApplicationEventPublisher` và `TransactionalEmailListener` (`@Async`) tách rời I/O mạng SMTP, đảm bảo phản hồi HTTP dưới 100ms.
- **Tự động sinh file iCalendar (.ics)**: Tạo tệp đính kèm chuẩn RFC 5545 chứa thông tin buổi phỏng vấn (thời gian UTC, link Google Meet, địa điểm), đính kèm trực tiếp vào email gửi ứng viên.
- **Xác thực tự động qua MailDev**: Kiểm thử và xác thực gửi/nhận email tự động 100% qua máy chủ MailDev v3 (SMTP 1025, REST API 1080).

### 2.2. Hệ thống Nhắn tin Thời gian thực STOMP over WebSocket (/ws)
- **Cấu hình STOMP Message Broker**: Thiết lập kênh `/topic` và `/app` trên nền Spring WebSocket, hỗ trợ kết nối hai chiều full-duplex và fallback SockJS.
- **Bảo mật chống IDOR với StompAuthChannelInterceptor**: Bắt chặn và giải mã JWT tại lệnh `CONNECT`, kiểm tra chéo quyền sở hữu `JobApplication` tại lệnh `SUBSCRIBE` để ngăn chặn rò rỉ tin nhắn giữa các ứng viên.
- **Giao diện Dual-Pane chuyên nghiệp (`/messages`)**: Danh sách hội thoại theo đơn nộp, xem trước tin nhắn, badge đếm tin chưa đọc trên Navbar, trạng thái đã xem (`CheckCheck`), hỗ trợ phím tắt `Enter`/`Shift+Enter`.

### 2.3. Phân hệ Đội ngũ Tuyển dụng Doanh nghiệp & Phân quyền RBAC Đa cấp
- **Nâng cấp CSDL qua Flyway V2**: Bổ sung bảng `company_team_members` và `company_team_invitations`, thiết lập ma trận phân quyền 3 vai trò nội bộ (`ADMIN`, `RECRUITER`, `INTERVIEWER`).
- **Luồng mời thành viên an toàn**: Sinh mã ngẫu nhiên 256-bit từ `SecureRandom` thời hạn 7 ngày, gửi link qua email; trang `/invite/:token` cho phép thành viên tự đặt mật khẩu và tự động đăng nhập.

### 2.4. Bảng Đánh Giá Rubric Scorecards & Ghi Chú Nội Bộ Bảo Mật
- **Bảng điểm Rubric 4 chiều (Greenhouse Standard)**: Đánh giá Năng lực chuyên môn, Kỹ năng giao tiếp, Giải quyết vấn đề, Phù hợp văn hóa (1-5 sao) kèm khuyến nghị tuyển dụng (`STRONG_HIRE`, `HIRE`, `NEUTRAL`, `NO_HIRE`, `STRONG_NO_HIRE`).
- **Hệ thống Ghi chú nội bộ phân cấp**: Ghi chú toàn đội ngũ (Shared Notes) và Ghi chú riêng tư (Private Notes - bảo vệ bằng cờ `is_private`, chỉ tác giả và `ADMIN` xem được).

### 2.5. Các Trang Quản Trị Nghiệp Vụ Doanh Nghiệp & Bảo Mật
- **Lịch phỏng vấn tổng hợp (`/employer/interviews`)**: Quản lý tập trung các buổi phỏng vấn sắp diễn ra, phân loại theo ngày và người chấm điểm.
- **Hồ sơ công ty (`/employer/company`)**: Cập nhật thông tin giới thiệu, quy mô, địa chỉ trụ sở và website chính thức.
- **Đổi mật khẩu an toàn (`/profile#security`)**: Xác thực mật khẩu cũ, kiểm tra độ mạnh mật khẩu mới và mã hóa BCrypt.

### 2.6. Kiểm thử tự động hóa & Xuất bản Tài liệu Kỹ thuật
- **Kiểm thử E2E Playwright**: Xây dựng mới `test_phase_f_enterprise_flow.cjs` đạt 18/18 checks passed (100%), kiểm tra toàn trình từ mời thành viên, bắt email, kích hoạt tài khoản, lên lịch phỏng vấn đến chat thời gian thực.
- **Kiểm thử hồi quy & biên dịch**: 100% test pass trên toàn bộ 8 bộ test, TypeScript 0 lỗi (`npx tsc -b`), Backend JUnit đạt 18/18 tests passed.
- **Tài liệu hóa**: Xuất bản 4 tài liệu kỹ thuật chi tiết tại `docs/phase-3-implementation/` (Email, STOMP WebSocket, RBAC Team, API Specification).

___

## 3. Kết quả đạt được (Deliverables)
- **Mã nguồn hoàn thiện**:
  - Backend: Controllers, Services, DTOs, `StompAuthChannelInterceptor`, `TransactionalEmailListener`, Flyway V2 migration tại thư mục `backend/`.
  - Frontend: Các giao diện `TeamManagement`, `AcceptInvite`, `EmployerInterviews`, `CompanyProfile`, `ChatPage`, `RubricScorecardModal`, `ScheduleInterviewModal`.
- **Kiểm thử hệ thống**:
  - Bộ test mới `test_phase_f_enterprise_flow.cjs` đạt 18/18 checks passed (100%).
  - Bộ test Backend JUnit 5 đạt 18/18 test case passed (100%), lệnh `npx tsc -b` đạt 0 lỗi TypeScript.
- **Tài liệu & Công cụ**:
  - Hệ thống 4 tài liệu kỹ thuật Phase 3 tại thư mục `docs/phase-3-implementation/`.
  - Swagger UI OpenAPI 3.0 trực quan tại `http://localhost:8080/swagger-ui/index.html`.
- **Lịch sử Git Repository (Commit chuẩn từng luồng riêng biệt)**:
  - `feat(phase-3)`: Triển khai đội ngũ tuyển dụng, email với .ics, realtime messaging và tài liệu kỹ thuật (`7c5a928`).
  - `feat(i18n)`: Bản địa hóa song ngữ toàn diện (VI 🇻🇳 ↔ EN 🇬🇧) trên toàn bộ hệ thống (`56d5da6`).
  - `feat(i18n)`: Khôi phục nút chuyển đổi ngôn ngữ trên Navbar, Mobile Drawer và Footer (`453d1df`).
  - `feat`: Hoàn thiện giao diện Master-Detail 2 cột chia đôi màn hình (`24bcdaa`).
  - `feat(tracker)`: Tiến trình tuyển dụng 5 giai đoạn tương tác kèm cam kết SLA (`6b3f7cb`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn 1 (Tắc nghẽn I/O khi gửi email đồng bộ trong luồng xử lý HTTP)**: Gửi email qua SMTP mất 1-3 giây khiến người dùng chờ lâu và nguy cơ timeout kết nối.
  - *Giải pháp*: Chuyển sang Kiến trúc Hướng sự kiện với Spring `ApplicationEventPublisher`. Controller phát Domain Event rồi phản hồi 201 Created tức thì (< 100ms); `TransactionalEmailListener` (`@Async`) chạy ngầm trong Thread Pool riêng để gửi email.
- **Khó khăn 2 (Nguy cơ rò rỉ dữ liệu qua kênh WebSocket STOMP - Lỗ hổng IDOR)**: Nếu chỉ xác thực JWT khi CONNECT, client sau khi đăng nhập có thể subscribe trộm vào topic `/topic/applications/{id}/messages` của người khác.
  - *Giải pháp*: Xây dựng `StompAuthChannelInterceptor` cài đặt `ChannelInterceptor`. Tại lệnh SUBSCRIBE, bóc tách `applicationId` và kiểm tra chéo với CSDL: chỉ chủ sở hữu đơn nộp hoặc ban tuyển dụng công ty mới được đăng ký kênh, ngược lại ném `AccessDeniedException`.
- **Khó khăn 3 (Tính bảo mật của quy trình mời thành viên vào ban tuyển dụng)**: Tạo sẵn tài khoản với mật khẩu mặc định hoặc gửi liên kết không có hạn dùng sẽ tiềm ẩn rủi ro bị chiếm đoạt.
  - *Giải pháp*: Thiết kế One-Time Invite Token ngẫu nhiên 256-bit từ `SecureRandom` với thời hạn 7 ngày. Khi truy cập `/invite/:token`, thành viên tự đặt mật khẩu mới; token chuyển trạng thái `ACCEPTED` ngay sau khi kích hoạt thành công.
- **Khó khăn 4 (Bảo mật và phân quyền ghi chú nội bộ nhạy cảm)**: Ghi chú phỏng vấn vừa có nhận xét chuyên môn (cần chia sẻ cho hội đồng), vừa có nhận xét nhạy cảm về mức lương/tính cách (chỉ Admin hoặc người viết xem được).
  - *Giải pháp*: Bổ sung trường `is_private` vào bảng `application_notes`. Tại `NoteService`, nếu `is_private = true`, chỉ tác giả hoặc user có role `ADMIN` mới được đọc; Interviewer khác chỉ nhận danh sách Shared Notes.

___

## 5. Kế hoạch tuần 9 (Dự kiến: Tích hợp Trí tuệ Nhân tạo AI & Nâng cấp Trải nghiệm Tuyển dụng)
### 5.1. Nghiên cứu & Tích hợp Trí tuệ Nhân tạo (Phase 4 AI Integration)
- Tích hợp Google Gemini AI API cho tính năng AI Resume Parser: Tự động trích xuất thông tin từ file PDF/DOCX CV thành cấu trúc JSON chuẩn hóa (Kỹ năng, Kinh nghiệm, Học vấn, Dự án).
- Xây dựng thuật toán tính điểm tương thích ATS (ATS Match Score) và Phân tích lỗ hổng kỹ năng (Skill Gap Analysis) giữa hồ sơ ứng viên và bản mô tả công việc (JD).
- Phát triển tính năng AI Cover Letter Generator hỗ trợ ứng viên tự động sinh thư ứng tuyển cá nhân hóa theo từng vị trí việc làm.
### 5.2. Xây dựng Trung tâm Thông báo & Bảng Thống kê Tuyển dụng (Recruitment Analytics)
- Xây dựng hệ thống Thông báo thời gian thực (In-App Real-time Notifications) cho các sự kiện: lời mời phỏng vấn, tin nhắn mới, cập nhật trạng thái hồ sơ.
- Xây dựng Dashboard thống kê tuyển dụng cho Doanh nghiệp: biểu đồ phễu chuyển đổi ứng viên qua các vòng (Hiring Funnel), số lượng hồ sơ tiếp nhận theo tuần và phân tích tỷ lệ đạt yêu cầu.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 3.8 Flash**

### Prompt
- "Tư vấn thiết kế kiến trúc gửi email giao dịch bất đồng bộ (@Async) trong Spring Boot 3 sử dụng Spring ApplicationEventPublisher và JavaMailSender."
- "Hướng dẫn cú pháp tệp sự kiện lịch iCalendar (.ics) theo chuẩn RFC 5545 cho buổi phỏng vấn trực tuyến với link Google Meet và thời gian UTC."
- "Tư vấn phương án bắt chặn bảo mật kênh WebSocket STOMP với StompAuthChannelInterceptor để kiểm tra quyền truy cập topic theo applicationId (chống IDOR)."
- "Gợi ý cấu trúc bảng điểm đánh giá phỏng vấn Rubric Scorecard chuẩn Greenhouse với 4 chiều năng lực và 5 mức khuyến nghị tuyển dụng."
- "Hỗ trợ xây dựng kịch bản kiểm thử End-to-End với Playwright kiểm tra luồng mời thành viên, bắt email qua MailDev, kích hoạt tài khoản và chat thời gian thực."

### AI tạo ra
- Khung mã nguồn cơ bản (boilerplate) cho `WebSocketConfig`, `AsyncConfig`, `TransactionalEmailListener` và `StompAuthChannelInterceptor`.
- Mẫu định dạng chuỗi iCalendar (`.ics`) RFC 5545 với các thuộc tính `VCALENDAR`, `VEVENT`, `DTSTART`, `DTEND`, `UID`.
- Bộ khung kịch bản kiểm thử Playwright cho các thao tác điền form và bắt sự kiện qua cổng REST của MailDev.
- Cấu trúc mẫu cho các lớp DTO: `TeamDtos`, `InterviewDtos`, `MessageDtos`, `NoteDtos`.

### SV đã sửa
- Trực tiếp thiết kế và hoàn thiện logic bảo mật bắt chặn STOMP: Bổ sung bước kiểm tra chéo người dùng với quyền sở hữu `JobApplication` trong cơ sở dữ liệu, chặn hoàn toàn việc người lạ subscribe vào kênh chat nội bộ của doanh nghiệp.
- Tự tay lập trình thuật toán sinh tệp lịch `.ics` chuẩn RFC 5545: Xử lý định dạng thời gian chuẩn UTC (`Z`), tích hợp linh hoạt link Google Meet và địa chỉ văn phòng, xử lý cơ chế cập nhật/hủy lịch với `METHOD:REQUEST` và `METHOD:CANCEL`.
- Thiết kế và tối ưu hóa trải nghiệm giao diện Dual-Pane cho trang tin nhắn (`/messages`): Tự động tạo thread dự phòng khi người dùng điều hướng từ danh sách ứng viên, bổ sung phím tắt `Enter`/`Shift+Enter`, tích hợp trạng thái đã xem (`CheckCheck`) và huy hiệu số tin chưa đọc trên Navbar.
- Xây dựng và tinh chỉnh bộ kịch bản kiểm thử tự động Playwright `test_phase_f_enterprise_flow.cjs`: Xử lý chuẩn xác các bộ chọn DOM (`data-testid`), cơ chế đợi phản hồi mạng (`waitForResponse`), bắt chính xác token lời mời từ MailDev v3 và khôi phục an toàn mật khẩu tài khoản test sau khi hoàn tất.
- Xuất bản toàn bộ hệ thống tài liệu kỹ thuật chi tiết tại thư mục `docs/phase-3-implementation/` và cập nhật báo cáo tiến độ tuần theo quy chuẩn học thuật nghiêm ngặt.
