# TÀI LIỆU 05: ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG & TIÊU CHUẨN SCALE LỚN
# (ENTERPRISE NON-FUNCTIONAL REQUIREMENTS & ZERO TECHNICAL DEBT SPECIFICATION)

---

## 1. TỔNG QUAN VÀ CAM KẾT KIẾN TRÚC KHÔNG NỢ KỸ THUẬT (ZERO TECHNICAL DEBT MANDATE)

Đối với các dự án phần mềm quy mô lớn, nợ kỹ thuật (Technical Debt) xuất hiện chủ yếu do:
- Không tách rời tầng nghiệp vụ (Business Logic) khỏi tầng giao diện (UI) và tầng cơ sở dữ liệu (Database).
- Xử lý các tác vụ nặng (như gọi AI LLM, bóc tách file PDF) đồng bộ trực tiếp trong chu kỳ HTTP Request-Response.
- Cơ sở dữ liệu không được chuẩn hóa, thiếu chỉ mục (indexes), gây ra vấn đề $N+1$ query khi dữ liệu tăng trưởng.
- Dữ liệu định danh cá nhân (PII) không được mã hóa, tiềm ẩn nguy cơ rò rỉ và vi phạm pháp lý.

Tài liệu này thiết lập các tiêu chuẩn phi chức năng nghiêm ngặt nhằm đảm bảo hệ thống có thể mở rộng từ giai đoạn Tiểu luận chuyên ngành lên hệ thống sản phẩm phục vụ hàng triệu người dùng trong thực tế.

---

## 2. HIỆU NĂNG VÀ THỜI GIAN ĐÁP ỨNG (PERFORMANCE & SLA TARGETS)

| Chỉ số hiệu năng (Metric) | Ngưỡng cam kết (SLA / SLO) | Phương pháp kỹ thuật đạt được |
| :--- | :--- | :--- |
| **Thời gian phản hồi API chuẩn** | $P_{95} \le 200\text{ ms}$, $P_{99} \le 500\text{ ms}$ | Sử dụng Clean Architecture, tối ưu ORM, áp dụng Caching Redis cho dữ liệu đọc nhiều. |
| **Tìm kiếm Việc làm (Hybrid Search)** | $P_{95} \le 150\text{ ms}$ trên tập $100.000$ tin tuyển dụng | Đánh chỉ mục GIN trên PostgreSQL cho Full-Text Search và chỉ mục HNSW/IVFFlat cho Vector Search. |
| **Tác vụ AI Bóc tách CV (Asynchronous)** | Phản hồi xác nhận nộp file $\le 1\text{ giây}$; Xử lý AI hoàn tất $\le 5 - 8\text{ giây}$ | Đưa file vào Object Storage (MinIO/S3), đẩy job vào Message Queue (RabbitMQ), worker xử lý độc lập và gửi kết quả qua WebSocket. |
| **Tính toán Matching Điểm số** | $P_{95} \le 800\text{ ms}$ cho 1 CV vs 1 JD | Tính toán Cosine Similarity trực tiếp trên Vector DB kết hợp phép tính trọng số tối ưu trong bộ nhớ. |
| **Thời gian tải trang ban đầu (Web FCP)** | First Contentful Paint $\le 1.2\text{ giây}$; Lighthouse Score $\ge 90$ | Server-Side Rendering (Next.js), nén ảnh WebP, code-splitting, CDN caching tĩnh. |

---

## 3. KHẢ NĂNG MỞ RỘNG & CHỊU TẢI (SCALABILITY & CONCURRENCY)

```
                                      ┌────────────────────────┐
                                      │   Cloudflare CDN/WAF   │
                                      └───────────┬────────────┘
                                                  │
                                                  ▼
                                      ┌────────────────────────┐
                                      │ NGINX Ingress / LB     │
                                      └───────────┬────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
         ┌────────────────────┐        ┌────────────────────┐        ┌────────────────────┐
         │ API Instance #1    │        │ API Instance #2    │        │ API Instance #N    │
         └──────────┬─────────┘        └──────────┬─────────┘        └──────────┬─────────┘
                    │                             │                             │
                    └─────────────────────────────┼─────────────────────────────┘
                                                  │
          ┌───────────────────────────────────────┼───────────────────────────────────────┐
          ▼                                       ▼                                       ▼
┌──────────────────┐                    ┌──────────────────┐                    ┌──────────────────┐
│  Redis Cluster   │                    │ PostgreSQL 16    │                    │ RabbitMQ Broker  │
│  (Cache & Locks) │                    │ (Primary/Replica)│                    │ (AI Job Queues)  │
└──────────────────┘                    └──────────────────┘                    └─────────┬────────┘
                                                                                          │
                                                                                          ▼
                                                                                ┌──────────────────┐
                                                                                │ AI Worker Nodes  │
                                                                                │ (Scalable Pool)  │
                                                                                └──────────────────┘
```

1. **Khả năng mở rộng ngang (Horizontal Scalability)**:
   - Các API Service là **Stateless**, không lưu phiên làm việc trong bộ nhớ cục bộ mà sử dụng Distributed Session qua Redis và JWT. Bất kỳ node API nào cũng có thể xử lý bất kỳ request nào.
   - Các AI Worker nodes có thể scale độc lập (Auto-scale dựa trên độ dài hàng đợi của RabbitMQ).
2. **Khả năng chịu tải đồng thời**:
   - Chịu tải tối thiểu **500 concurrent active users** trong giai đoạn thử nghiệm và sẵn sàng scale lên **5.000 concurrent users** mà không cần thay đổi kiến trúc mã nguồn.
3. **Chiến lược Cơ sở Dữ liệu**:
   - Phân tách Đọc/Ghi (Read/Write Separation ready): Hỗ trợ kết nối Primary Node cho Ghi (Write) và Replica Nodes cho Đọc (Read intensive queries).
   - Thiết lập Connection Pooling (PgBouncer hoặc HikariCP) để kiểm soát tài nguyên kết nối.

---

## 4. BẢO MẬT & BẢO VỆ DỮ LIỆU CÁ NHÂN (SECURITY & PRIVACY COMPLIANCE)

### 4.1. Tuân thủ Pháp chế & Nghị định 13/2023/NĐ-CP (Bảo vệ dữ liệu cá nhân)
Hồ sơ ứng viên chứa thông tin nhạy cảm (Số điện thoại, địa chỉ, lịch sử công tác, mức lương cũ). Hệ thống cam kết:
- **Nguyên tắc Đồng thuận (Consent Management)**: Ứng viên phải tích chọn đồng ý điều khoản cho phép AI phân tích hồ sơ trước khi dữ liệu được xử lý.
- **Quyền được lãng quên (Right to Erasure / Account Deletion)**: Khi người dùng yêu cầu xóa tài khoản, toàn bộ thông tin cá nhân, file CV gốc, và các vector embedding liên quan sẽ bị xóa vĩnh viễn (Hard Delete) hoặc ẩn danh hóa hoàn toàn (Anonymization) trong vòng 48 giờ.
- **Mã hóa Dữ liệu (Data Encryption)**:
  - *Data at Rest*: Các trường dữ liệu định danh (Email, Phone, Số CCCD nếu có) được mã hóa bằng chuẩn **AES-256**.
  - *Data in Transit*: 100% lưu lượng mạng bắt buộc đi qua giao thức **HTTPS / TLS 1.3**.

### 4.2. Bảo mật Ứng dụng theo Tiêu chuẩn OWASP Top 10
- **Chống SQL Injection**: Nghiêm cấm tuyệt đối việc cộng chuỗi SQL thô; 100% truy vấn phải sử dụng Parameterized Queries hoặc ORM chuẩn mực.
- **Cross-Site Scripting (XSS)**: Toàn bộ dữ liệu nhập từ người dùng và phản hồi từ AI LLM đều được qua bộ lọc mã hóa HTML (HTML sanitization) trước khi hiển thị trên giao diện.
- **Cross-Site Request Forgery (CSRF)**: Sử dụng SameSite Cookie và xác thực Header Authorization Bearer Token.
- **Rate Limiting & Anti-DDoS**: Áp dụng thuật toán Leaky Bucket / Token Bucket trên Redis, giới hạn tối đa 60 requests/phút cho người dùng thông thường và 10 requests/phút cho các API gọi AI để ngăn chặn vét cạn tài nguyên.
- **Bảo mật File Upload**:
  - Chỉ chấp nhận Content-Type thực tế của file PDF (`application/pdf`) và DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
  - Kiểm tra Magic Bytes đầu file để ngăn ngừa việc đổi đuôi file mã độc.
  - Sử dụng Pre-signed URL có thời hạn tối đa 15 phút để ứng viên hoặc nhà tuyển dụng tải file từ Storage.

---

## 5. ĐỘ TIN CẬY VÀ KIỂM SOÁT HÀN RÀO AI (AI RELIABILITY & GUARDRAILS)

Hệ thống AI không được coi là một "chiếc hộp thần kỳ" không thể kiểm soát, mà phải được đóng khung kỹ thuật:

```
[Prompt Template] + [Context Data (CV/JD)] 
          │
          ▼
   [LLM Inference] (Gemini 1.5 Flash / Pro)
          │
          ▼
   [Raw LLM Output]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│               AI SAFETY & VALIDATION LAYER             │
│ • JSON Schema Validation (Pydantic / Zod)              │
│ • Hallucination Filter (Check kỹ năng có trong CV?)    │
│ • Anti-Bias Audit (Bỏ qua tuổi tác, giới tính, ảnh)    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
        [HỢP LỆ]                    [LỖI SCHEMA]
     Ghi vào Database              Thử lại với Fallback Prompt / 
                                   Ghi log cảnh báo Admin
```

1. **Ngăn chặn Ảo giác (Hallucination Mitigation)**:
   - Áp dụng kỹ thuật **Grounding**: Ép buộc LLM chỉ trích xuất những thông tin có bằng chứng trực tiếp từ văn bản CV, không tự ý suy diễn hoặc "bịa" thêm kỹ năng.
   - Thiết lập thông số `temperature = 0.1` hoặc `0.2` cho các tác vụ trích xuất dữ liệu để đảm bảo tính nhất quán và chính xác cao nhất.
2. **Cơ chế Fallback & Resilience**:
   - Khi API AI chính gặp sự cố (HTTP 429 Rate Limit, 503 Service Unavailable), hệ thống áp dụng **Exponential Backoff with Jitter** và tự động chuyển đổi dự phòng sang mô hình phụ hoặc bộ phân tích quy tắc (Regex/Rule-based Parser).
3. **Trung hòa Định kiến (Anti-Bias & Ethical AI)**:
   - Thuật toán matching loại bỏ hoàn toàn các yếu tố: Giới tính, Tôn giáo, Tình trạng hôn nhân, Ảnh đại diện, và Trường đại học ra khỏi công thức tính điểm để tránh thiên kiến vô thức.

---

## 6. KHẢ NĂNG QUAN SÁT VÀ GIÁM SÁT HỆ THỐNG (OBSERVABILITY & AUDITABILITY)

1. **Distributed Tracing & Correlation IDs**:
   - Mỗi HTTP request đến hệ thống được cấp một mã định danh duy nhất `X-Correlation-ID`. Mã này được truyền xuyên suốt qua API -> Message Queue -> AI Worker -> Database để dễ dàng truy vết toàn bộ vòng đời của một thao tác khi xảy ra lỗi.
2. **Structured Logging**:
   - Toàn bộ nhật ký được ghi dưới định dạng JSON có cấu trúc (Structured Logging) gồm các trường: `timestamp`, `level`, `correlation_id`, `user_id`, `endpoint`, `execution_time_ms`, `error_details`.
3. **Audit Log cho Hoạt động Tuyển dụng**:
   - Mọi thao tác thay đổi trạng thái ứng viên (Loại hồ sơ, Mời phỏng vấn, Thay đổi điểm số) đều được ghi vào bảng `AuditLogs` bất biến để phục vụ việc kiểm tra và giải trình.

---

## 7. TIÊU CHUẨN MÃ NGUỒN VÀ BẢO TRÌ (CODE QUALITY & MAINTAINABILITY)

1. **Nguyên tắc Kiến trúc (Architectural Principles)**:
   - **Tách biệt mối quan tâm (SoC)**: Tuân thủ Clean Architecture với 4 tầng rõ rệt: *Domain (Entities & Core Rules) -> Application (Use Cases & DTOs) -> Infrastructure (Database & AI Clients) -> API/Presentation (Controllers & Web UI)*.
   - **Dependency Inversion Principle**: Tầng nghiệp vụ không phụ thuộc vào bất kỳ thư viện bên ngoài hay nhà cung cấp AI cụ thể nào; việc giao tiếp với LLM được thực hiện thông qua interface `IAIService`.
2. **Kiểm thử tự động (Automated Testing Strategy)**:
   - **Unit Tests**: Tối thiểu 80% độ bao phủ (code coverage) cho Core Domain Logic (công thức tính điểm matching, logic chuyển trạng thái ATS).
   - **Integration Tests**: Kiểm thử toàn vẹn luồng tương tác giữa Database, Message Queue và Service.
   - **Mocking**: Toàn bộ các cuộc gọi đến bên ngoài (LLM API, Email Provider, Cloud Storage) đều được mock hoàn toàn trong môi trường test để đảm bảo tốc độ chạy kiểm thử tức thì.
3. **Chuẩn mực mã nguồn**:
   - Sử dụng Linter nghiêm ngặt (ESLint, Prettier cho TypeScript / StyleCop, Roslyn Analyzers cho .NET).
   - Zero Warning Policy: Mã nguồn không được chứa bất kỳ cảnh báo biên dịch nào khi build production.
