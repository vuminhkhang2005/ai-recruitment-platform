# TÀI LIỆU 06: XÁC ĐỊNH PHẠM VI ĐỀ TÀI & LỘ TRÌNH MỞ RỘNG
# (PROJECT SCOPE BOUNDARIES & STRATEGIC EVOLUTION ROADMAP)

---

## 1. TỔNG QUAN PHÂN ĐỊNH RANH GIỚI DỰ ÁN

Để đảm bảo dự án vừa đạt chất lượng kỹ thuật cao cấp nhất (tránh nợ kỹ thuật, kiến trúc chuẩn mực) vừa khả thi trong thời gian 15 tuần của **Tiểu luận chuyên ngành**, việc phân định ranh giới rõ ràng giữa **Phạm vi hoàn thiện trong Tiểu luận** và **Phạm vi mở rộng cho Khóa luận tốt nghiệp** là tối quan trọng.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                PHẠM VI TIỂU LUẬN CHUYÊN NGÀNH (CURRENT SCOPE)                            │
│  • Nền tảng Modular Monolith / Clean Architecture chuẩn mực, Zero Technical Debt.                       │
│  • Đầy đủ 2 phân hệ người dùng chính: Ứng viên (Candidate) và Nhà tuyển dụng (Recruiter).               │
│  • Bóc tách CV và Phân tích JD tự động bằng AI với JSON Schema Enforcement.                             │
│  • Hybrid Matching Engine (Vector Semantic + Rule-based Keyword) kèm Explainable Score.                 │
│  • Phân tích Khoảng cách Kỹ năng (Skill Gap) & Sinh Lộ trình học tập (Roadmap) định dạng bước.          │
│  • Bảng Kanban ATS quản lý quy trình tuyển dụng ứng viên trực quan (Drag-and-Drop).                     │
│  • Trợ lý nghề nghiệp AI (AI Career Chatbot) hỗ trợ tư vấn hồ sơ.                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                     │
                                                     ▼ (Chuyển giao mượt mà không cần đập đi xây lại)
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                PHẠM VI KHÓA LUẬN TỐT NGHIỆP (EXPANSION SCOPE)                           │
│  • Chuyển đổi các module tải cao (AI Engine, Vector Search) sang Microservices độc lập (K8s).           │
│  • AI Phỏng vấn Giả lập bằng Giọng nói & Video Đa phương thức (Multimodal Mock Interview & Emotion AI). │
│  • Huấn luyện (Fine-tune) mô hình ngôn ngữ chuyên ngành Nhân sự tiếng Việt (Domain-Specific LLM).       │
│  • Tự động thu thập (Web Scraping) và chuẩn hóa dữ liệu việc làm thị trường thời gian thực.             │
│  • Tích hợp Cổng thanh toán (VNPay/Stripe) cho các gói tin tuyển dụng Doanh nghiệp.                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MA TRẬN PHÂN ĐỊNH CHI TIẾT (IN-SCOPE VS OUT-OF-SCOPE)

| Phân hệ chức năng | Trong phạm vi Tiểu luận chuyên ngành (IN-SCOPE) | Phạm vi mở rộng Khóa luận tốt nghiệp (FUTURE ROADMAP) |
| :--- | :--- | :--- |
| **Xác thực & Người dùng** | - Đăng ký/đăng nhập Email & Google OAuth.<br>- Phân quyền RBAC (Candidate, Recruiter, Admin).<br>- Hồ sơ cá nhân và hồ sơ công ty. | - SSO cho doanh nghiệp (SAML/Okta).<br>- Phân quyền chi tiết nhiều chi nhánh theo cơ cấu tập đoàn.<br>- Xác thực sinh trắc học eKYC căn cước công dân. |
| **Quản lý CV & Bóc tách** | - Upload file PDF, DOCX (tối đa 5 phiên bản).<br>- Trích xuất bằng LLM: Kỹ năng, Học vấn, Dự án, Kinh nghiệm.<br>- Giao diện chỉnh sửa đối soát (Human-in-the-loop). | - OCR xử lý CV dạng ảnh chụp méo mó, chữ viết tay.<br>- Bóc tách video CV (Video Resume Analysis).<br>- Tạo CV tự động bằng giọng nói. |
| **Quản lý Tin tuyển dụng** | - Tạo, sửa, đóng tin tuyển dụng chuẩn SEO.<br>- Phân tích JD bằng AI (Must-have vs Nice-to-have).<br>- Tìm kiếm Hybrid (Từ khóa + Vector Embedding). | - Tự động đồng bộ tin tuyển dụng lên Facebook Jobs, LinkedIn Jobs qua API.<br>- AI tự động viết JD theo văn hóa công ty. |
| **Matching & Skill Gap** | - Thuật toán Hybrid Matching kết hợp Trọng số và Cosine Similarity.<br>- Bảng giải thích chi tiết (Khớp, Cần cải thiện, Thiếu).<br>- AI sinh cây lộ trình học tập kèm từ khóa khóa học. | - Thuật toán Graph Neural Networks (GNN) kết nối mạng lưới kỹ năng đồ sộ.<br>- Dự báo xu hướng dịch chuyển kỹ năng thị trường trong 5 năm tới. |
| **Quy trình Tuyển dụng (ATS)** | - Bảng Kanban kéo thả trạng thái ứng viên.<br>- Đặt lịch phỏng vấn và gửi email tự động.<br>- Scorecard tiêu chí chấm điểm phỏng vấn. | - Tích hợp trực tiếp Google Calendar API / Microsoft Teams Bot tự động chọn khung giờ trống của cả hai bên. |
| **AI Career Assistant** | - Chatbot hội thoại thông minh hỗ trợ giải đáp thắc mắc về hồ sơ, định hướng ngành nghề dựa trên CV. | - Phỏng vấn thử qua Video tương tác thời gian thực (Audio Streaming / WebRTC).<br>- Phân tích ngôn ngữ cơ thể, ngữ điệu giọng nói. |
| **Hạ tầng & Triển khai** | - Kiến trúc Modular Monolith chuẩn Clean Architecture.<br>- Docker Compose đóng gói toàn bộ hệ thống.<br>- PostgreSQL (pgvector) + Redis + RabbitMQ. | - Triển khai Kubernetes Cluster (K8s) trên AWS/GCP.<br>- Service Mesh (Istio), Distributed Caching đa vùng. |

---

## 3. NGUYÊN TẮC THIẾT KẾ ĐẢM BẢO CHUYỂN TIẾP KHÔNG PHÁ VỠ (ZERO-REWRITE DESIGN PRINCIPLES)

Để từ Tiểu luận chuyển tiếp lên Khóa luận tốt nghiệp mà **không cần viết lại từ đầu**, hệ thống bắt buộc áp dụng các quy tắc:

1. **Ranh giới module độc lập (Bounded Contexts)**:
   - Các module nghiệp vụ (`CandidateModule`, `JobModule`, `MatchingModule`, `ATSModule`) không được tham chiếu trực tiếp DbContext của nhau.
   - Khi cần dữ liệu chéo, các module giao tiếp thông qua Service Interface hoặc gửi Domain Events (ví dụ: `JobCreatedEvent`, `ApplicationSubmittedEvent`).
2. **AI Provider Abstraction (Adapter Pattern)**:
   - Toàn bộ logic gọi mô hình AI (Google Gemini, OpenAI, Claude) được bọc kín sau interface `ILLMProvider`. Khi chuyển từ API thương mại sang LLM tự host (Self-hosted Open-source LLM như Llama 3 / Qwen), chỉ cần viết thêm một class triển khai mới mà không làm thay đổi bất kỳ dòng mã nào ở tầng Application.
3. **Database Schema chuẩn hóa cao**:
   - Khóa chính sử dụng chuẩn `UUIDv7` (kết hợp timestamp sắp xếp được) thay vì `Auto-increment Integer` truyền thống để đảm bảo khi phân tán dữ liệu sang hệ thống Microservices sẽ không bao giờ bị xung đột ID.
