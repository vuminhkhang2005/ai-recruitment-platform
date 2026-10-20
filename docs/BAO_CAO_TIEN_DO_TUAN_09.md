# BÁO CÁO TIẾN ĐỘ TUẦN 9

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Tích hợp Trí tuệ Nhân tạo (AI Resume Parser, ATS Match & Skill Gap Analysis, AI Cover Letter Generator, AI Job Recommendations), Phân hệ Săn nhân tài chủ động (Talent Pool Sourcing) và Bảng thống kê Phễu tuyển dụng (Recruitment Analytics)  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 9
- Xây dựng phân hệ bóc tách hồ sơ thông minh (`AI Resume Parser`) hỗ trợ phân tích văn bản và tệp CV (PDF/DOCX/TXT), tự động trích xuất kỹ năng, kinh nghiệm, học vấn và đồng bộ 1 chạm vào hồ sơ năng lực ứng viên.
- Phát triển thuật toán đánh giá độ tương thích ATS chuyên sâu (`ATS Match & Skill Gap Analysis`) đối chiếu trực tiếp hồ sơ ứng viên với yêu cầu công việc (JD), chỉ rõ kỹ năng đạt, kỹ năng thiếu và gợi ý lộ trình chuẩn bị phỏng vấn.
- Triển khai trợ lý AI soạn thảo thư giới thiệu cá nhân hóa (`AI Cover Letter Generator`) theo 3 văn phong chuyên biệt ngay trong luồng nộp đơn ứng tuyển.
- Xây dựng hệ thống gợi ý việc làm thông minh (`AI Job Recommendations`) tự động xếp hạng các vị trí tuyển dụng có độ khớp cao nhất cho từng ứng viên.
- Phát triển phân hệ Săn nhân tài chủ động (`Employer Talent Pool Sourcing`) giúp nhà tuyển dụng tìm kiếm ứng viên đang bật chế độ `Open-to-Work`, chấm điểm độ khớp theo từng Job và gửi lời mời ứng tuyển 1-click kèm thông báo thời gian thực.
- Xây dựng Bảng thống kê tuyển dụng doanh nghiệp (`Employer Recruitment Analytics`) trực quan hóa phễu chuyển đổi 6 giai đoạn ATS, phân bổ chất lượng hồ sơ và xu hướng tiếp nhận theo tuần.
- Kiểm thử tự động hóa toàn diện với JUnit 5 & MockMvc và Playwright E2E (đạt 100% test pass).

___

## 2. Các công việc đã hoàn thành

### 2.1. Phân hệ Bóc tách Hồ sơ Tự động bằng AI (AI Resume Parser & 1-Click Skill Sync)
- **Xử lý đa định dạng & nhận diện thực thể**: Xây dựng `AiController` và `AiService` (`/api/v1/ai/parse-cv`, `/api/v1/ai/parse-cv-text`) bóc tách thông tin liên hệ (Email, SĐT), chức danh (`headline`), tổng số năm kinh nghiệm, trình độ học vấn và đối chiếu từ khóa với từ điển `skills` trong MySQL.
- **Đánh giá & Đồng bộ kỹ năng 1 chạm (`/profile`)**: Xây dựng `AiResumeParserModal.tsx` hiển thị điểm hoàn thiện CV, nhận xét tổng quan, danh sách điểm mạnh và khuyến nghị cải thiện; tích hợp API `/api/v1/ai/sync-parsed-skills` lưu trực tiếp kỹ năng đã trích xuất vào bảng `candidate_skills`.

### 2.2. Đánh giá Độ tương thích ATS & Phân tích Lỗ hổng Kỹ năng (ATS Match & Skill Gap Analysis)
- **Thuật toán chấm điểm đa trọng số (`/api/v1/ai/match-analysis`)**: Kết hợp tỷ lệ khớp kỹ năng bắt buộc (`is_required`), kỹ năng ưu tiên, trọng số (`weight`) và số năm kinh nghiệm thực tế của ứng viên so với `min_years_exp` của tin tuyển dụng.
- **Trực quan hóa trên `JobDetailPanel.tsx`**: Hiển thị điểm tương thích ATS kèm nhãn phân loại (`XUẤT SẮC`, `RẤT PHÙ HỢP`, `TIỀM NĂNG`), bảng đối chiếu chi tiết kỹ năng đã có (`matchedSkills`), kỹ năng cần bổ sung (`missingSkills`) và cẩm nang câu hỏi ôn tập phỏng vấn (`preparationTips`).

### 2.3. Trợ lý AI Soạn thảo Thư ứng tuyển & Gợi ý Việc làm Cá nhân hóa
- **AI Cover Letter Generator (`/api/v1/ai/generate-cover-letter`)**: Tích hợp trực tiếp vào `ApplyModal.tsx`, cho phép ứng viên chọn 3 phong cách (`PROFESSIONAL`, `ENTHUSIASTIC`, `CONCISE`) để tự động sinh thư ứng tuyển gắn kết chặt chẽ giữa thế mạnh cá nhân và yêu cầu của doanh nghiệp.
- **AI Job Recommendations (`/api/v1/ai/recommended-jobs`)**: Hiển thị khu vực việc làm gợi ý cá nhân hóa trên trang `/jobs` (`JobsPage.tsx`) kèm điểm khớp `%`, danh sách kỹ năng trùng khớp và lý do đề xuất.

### 2.4. Phân hệ Săn Nhân Tài Chủ Động (Employer Talent Pool Sourcing)
- **Tìm kiếm & Xếp hạng ứng viên mở (`/api/v1/employer/talent-pool`)**: Xây dựng `TalentPoolController`, `TalentPoolService` và trang `/employer/talent-pool` (`TalentPoolPage.tsx`) cho phép nhà tuyển dụng tra cứu ứng viên bật `isOpenToWork = true`, lọc theo từ khóa kỹ năng, thành phố và đối chiếu độ khớp ATS với từng vị trí đang đăng tuyển.
- **Gửi lời mời ứng tuyển 1-Click (`/api/v1/employer/talent-pool/invite`)**: Nhà tuyển dụng chọn vị trí công việc và lời nhắn cá nhân hóa để gửi lời mời trực tiếp; hệ thống tự động phát thông báo thời gian thực loại `JOB_INVITATION` tới chuông thông báo (`NotificationBell.tsx`) của ứng viên.

### 2.5. Bảng Thống Kê Tuyển Dụng & Phễu Chuyển Đổi (Employer Recruitment Analytics)
- **Chỉ số vận hành & Phễu tuyển dụng 6 giai đoạn (`/api/v1/employer/analytics`)**: Xây dựng `AnalyticsController`, `AnalyticsService` và trang `/employer/analytics` (`EmployerAnalyticsPage.tsx`) thống kê 6 KPIs cốt lõi, tỷ lệ chuyển đổi qua từng vòng (`APPLIED` $\rightarrow$ `SCREENING` $\rightarrow$ `INTERVIEW` $\rightarrow$ `OFFERED` $\rightarrow$ `HIRED` / `REJECTED`) và thời gian xử lý hồ sơ trung bình.
- **Phân bổ chất lượng ATS & Xu hướng**: Biểu đồ phân loại ứng viên theo 3 nhóm chất lượng (Độ khớp cao $\ge 75\%$, Trung bình $50\text{--}74\%$, Thấp $< 50\%$), biểu đồ xu hướng 6 tuần gần nhất và bảng xếp hạng hiệu quả các tin đăng.

### 2.6. Kiểm thử Tự động hóa Toàn diện (JUnit 5 + Playwright E2E)
- **Backend Unit & Controller Tests**: Xây dựng mới `AiControllerTest`, `AnalyticsControllerTest`, `TalentPoolControllerTest` nâng tổng số bài test JUnit 5 lên **26/26 test cases PASSED (100%)**.
- **Frontend & E2E Playwright**: Kiểm tra biên dịch TypeScript (`npx tsc -b`) đạt **0 lỗi**; thực thi thành công 100% 2 bộ kịch bản E2E `test_phase_g_ai_and_analytics.cjs` và `test_phase_h_talent_pool_and_recommendations.cjs` kèm ảnh chụp minh chứng.

___

## 3. Kết quả đạt được (Deliverables)
- **Mã nguồn hoàn thiện**:
  - Backend: `AiController`, `AiService`, `AiDtos`, `AnalyticsController`, `AnalyticsService`, `AnalyticsDtos`, `TalentPoolController`, `TalentPoolService`, `TalentPoolDtos`.
  - Frontend: `AiResumeParserModal.tsx`, `EmployerAnalyticsPage.tsx`, `TalentPoolPage.tsx`, cùng các nâng cấp tích hợp AI trên `JobDetailPanel.tsx`, `ApplyModal.tsx`, `JobsPage.tsx`, `ProfilePage.tsx`, `NotificationBell.tsx`.
- **Kiểm thử hệ thống**:
  - Backend JUnit 5 & MockMvc: **26/26 tests PASSED (100%)**, 0 lỗi, 0 thất bại.
  - Playwright E2E: Đạt 100% pass rate trên cả 2 luồng kiểm thử AI & Analytics (`Phase G`) và Talent Pool & Job Recommendations (`Phase H`).
- **Lịch sử Git Repository**:
  - `feat(ai-analytics)`: Triển khai AI Resume Parser, ATS Match, Cover Letter Generator, Talent Pool Sourcing & Employer Analytics (`ee10c96`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn 1 (Chuẩn hóa kỹ năng tự do từ văn bản CV sang Từ điển kỹ năng chuẩn của hệ thống)**: Văn bản CV của ứng viên thường viết tắt hoặc dùng nhiều biến thể khác nhau (ví dụ: `ReactJS`, `React.js`, `Node`, `Spring`), dễ gây lệch khi chấm điểm với JD.
  - *Giải pháp*: Xây dựng bộ ánh xạ từ đồng nghĩa kết hợp so khớp không phân biệt hoa thường và biên từ (word-boundary matching) với bảng `skills` trong MySQL, giúp chuẩn hóa chính xác về ID kỹ năng gốc trước khi đồng bộ vào `candidate_skills`.
- **Khó khăn 2 (Đảm bảo tốc độ phản hồi khi tính điểm khớp ATS cho toàn bộ danh sách Talent Pool và Gợi ý việc làm)**: Việc tính toán độ khớp kỹ năng giữa hàng chục ứng viên và nhiều tin tuyển dụng nếu truy vấn rời rạc sẽ gây hiện tượng $N+1$ queries.
  - *Giải pháp*: Nạp trước (pre-fetch) danh sách `JobSkill` của vị trí mục tiêu và gom nhóm `CandidateSkill` trong bộ nhớ (`@Transactional(readOnly = true)`), giúp thời gian phản hồi API tìm kiếm Talent Pool và gợi ý việc làm luôn dưới 50ms.
- **Khó khăn 3 (Tránh gửi trùng lặp thông báo lời mời ứng tuyển từ Nhà tuyển dụng)**: Nếu HR bấm gửi lời mời nhiều lần cho cùng một ứng viên vào cùng một vị trí sẽ gây spam hộp thư thông báo.
  - *Giải pháp*: Tích hợp cơ chế kiểm tra chống trùng lặp và sử dụng thông báo định danh theo `referenceType = "JOB"` và `referenceId = jobId`, đảm bảo trải nghiệm chuyên nghiệp cho ứng viên.

___

## 5. Kế hoạch tuần 10 (Dự kiến: Xây dựng Phân hệ Quản trị Hệ thống Admin Governance Portal & Hoàn thiện Tính năng Nâng cao)
### 5.1. Xây dựng Phân hệ Quản trị Hệ thống & Giám sát AI (Admin Governance Portal - UC-ADM-01 -> UC-ADM-06 & FR-38)
- Xây dựng Bảng điều khiển Quản trị toàn sàn (`/admin`) thống kê KPIs tổng thể (Users, Companies, Jobs, Applications, Skills), phễu tuyển dụng toàn hệ thống và giám sát hiệu năng mô hình AI Matching (`UC-ADM-01`, `UC-ADM-06`).
- Xây dựng trang Quản lý Người dùng & Phân quyền RBAC (`/admin/users` - `UC-ADM-02`): Tìm kiếm, lọc theo vai trò/trạng thái, khóa/mở khóa tài khoản vi phạm (`ACTIVE`, `SUSPENDED`, `BANNED`) kèm cơ chế bảo vệ chống tự khóa tài khoản Admin.
- Xây dựng Trung tâm Kiểm duyệt (`/admin/moderation`): Thẩm định hồ sơ pháp lý, cấp tích xanh xác minh doanh nghiệp (`UC-ADM-03` - `VERIFIED`, `PENDING`, `REJECTED`) và kiểm duyệt tin tuyển dụng (`UC-ADM-04`).
- Xây dựng trình Quản lý Từ điển Kỹ năng Chuẩn (`Master Skill Taxonomy` - `/admin/skills` - `UC-ADM-05`) và trình Truy vết Nhật ký Hệ thống (`Audit Trail` & `Email Logs` - `/admin/audit-logs` - `FR-38`).
### 5.2. Bổ sung Các Tính năng Cấp thiết Hoàn thiện Trải nghiệm Toàn sàn
- **Chuẩn hóa nội dung giao diện & Đăng nhập nhanh Demo 1-Click**: Rà soát, nâng cấp nội dung toàn bộ trang chủ, trang dành cho nhà tuyển dụng (`EmployersPage`), chân trang (`Footer`) và bổ sung bộ nút **Quick Demo Login 1-Click** cho cả 3 vai trò (Ứng viên, Nhà tuyển dụng, Quản trị viên) phục vụ kiểm thử và báo cáo đồ án.
- **Kết xuất Báo cáo Tuyển dụng (Export CSV/PDF) & Đánh giá Doanh nghiệp**: Hỗ trợ nhà tuyển dụng và quản trị viên xuất dữ liệu thống kê/danh sách ứng viên ra tệp CSV/PDF; bổ sung tính năng đánh giá & nhận xét công ty giúp tăng tính minh bạch thông tin tuyển dụng.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 3.8 Flash**

### Prompt
- "Tư vấn thiết kế thuật toán bóc tách thông tin CV (AI Resume Parser) từ văn bản thô sang cấu trúc JSON chuẩn hóa và đối chiếu với bảng skills trong MySQL."
- "Hướng dẫn xây dựng công thức tính điểm tương thích ATS đa trọng số kết hợp kỹ năng bắt buộc, trọng số kỹ năng và số năm kinh nghiệm tối thiểu."
- "Gợi ý thiết kế cấu trúc dữ liệu DTO cho trang Thống kê Phễu tuyển dụng (Recruitment Funnel Analytics) 6 giai đoạn và phân bổ chất lượng ứng viên."
- "Tư vấn thiết kế luồng nghiệp vụ Săn nhân tài chủ động (Talent Pool Sourcing) kết hợp gửi thông báo lời mời ứng tuyển thời gian thực."
- "Hỗ trợ viết kịch bản kiểm thử tự động Playwright E2E cho luồng AI Resume Parser, ATS Match Panel, AI Cover Letter và Talent Pool."

### AI tạo ra
- Khung mã nguồn cơ bản (boilerplate) cho các lớp DTO: `AiDtos`, `AnalyticsDtos`, `TalentPoolDtos`.
- Mẫu giao diện cơ bản cho hộp thoại hiển thị kết quả phân tích CV và biểu đồ thanh ngang trên trang thống kê.
- Cấu trúc khung cho các bài kiểm thử đơn vị `@WebMvcTest` (`AiControllerTest`, `AnalyticsControllerTest`, `TalentPoolControllerTest`).

### SV đã sửa
- Trực tiếp thiết kế và lập trình thuật toán chấm điểm ATS chuyên sâu trong `AiService`: Xử lý chuẩn xác việc phân tách nhóm kỹ năng đã khớp (`matchedSkills`) và kỹ năng còn thiếu (`missingSkills`), đồng thời tự động sinh danh sách câu hỏi ôn tập phỏng vấn (`preparationTips`) dựa trên chính các kỹ năng ứng viên còn thiếu.
- Tự tay xây dựng tính năng đồng bộ kỹ năng 1 chạm (`syncParsedSkills`) kết nối trực tiếp kết quả bóc tách CV vào bảng `candidate_skills` trong MySQL, tự động cập nhật lại điểm khớp việc làm trên toàn hệ thống.
- Thiết kế và hoàn thiện phân hệ `TalentPoolService` và `TalentPoolPage.tsx`: Tích hợp bộ lọc kết hợp giữa từ khóa kỹ năng, thành phố và vị trí tuyển dụng mục tiêu để xếp hạng ứng viên `Open-to-Work` theo thời gian thực, kèm chức năng gửi lời mời ứng tuyển 1-click phát thông báo `JOB_INVITATION` tới ứng viên.
- Cấu hình đầy đủ các `@MockBean` bảo mật (`JwtTokenProvider`, `UserDetailsServiceImpl`, `JwtCookieHelper`) và chuẩn hóa cấu trúc phản hồi `ApiResponse` trong toàn bộ bộ test JUnit 5 (26/26 pass) cũng như kịch bản Playwright E2E (`test_phase_g_ai_and_analytics.cjs`, `test_phase_h_talent_pool_and_recommendations.cjs`).
