# BÁO CÁO TIẾN ĐỘ TUẦN 1

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Khảo sát quy trình tuyển dụng thực tế, Phân tích yêu cầu chức năng & phi chức năng, Lập kế hoạch chi tiết và Lộ trình phát triển 4 Phase  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 1
- Khảo sát các quy trình tuyển dụng thực tế và phân tích benchmark các nền tảng tuyển dụng hàng đầu (TopCV, VietnamWorks, LinkedIn, Greenhouse, Lever).
- Xác định và phân loại các tác nhân hệ thống (Stakeholders: Ứng viên, Doanh nghiệp/Nhà tuyển dụng, Quản trị viên).
- Thu thập, phân loại và đặc tả các yêu cầu chức năng (Functional Requirements) và yêu cầu phi chức năng (Non-Functional Requirements).
- Xây dựng lộ trình tổng thể (Scope & Roadmap) phân bổ 4 giai đoạn phát triển (Phase 1 đến Phase 4) cho đề tài.
- Khởi tạo cấu trúc tài liệu kỹ thuật dự án và lưu trữ toàn bộ hồ sơ phân tích tại thư mục `docs/phase-1-requirements/`.

___

## 2. Các công việc đã hoàn thành

### 2.1. Khảo sát quy trình tuyển dụng & Nghiên cứu thị trường
- Hoàn thành tài liệu phân tích quy trình tuyển dụng tổng thể (`01_RECRUITMENT_PROCESS_ANALYSIS.md`): mô hình hóa các giai đoạn từ đăng tin tuyển dụng, tiếp nhận CV, sàng lọc tự động, tổ chức phỏng vấn đến phát hành offer.
- Hoàn thành tài liệu nghiên cứu thị trường (`02_BENCHMARK_AND_MARKET_RESEARCH.md`): đánh giá chi tiết tính năng, ưu nhược điểm của các hệ thống trong nước và quốc tế để định hình tính năng cạnh tranh cho TalentBridge.

### 2.2. Phân tích đối tượng người dùng & Xây dựng chân dung
- Biên soạn tài liệu phân tích tác nhân (`03_STAKEHOLDERS_AND_PERSONAS.md`): xác định 3 nhóm người dùng mục tiêu với nhu cầu riêng biệt (Ứng viên tìm việc, Nhà tuyển dụng/Chuyên viên tuyển mộ, Quản trị viên hệ thống).
- Xây dựng kịch bản trải nghiệm người dùng mẫu nhằm tối ưu hóa các điểm chạm trong quy trình nộp đơn và quản trị hồ sơ.

### 2.3. Đặc tả yêu cầu chức năng & Phi chức năng
- Hoàn thiện tài liệu yêu cầu chức năng (`04_FUNCTIONAL_REQUIREMENTS.md`): định nghĩa chi tiết các nhóm tính năng cốt lõi (Xác thực, Tìm kiếm việc làm, Quản lý hồ sơ ứng viên, Quản trị tin đăng, Phễu tuyển dụng Kanban, Nhắn tin, Tính năng AI).
- Hoàn thiện tài liệu yêu cầu phi chức năng (`05_NON_FUNCTIONAL_REQUIREMENTS.md`): thiết lập các chỉ số kỹ thuật về hiệu năng phản hồi (< 200ms API), bảo mật dữ liệu cá nhân, khả năng chịu tải và chuẩn trợ năng WCAG 2.1 AA.

### 2.4. Xác định phạm vi dự án & Lộ trình phát triển 4 Phase
- Biên soạn tài liệu lộ trình (`06_SCOPE_AND_ROADMAP.md`): phân chia rạch ròi 4 giai đoạn phát triển:
  - Phase 1: Phân tích nghiệp vụ & Đặc tả yêu cầu hệ thống.
  - Phase 2: Thiết kế kiến trúc tổng thể, mô hình Use Case và Cơ sở dữ liệu quan hệ MySQL.
  - Phase 3: Lập trình hệ thống Core ATS, Email giao dịch, STOMP WebSocket và Phân quyền doanh nghiệp.
  - Phase 4: Nghiên cứu và tích hợp Trí tuệ nhân tạo (AI Resume Parser, ATS Match Score, AI Copilot).

___

## 3. Kết quả đạt được (Deliverables)
- **Tài liệu đặc tả**: Trọn bộ 6 tài liệu phân tích yêu cầu chuẩn IEEE 830 được lưu trữ bài bản tại thư mục `docs/phase-1-requirements/`.
- **Kế hoạch dự án**: Bảng phân rã công việc (WBS) và mốc thời gian biểu chi tiết theo từng tuần.
- **Git Repository**: Khởi tạo kho mã nguồn dự án trên GitHub và commit lưu trữ toàn bộ hệ thống tài liệu đặc tả ban đầu (`67bb96a`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn**: Quy trình tuyển dụng doanh nghiệp thực tế rất đa dạng với nhiều vòng phỏng vấn, nhiều cấp phê duyệt, dễ gây phình to phạm vi đề tài vượt quá thời gian cho phép.
  - *Giải pháp*: Áp dụng ma trận ưu tiên MoSCoW (Must-have, Should-have, Could-have, Won't-have) để chọn lọc các luồng nghiệp vụ cốt lõi theo chuẩn Greenhouse ATS, đảm bảo tính khả thi cao nhất cho đồ án.

___

## 5. Kế hoạch tuần 2 (Dự kiến: Thiết kế Sơ đồ Ca sử dụng & Cơ sở Dữ liệu Quan hệ MySQL)
### 5.1. Thiết kế Sơ đồ Ca sử dụng (Use Case Modeling)
- Thiết kế sơ đồ Use Case tổng thể và phân rã ca sử dụng chi tiết cho từng tác nhân (Ứng viên, Nhà tuyển dụng, Quản trị viên) bằng công cụ Enterprise Architect.
- Đặc tả kịch bản Use Case chi tiết (luồng chính, luồng phụ, tiền/hậu điều kiện) cho các chức năng trọng yếu.
### 5.2. Thiết kế Mô hình Cơ sở Dữ liệu Quan hệ (ERD & Database Design)
- Thiết kế mô hình dữ liệu quan hệ thực thể đạt chuẩn chuẩn hóa bậc 3 (3NF).
- Viết tập lệnh DDL khởi tạo 29 bảng MySQL 8.0, thiết lập khóa chính, khóa ngoại, chỉ mục đánh chỉ mục tìm kiếm và tạo tập dữ liệu mẫu ban đầu (Seed Data).

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 3.8 Flash**

### Prompt
- "Tư vấn cấu trúc tài liệu đặc tả yêu cầu phần mềm chuẩn IEEE 830 cho hệ thống quản lý tuyển dụng việc làm ATS doanh nghiệp."
- "Gợi ý các yêu cầu phi chức năng (NFR) quan trọng về bảo mật thông tin cá nhân và hiệu năng tải trang cho nền tảng tuyển dụng."
- "Tư vấn cách phân chia phạm vi tính năng theo phương pháp MoSCoW cho đồ án phát triển nền tảng tuyển dụng trong 10 tuần."

### AI tạo ra
- Khung mục lục chuẩn hóa cho bộ tài liệu yêu cầu SRS (Phạm vi, Tác nhân, Nhóm chức năng, Ràng buộc kỹ thuật).
- Bảng gợi ý các chỉ số yêu cầu phi chức năng về thời gian phản hồi API, tiêu chuẩn mã hóa mật khẩu và kiểm soát truy cập.

### SV đã sửa
- Trực tiếp khảo sát thực tế và đối chiếu quy trình nghiệp vụ của các cổng tuyển dụng hàng đầu tại Việt Nam (TopCV, VietnamWorks) để điều chỉnh các luồng ứng tuyển phù hợp với thói quen người dùng Việt.
- Tự tay chọn lọc và cắt giảm các tính năng quá phức tạp ngoài phạm vi đồ án sinh viên (như tích hợp cổng thanh toán ngân hàng phức tạp), tập trung tối đa vào trải nghiệm ATS và tính năng hỗ trợ thông minh.
