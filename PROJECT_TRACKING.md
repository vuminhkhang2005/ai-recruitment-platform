# BẢNG THEO DÕI TIẾN ĐỘ DỰ ÁN (PROJECT TRACKING BOARD)
# NỀN TẢNG HỖ TRỢ TUYỂN DỤNG VÀ ĐỊNH HƯỚNG NGHỀ NGHIỆP TÍCH HỢP AI

*Cập nhật lần cuối: 04/09/2026 | Phiên bản: 1.1.0*

---

## 1. TỔNG QUAN TIẾN ĐỘ (EXECUTIVE SUMMARY)

| Chỉ số | Giá trị | Ghi chú |
| :--- | :--- | :--- |
| **Tổng số giai đoạn** | 6 Giai đoạn (15 Tuần) | Kế hoạch toàn diện từ khảo sát đến bảo vệ |
| **Giai đoạn hiện tại** | **Giai đoạn 2: Phân tích & Thiết kế hệ thống** | Đã hoàn thành 100% Thiết kế Cơ sở Dữ liệu MySQL 8.0+ |
| **Tiến độ tổng thể** | **25%** | Hoàn thành Phase 1 (100%) + Hoàn thành Database Design Phase 2 |
| **Mức độ rủi ro** | Thấp (Low) | Database Schema chuẩn 3NF, Dual-Key, tối ưu Indexing |
| **Trạng thái nợ kỹ thuật** | **0% (Zero Technical Debt)** | Dual-Key, UTF8MB4, N-gram Fulltext, Audit Logs |

### Thanh tiến độ các giai đoạn:
- [x] **Phase 1: Khảo sát và xác định yêu cầu (Tuần 1–2)** — `[100% - COMPLETED]`
- [ ] **Phase 2: Phân tích và thiết kế hệ thống (Tuần 3–4)** — `[20% - IN PROGRESS]`
- [ ] **Phase 3: Xây dựng nền tảng cốt lõi (Tuần 5–8)** — `[0% - PENDING]`
- [ ] **Phase 4: Tích hợp Trí tuệ nhân tạo (Tuần 9–11)** — `[0% - PENDING]`
- [ ] **Phase 5: Hoàn thiện hệ thống & Nâng cao (Tuần 12–13)** — `[0% - PENDING]`
- [ ] **Phase 6: Đánh giá, Kiểm thử & Báo cáo (Tuần 14–15)** — `[0% - PENDING]`

---

## 2. CHI TIẾT THEO DÕI GIAI ĐOẠN 1: KHẢO SÁT VÀ XÁC ĐỊNH YÊU CẦU (HOÀN THÀNH 100%)

| Mã Task | Hạng mục công việc (Task Name) | Tài liệu bàn giao (Deliverable) | Trọng số | Trạng thái | Ngày hoàn thành |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **T1.1** | Phân tích sâu quy trình tuyển dụng chuẩn quốc tế & nội địa | `01_RECRUITMENT_PROCESS_ANALYSIS.md` | 15% | ✅ Hoàn thành | 03/09/2026 |
| **T1.2** | Khảo sát & Benchmark các hệ thống hiện có (TopCV, LinkedIn,...) | `02_BENCHMARK_AND_MARKET_SURVEY.md` | 15% | ✅ Hoàn thành | 03/09/2026 |
| **T1.3** | Xác định đối tượng sử dụng, xây dựng User Personas chi tiết | `03_STAKEHOLDERS_AND_PERSONAS.md` | 15% | ✅ Hoàn thành | 03/09/2026 |
| **T1.4** | Đặc tả Yêu cầu chức năng (FR) chi tiết theo từng phân hệ | `04_FUNCTIONAL_REQUIREMENTS.md` | 20% | ✅ Hoàn thành | 03/09/2026 |
| **T1.5** | Đặc tả Yêu cầu phi chức năng (NFR) cho hệ thống quy mô lớn | `05_NON_FUNCTIONAL_REQUIREMENTS.md` | 15% | ✅ Hoàn thành | 03/09/2026 |
| **T1.6** | Xác định ranh giới phạm vi (Scope Boundary: Tiểu luận vs Khóa luận) | `06_SCOPE_AND_ROADMAP.md` | 10% | ✅ Hoàn thành | 03/09/2026 |
| **T1.7** | Xây dựng mô hình Use Case tổng thể và theo Role | `07_USE_CASE_SPECIFICATIONS.md` | 10% | ✅ Hoàn thành | 04/09/2026 |

---

## 3. CHI TIẾT THEO DÕI GIAI ĐOẠN 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

| Mã Task | Hạng mục công việc (Task Name) | Tài liệu bàn giao (Deliverable) | Trọng số | Trạng thái | Ngày hoàn thành |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **T2.2** | **Thiết kế & Setup Database MySQL 8.0+ (29 tables, 39 FKs, Seed Data)** | `01_DATABASE_DESIGN_DOCUMENT.md`<br>`02_DATABASE_SCHEMA_DDL.sql`<br>*(Đã setup trực tiếp vào MySQL Service `MySQL80`)* | 30% | ✅ Hoàn thành & Deployed | 04/09/2026 |
| **T2.1** | Thiết kế kiến trúc tổng thể (Modular Monolith / C4 Model) | `03_SYSTEM_ARCHITECTURE_DESIGN.md` | 25% | ⏳ Đang chờ | Tuần 3 |
| **T2.3** | Thiết kế RESTful API Contracts (OpenAPI Specs) | `04_API_CONTRACTS_SPECIFICATION.md` | 20% | ⏳ Đang chờ | Tuần 4 |
| **T2.4** | Thiết kế UI Wireframes & User Journey Flow | `05_UI_UX_DESIGN_SPECIFICATION.md` | 15% | ⏳ Đang chờ | Tuần 4 |
| **T2.5** | Thiết kế Pipeline tích hợp AI & Prompt Engineering | `06_AI_INTEGRATION_PIPELINE.md` | 10% | ⏳ Đang chờ | Tuần 4 |

### Giai đoạn 3: Xây dựng nền tảng cốt lõi (Tuần 5–8)
- [ ] **T3.1**: Thiết lập hạ tầng Docker, Database Migrations, CI/CD Linting
- [ ] **T3.2**: Xây dựng Phân hệ Auth & Authorization (JWT, Refresh Token, RBAC)
- [ ] **T3.3**: Xây dựng Phân hệ Candidate Profile & Quản lý nhiều phiên bản CV
- [ ] **T3.4**: Xây dựng Phân hệ Job Posting & Management cho Recruiter
- [ ] **T3.5**: Xây dựng Phân hệ Application Tracking System (ATS Pipeline Kanban)
- [ ] **T3.6**: Xây dựng Dashboard thống kê cơ bản cho Candidate và Recruiter

### Giai đoạn 4: Tích hợp Trí tuệ nhân tạo (Tuần 9–11)
- [ ] **T4.1**: Tích hợp AI Service & Xây dựng CV Parser (PDF/DOCX to Structured JSON)
- [ ] **T4.2**: Xây dựng Job Description Analysis (Trích xuất yêu cầu, trọng số kỹ năng)
- [ ] **T4.3**: Xây dựng Candidate–Job Matching Engine (Hybrid Semantic Vector + Rule-based)
- [ ] **T4.4**: Xây dựng Skill Gap Analysis & Explainability Engine
- [ ] **T4.5**: Xây dựng Career Path & Course Recommendation Engine

### Giai đoạn 5: Hoàn thiện hệ thống & Nâng cao (Tuần 12–13)
- [ ] **T5.1**: Hoàn thiện và tối ưu hóa giao diện Frontend (UX/UI Polishing, Responsive)
- [ ] **T5.2**: Xây dựng Real-time Notification Service & Email Transactional
- [ ] **T5.3**: Xây dựng Phân hệ Quản lý Phỏng vấn (Interview Scheduling & Rubrics)
- [ ] **T5.4**: Triển khai AI Career Assistant (Conversational Chatbot)
- [ ] **T5.5**: Tối ưu hiệu năng, Database Indexing, Caching Redis

### Giai đoạn 6: Đánh giá, Kiểm thử và Báo cáo (Tuần 14–15)
- [ ] **T6.1**: Kiểm thử tích hợp toàn diện (E2E Integration Testing) & Unit Test Coverage
- [ ] **T6.2**: Đánh giá hiệu năng tải (Load/Stress Testing bằng k6/JMeter)
- [ ] **T6.3**: Đánh giá định lượng mô hình AI (Precision, Recall, F1-Score trên dữ liệu test)
- [ ] **T6.4**: Soạn thảo Báo cáo Tiểu luận chuyên ngành (Đầy đủ chương mục học thuật)
- [ ] **T6.5**: Đóng gói Demo, Video kịch bản và Slide bảo vệ

---

## 4. MA TRẬN QUẢN TRỊ RỦI RO (RISK REGISTER & MITIGATION)

| ID | Rủi ro tiềm ẩn (Risk) | Mức độ | Tác động | Giải pháp phòng ngừa & Giảm thiểu (Mitigation Strategy) |
| :---: | :--- | :---: | :---: | :--- |
| **R1** | **LLM Hallucination / Output không đúng format** | Cao | Sai lệch dữ liệu CV/Matching | Sử dụng **Pydantic / Structured JSON Outputs / Function Calling**; có lớp validation schema trước khi insert vào DB. |
| **R2** | **Quá tải và chi phí API AI tăng vọt** | Cao | Hệ thống nghẽn, tốn kém | Áp dụng cơ chế **Caching Redis** cho các nội dung đã phân tích; sử dụng hàng đợi **RabbitMQ** để kiểm soát Rate Limit; dùng Gemini Flash cho parsing và Pro cho reasoning sâu. |
| **R3** | **Nợ kỹ thuật khi scale hệ thống lớn** | Trung bình | Khó bảo trì, refactor tốn kém | Triển khai nghiêm ngặt **Clean Architecture**, phân chia ranh giới Bounded Contexts theo DDD; không viết logic nghiệp vụ vào Controller/UI. |
| **R4** | **Bảo mật và vi phạm quyền riêng tư dữ liệu (PII)** | Cao | Pháp lý, rò rỉ dữ liệu | Mã hóa dữ liệu định danh (AES-256); tuân thủ Nghị định 13/2023/NĐ-CP; cơ chế Pre-signed URL có thời hạn cho file CV. |
| **R5** | **Cold start / Thiếu dữ liệu gợi ý ban đầu** | Trung bình | Đề xuất kém chất lượng | Sử dụng Hybrid Matching kết hợp Rule-based (Trọng số kỹ năng, địa điểm, kinh nghiệm) song song với Vector Semantic Search. |

---

## 5. TIÊU CHUẨN HOÀN THÀNH (DEFINITION OF DONE - DoD)

Một hạng mục công việc được coi là hoàn thành (Done) khi và chỉ khi:
1. **Tài liệu hóa đầy đủ**: Có tài liệu thiết kế / đặc tả tương ứng trong thư mục `docs/`.
2. **Code Quality**: Viết bằng TypeScript/.NET với strict typing, không có compiler warning, tuân thủ linter.
3. **Automated Testing**: Unit test pass 100%, coverage đạt tối thiểu 75% cho phần Core Domain.
4. **Code Review & Git Workflow**: Được commit theo chuẩn Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
5. **Khả năng mở rộng**: Đã kiểm tra không có N+1 query, có index hợp lý trên các trường tìm kiếm chính.
