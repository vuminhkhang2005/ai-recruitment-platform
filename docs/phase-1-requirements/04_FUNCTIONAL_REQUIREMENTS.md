# TÀI LIỆU 04: ĐẶC TẢ YÊU CẦU CHỨC NĂNG HỆ THỐNG
# (FUNCTIONAL REQUIREMENTS SPECIFICATION - FRS)

---

## 1. PHÂN BỔ CÁC PHÂN HỆ HỆ THỐNG (SYSTEM MODULE TAXONOMY)

Toàn bộ hệ thống được chia thành 12 phân hệ chức năng tương ứng với các Bounded Contexts trong thiết kế Domain-Driven Design (DDD):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    HỆ THỐNG NỀN TẢNG AI-TALENTBRIDGE                             │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│    [PHÂN HỆ DÀNH CHO ỨNG VIÊN]│    [PHÂN HỆ TRÍ TUỆ NHÂN TẠO]    │ [PHÂN HỆ DÀNH CHO RECRUITER] │
│ • Candidate Profile & CV Mgmt │ • AI CV Parser & Extraction      │ • Job Posting & Lifecycle     │
│ • Job Discovery & Filter      │ • AI JD Analyzer                 │ • ATS Kanban Pipeline         │
│ • Skill Gap & Career Roadmap  │ • Candidate-Job Matching Engine  │ • Interview & Rubrics Score   │
│ • AI Career Assistant         │ • Career Pathing Recommender     │ • Recruiter Analytics         │
├───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┤
│                             [PHÂN HỆ HẠ TẦNG & QUẢN TRỊ DÙNG CHUNG]                             │
│ • Identity & Access Management (IAM / RBAC)             • Real-time Notification Service         │
│ • Skill Taxonomy & Master Data Management               • System Audit Log & Observability       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHI TIẾT YÊU CẦU CHỨC NĂNG THEO TỪNG PHÂN HỆ

### PHÂN HỆ 1: QUẢN LÝ TÀI KHOẢN, XÁC THỰC & PHÂN QUYỀN (AUTH & RBAC)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-01** | Đăng ký & Đăng nhập đa phương thức | Hỗ trợ đăng ký/đăng nhập qua Email/Password, Google OAuth2, LinkedIn OAuth. Mã hóa mật khẩu chuẩn `BCrypt` hoặc `Argon2id`. Trả về JWT Access Token (hạn 15 phút) và Refresh Token (hạn 7 ngày) lưu trong HttpOnly Cookie. | **Must** |
| **FR-02** | Phân quyền người dùng theo vai trò (RBAC) | Hệ thống hỗ trợ 4 vai trò chính: `Candidate`, `Recruiter`, `Hiring_Manager`, `Admin`. Mỗi vai trò gắn với tập Permission cụ thể (ví dụ: `job:create`, `candidate:view_pii`, `ats:move_stage`). | **Must** |
| **FR-03** | Quản lý Hồ sơ Doanh nghiệp (Company Profile) | Recruiter có thể tạo hồ sơ công ty: Tên, logo, website, quy mô, địa chỉ trụ sở, hình ảnh môi trường làm việc, chính sách đãi ngộ. Hồ sơ cần được Admin phê duyệt trước khi đăng tin. | **Must** |
| **FR-04** | Cơ chế Khôi phục Mật khẩu & Xác thực 2 lớp (2FA) | Gửi OTP qua email khi quên mật khẩu (thời hạn 5 phút). Tùy chọn kích hoạt 2FA qua Google Authenticator (TOTP) cho tài khoản Recruiter và Admin. | **Should** |

---

### PHÂN HỆ 2: QUẢN LÝ HỒ SƠ ỨNG VIÊN & CV ĐA PHIÊN BẢN (CANDIDATE & CV MANAGEMENT)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-05** | Quản lý Thông tin Ứng viên (Profile) | Ứng viên quản lý thông tin cá nhân: Họ tên, avatar, tiêu đề nghề nghiệp (Headline), email, số điện thoại, link GitHub/LinkedIn/Portfolio, tóm tắt bản thân (Bio). | **Must** |
| **FR-06** | Lưu trữ và Quản lý Đa phiên bản CV | Cho phép ứng viên tải lên tối đa 5 file CV (định dạng PDF, DOCX, dung lượng tối đa 10MB/file). Đặt tên phiên bản (ví dụ: "CV-Backend-NET", "CV-Frontend-React"). Chỉ định 1 CV làm "CV Mặc định". | **Must** |
| **FR-07** | Trình tạo CV Trực tuyến (Interactive CV Builder) | Cho phép ứng viên tạo CV trực tiếp trên web theo các khối dữ liệu chuẩn (Học vấn, Kinh nghiệm, Dự án, Kỹ năng, Chứng chỉ) và xuất ra file PDF chất lượng cao. | **Should** |
| **FR-08** | Cài đặt Quyền riêng tư của CV | Ứng viên có thể chuyển đổi trạng thái hồ sơ: `Công khai` (Nhà tuyển dụng có thể tìm thấy và chủ động liên hệ) hoặc `Ẩn danh/Riêng tư` (Chỉ nhà tuyển dụng của tin ứng tuyển mới xem được). Hỗ trợ che thông tin liên lạc (PII masking). | **Must** |

---

### PHÂN HỆ 3: BÓC TÁCH VÀ PHÂN TÍCH CV BẰNG AI (AI CV PARSER & EXTRACTION)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-09** | Bóc tách Dữ liệu CV tự động (CV Parsing) | Khi tải file PDF/DOCX lên, hệ thống gọi AI trích xuất tự động và trả về cấu trúc JSON chuẩn: Thông tin cá nhân, Học vấn, Kinh nghiệm (vị trí, công ty, thời gian, mô tả), Dự án (tên, vai trò, công nghệ sử dụng), Chứng chỉ. | **Must** |
| **FR-10** | Trích xuất & Chuẩn hóa Kỹ năng (Skill Extraction) | AI tự động nhận diện danh sách kỹ năng trong CV và ánh xạ vào Cây kỹ năng chuẩn (Skill Taxonomy). Phân loại: Ngôn ngữ lập trình, Frameworks, Cơ sở dữ liệu, Cloud/DevOps, Kỹ năng mềm. | **Must** |
| **FR-11** | Human-in-the-Loop Review | Sau khi AI bóc tách, ứng viên được xem trước bảng đối soát (Side-by-side view giữa file gốc và dữ liệu bóc tách), cho phép ứng viên chỉnh sửa, thêm bớt trước khi lưu chính thức vào hồ sơ. | **Must** |
| **FR-12** | Đánh giá Chất lượng CV (CV Score & Feedback) | AI phân tích chất lượng trình bày của CV: Đo lường độ rõ ràng, việc sử dụng các động từ hành động (action verbs), việc định lượng kết quả bằng số liệu (theo chuẩn STAR hoặc XYZ formula của Google), chỉ ra lỗi chính tả. | **Should** |

---

### PHÂN HỆ 4: QUẢN LÝ TIN TUYỂN DỤNG & PHÂN TÍCH JD BẰNG AI (JOB & JD ANALYSIS)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-13** | Quản lý Vòng đời Tin tuyển dụng | Recruiter có thể Tạo mới, Lưu nháp, Đăng tin, Chỉnh sửa, Tạm dừng và Đóng tin tuyển dụng. Đặt thời hạn hết hạn tự động cho tin. | **Must** |
| **FR-14** | Phân tích Yêu cầu Công việc bằng AI (JD Analysis) | Khi Recruiter nhập nội dung JD, AI tự động phân loại yêu cầu: Kỹ năng bắt buộc (Must-have), Kỹ năng ưu tiên (Nice-to-have), Số năm kinh nghiệm tối thiểu, Trình độ học vấn, Môi trường làm việc (On-site/Hybrid/Remote). | **Must** |
| **FR-15** | Gợi ý Tối ưu hóa Tin tuyển dụng (JD Optimizer) | AI cảnh báo nếu JD viết quá mơ hồ, yêu cầu công nghệ không hợp lý cho cấp độ Fresher/Junior, hoặc sử dụng ngôn từ có tính định kiến. Đề xuất bản chỉnh sửa rõ ràng hơn. | **Should** |
| **FR-16** | Vector hóa Tin tuyển dụng (Job Embedding) | Hệ thống tự động tính toán và lưu trữ vector embedding của tin tuyển dụng vào Vector Database ngay khi tin được xuất bản để phục vụ tìm kiếm ngữ nghĩa. | **Must** |

---

### PHÂN HỆ 5: TÌM KIẾM & LỌC VIỆC LÀM THÔNG MINH (SEMANTIC SEARCH & FILTERING)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-17** | Tìm kiếm Việc làm Kết hợp (Hybrid Search) | Hỗ trợ tìm kiếm kết hợp giữa Từ khóa chính xác (Lexical Full-Text Search) và Ngữ nghĩa thông minh (Semantic Vector Search). Ví dụ: Tìm "Lập trình web C#" vẫn trả về các tin tuyển dụng "ASP.NET Core Backend". | **Must** |
| **FR-18** | Bộ lọc Đa tiêu chí (Faceted Filtering) | Lọc tức thì theo: Địa điểm làm việc, Mức lương trần/sàn, Cấp bậc (Intern/Fresher/Junior/Middle/Senior), Hình thức làm việc, Danh sách kỹ năng yêu cầu. | **Must** |
| **FR-19** | Lưu công việc & Đăng ký Nhận thông báo việc làm | Ứng viên có thể "Lưu tin tuyển dụng" để nộp sau, hoặc tạo bộ lọc cảnh báo việc làm (Job Alert) gửi email hàng tuần khi có việc làm mới phù hợp. | **Should** |

---

### PHÂN HỆ 6: KHỚP NỐI ỨNG VIÊN - CÔNG VIỆC & GIẢI THÍCH (CANDIDATE-JOB MATCHING)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-20** | Tính toán Điểm số Phù hợp (Match Score) | Hệ thống tính toán điểm số phù hợp tổng thể (từ 0 đến 100) giữa một hồ sơ CV cụ thể và một JD dựa trên 4 trọng số: Kỹ năng bắt buộc (45%), Kỹ năng ưu tiên (20%), Kinh nghiệm/Dự án liên quan (25%), Học vấn/Chứng chỉ (10%). | **Must** |
| **FR-21** | Báo cáo Phân tích Giải thích Minh bạch (Explainable AI Breakdown) | Bảng phân tích trực quan bóc tách chi tiết: Danh sách kỹ năng Hoàn toàn phù hợp (Matched), Danh sách kỹ năng Cần cải thiện (Need improvement), và Danh sách kỹ năng Thiếu hoàn toàn (Missing). | **Must** |
| **FR-22** | Tự động Xếp hạng Ứng viên cho Recruiter | Khi mở một tin tuyển dụng, Recruiter xem được danh sách ứng viên đã nộp đơn được sắp xếp tự động theo điểm Match Score kèm tóm tắt đánh giá ngắn gọn của AI. | **Must** |

---

### PHÂN HỆ 7: PHÂN TÍCH KHOẢNG CÁCH KỸ NĂNG & ĐỀ XUẤT LỘ TRÌNH (SKILL GAP & ROADMAP)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-23** | Phân tích Khoảng cách Kỹ năng (Skill Gap Analysis) | Khi ứng viên xem một công việc hoặc bị từ chối đơn ứng tuyển, hệ thống chỉ rõ danh sách các lỗ hổng kiến thức khiến ứng viên chưa đạt yêu cầu tối đa của công việc. | **Must** |
| **FR-24** | Sinh Lộ trình Phát triển Nghề nghiệp (Career Roadmap Generator) | Dựa trên kỹ năng hiện tại và vị trí mục tiêu (ví dụ từ Fresher .NET lên Junior Cloud Developer), AI tự động tạo lộ trình học tập gồm các giai đoạn (Milestones), danh mục công nghệ cần học theo thứ tự ưu tiên. | **Must** |
| **FR-25** | Đề xuất Tài liệu & Dự án rèn luyện (Learning Resource Recommendation) | Với mỗi kỹ năng bị thiếu, hệ thống gợi ý từ khóa khóa học trực tuyến uy tín (Coursera, Udemy, YouTube, tài liệu chính thức) và ý tưởng đồ án thực hành (Practical Project Ideas) để bổ sung vào CV. | **Should** |

---

### PHÂN HỆ 8: QUẢN LÝ ĐƠN ỨNG TUYỂN & PIPELINE TUYỂN DỤNG (ATS KANBAN PIPELINE)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-26** | Nộp đơn Ứng tuyển & Lưu lịch sử | Ứng viên chọn phiên bản CV phù hợp nhất, viết Cover Letter ngắn và gửi ứng tuyển. Hệ thống lưu lại nhật ký ứng tuyển: ngày nộp, vị trí, công ty. | **Must** |
| **FR-27** | Bảng Kanban Tuyển dụng Trực quan (ATS Kanban Board) | Recruiter quản lý các ứng viên của một tin tuyển dụng theo các cột trạng thái: `Mới nộp (Applied) -> Phù hợp (Screening) -> Phỏng vấn (Interview) -> Đề nghị việc (Offered) -> Tuyển dụng (Hired) -> Từ chối (Rejected)`. Hỗ trợ kéo thả (Drag-and-Drop). | **Must** |
| **FR-28** | Ghi chú Nội bộ & Phân công (Internal Notes & Mentions) | Recruiter và Hiring Manager có thể gắn thẻ ghi chú trao đổi riêng về ứng viên trong đơn ứng tuyển mà ứng viên không thể thấy. | **Should** |
| **FR-29** | Gửi Email Thông báo Trạng thái Tự động | Khi kéo thả ứng viên sang trạng thái Phỏng vấn hoặc Từ chối, hệ thống hỗ trợ gửi email thông báo tự động theo mẫu cá nhân hóa (kèm lý do mang tính xây dựng). | **Must** |

---

### PHÂN HỆ 9: QUẢN LÝ PHỎNG VẤN & ĐÁNH GIÁ ỨNG VIÊN (INTERVIEW & EVALUATION)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-30** | Lên Lịch Phỏng vấn (Interview Scheduling) | Recruiter thiết lập buổi phỏng vấn: Ngày giờ, hình thức (Online qua Google Meet/Teams hoặc Trực tiếp tại văn phòng), danh sách người tham gia phỏng vấn (Interviewers). | **Must** |
| **FR-31** | Bảng Tiêu chí Đánh giá Chuẩn hóa (Interview Scorecard / Rubrics) | Người phỏng vấn chấm điểm ứng viên theo thang điểm 1-5 trên các tiêu chí: Kiến thức chuyên môn, Khả năng giải quyết vấn đề, Giao tiếp, Mức độ phù hợp văn hóa. | **Should** |
| **FR-32** | Gợi ý Câu hỏi Phỏng vấn bằng AI (AI Question Suggestions) | Dựa trên CV của ứng viên và JD, AI gợi ý 5-7 câu hỏi phỏng vấn kỹ thuật xoáy sâu vào các điểm nghi vấn hoặc công nghệ chủ chốt trong dự án của ứng viên. | **Could** |

---

### PHÂN HỆ 10: TRỢ LÝ NGHỀ NGHIỆP THÔNG MINH (AI CAREER ASSISTANT)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-33** | Chatbot Tư vấn Hướng nghiệp 24/7 | Giao diện hội thoại tương tác cho ứng viên. Chatbot có thể đọc hiểu ngữ cảnh CV của ứng viên và trả lời các câu hỏi: *"Với CV hiện tại, tôi nên nộp vào công ty loại nào?", "Làm thế nào để cải thiện phần kinh nghiệm dự án?"*. | **Should** |
| **FR-34** | Giả lập Phỏng vấn Kỹ thuật cơ bản (AI Mock Interview QA) | Chatbot đưa ra câu hỏi phỏng vấn thử nghiệm liên quan đến kỹ năng của ứng viên và chấm điểm câu trả lời văn bản, đưa ra nhận xét cải thiện. | **Could** |

---

### PHÂN HỆ 11 & 12: THÔNG BÁO & DASHBOARD BÁO CÁO (NOTIFICATIONS & ANALYTICS)

| Mã FR | Tên chức năng | Mô tả chi tiết & Tiêu chuẩn chấp nhận (Acceptance Criteria) | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **FR-35** | Hệ thống Thông báo Thời gian thực (Real-time Notification) | Thông báo in-app (chuông thông báo) và email khi có sự kiện: Hồ sơ được xem, Lời mời phỏng vấn, Kết quả ứng tuyển thay đổi, Gợi ý việc làm mới. | **Must** |
| **FR-36** | Dashboard Dành cho Ứng viên | Thống kê số lượng đơn đã nộp, tỷ lệ hồ sơ được xem, biểu đồ phân bổ kỹ năng cá nhân, danh sách việc làm phù hợp nhất được đề xuất theo thời gian thực. | **Must** |
| **FR-37** | Dashboard Dành cho Nhà tuyển dụng | Báo cáo hiệu quả tuyển dụng: Số lượt xem tin, Tổng số CV nộp, Tỷ lệ chuyển đổi qua các vòng (Conversion Funnel), Thời gian trung bình để đóng vị trí tuyển dụng. | **Must** |
| **FR-38** | Quản trị Hệ thống (Admin Operations) | Quản lý danh mục kỹ năng (Skill Dictionary), kiểm duyệt các công ty và tin tuyển dụng có dấu hiệu lừa đảo/vi phạm, xem biểu đồ tải hệ thống và số lượng token AI đã sử dụng. | **Must** |
