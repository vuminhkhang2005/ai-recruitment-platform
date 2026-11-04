# BÁO CÁO TIẾN ĐỘ TUẦN 11

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Bổ sung tiêu chí Địa điểm cho Động cơ AI Gợi ý việc làm, Gia cố bảo mật OAuth 2.0, Xuất dữ liệu CSV/PDF cho Nhà tuyển dụng và Admin, Xây dựng phân hệ Đánh giá Công ty & Kiểm duyệt Đánh giá, Tối ưu gói tải Frontend, Kiểm thử tự động (JUnit 5 + Playwright E2E) và Đóng gói Docker  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 11
- Sửa thao tác chọn thẻ việc làm trên trang `/jobs` ở màn hình máy tính để hiển thị khung xem nhanh bên phải thay vì chuyển sang trang chi tiết.
- Bổ sung tiêu chí **Địa điểm làm việc (Location)** vào thuật toán gợi ý việc làm theo CV, ưu tiên lấy địa chỉ từ hồ sơ hoặc dòng địa chỉ trong CV trước khi suy luận từ tên trường đại học.
- Gia cố bảo mật cho luồng **OAuth 2.0** (Google, LinkedIn) và tách toàn bộ khóa bí mật ra tệp cấu hình môi trường `.env`.
- Xây dựng tính năng **xuất dữ liệu CSV (mở trực tiếp trên Excel)** và **in báo cáo PDF** cho Nhà tuyển dụng và Quản trị viên.
- Xây dựng phân hệ **Đánh giá & Nhận xét công ty** (chỉ dành cho ứng viên đã từng nộp hồ sơ ứng tuyển vào công ty đó) và trang **Kiểm duyệt đánh giá** cho Admin.
- Tách nhỏ gói mã nguồn Frontend bằng `React.lazy`, tự động cập nhật lại JWT token khi kết nối lại WebSocket, viết bổ sung Unit Test JUnit 5, kịch bản Playwright E2E và đóng gói `Dockerfile` / `docker-compose.yml`.

___

## 2. Các công việc đã hoàn thành

### 2.1. Sửa tương tác xem nhanh việc làm & Bổ sung tiêu chí Địa điểm cho AI Gợi ý việc làm
- **Tương tác chọn việc làm trên `/jobs` (`JobCard.tsx`)**: Trên màn hình máy tính (`>= 1024px`), thao tác nhấp chuột trái vào thẻ việc làm sẽ gọi `e.preventDefault()` để cập nhật nội dung ở cột xem trước bên phải; người dùng vẫn có thể mở tab mới bằng `Ctrl/Cmd + Click` hoặc nút *"Xem chi tiết"*.
- **Xác định thành phố của ứng viên theo 5 mức ưu tiên (`AiService.java`)**:
  1. `PROFILE`: Lấy từ địa chỉ ứng viên khai báo trong Hồ sơ cá nhân.
  2. `CV_ADDRESS`: Quét các dòng có nhãn địa chỉ tường minh trong CV (`Địa chỉ:`, `Address:`, `Location:`, `Nơi ở:`).
  3. `CV_HEADER`: Quét thông tin liên hệ ở 12 dòng đầu tiên của tệp CV.
  4. `CV_SCHOOL`: Suy luận từ tên trường đại học trong CV (chỉ dùng khi cả 3 mức trên không tìm thấy thành phố).
  5. `CV_MENTION`: Địa danh xuất hiện trong phần nội dung còn lại của CV.
- **Tính điểm và giới hạn điểm theo khu vực**: Việc làm cùng thành phố được cộng tối đa **15 điểm** (hoặc **12 điểm** nếu làm từ xa `Remote`); việc làm yêu cầu làm trực tiếp tại thành phố khác nhận **0 điểm khu vực**, bị giới hạn tổng điểm tối đa **68%** và gắn nhãn cảnh báo khác khu vực trên giao diện.

### 2.2. Gia cố bảo mật OAuth 2.0 & Quản lý khóa bí mật
- **Khóa luồng OAuth 2.0 giả lập (`AuthServiceImpl.java`)**: Đặt phương thức `issueOAuth2AuthorizationCode` và nhánh đăng nhập thử nghiệm sau cờ cấu hình `app.oauth2.sandbox-enabled=false` mặc định.
- **Xác thực token từ nhà cung cấp**: Kiểm tra trường `aud`/`azp` của Google token phải khớp với `googleClientId` của hệ thống và `email_verified=true`; từ chối token LinkedIn truyền trực tiếp từ phía trình duyệt nếu không đi qua luồng đổi `authorization_code`.
- **Phân quyền & Tách biến môi trường**: Thêm `@PreAuthorize("hasRole('ADMIN')")` cho API `POST /api/v1/auth/oauth2/config`; chuyển các khóa bí mật khỏi `application.yml` sang tệp `backend/.env` (đã thêm vào `.gitignore`) kèm tệp mẫu `backend/.env.example`.

### 2.3. Xuất dữ liệu CSV (Excel UTF-8 BOM) & In báo cáo PDF
- **Bộ tạo CSV (`CsvBuilder.java`, `ExportService.java`, `ExportController.java`)**: Tạo tệp CSV theo chuẩn RFC 4180 có đính kèm byte `UTF-8 BOM` (`0xEF, 0xBB, 0xBF`) để mở trực tiếp trên Microsoft Excel không bị lỗi phông chữ tiếng Việt, đồng thời lọc các ký tự đầu dòng (`=`, `+`, `-`, `@`) để tránh lỗi chèn công thức (CSV Formula Injection).
- **5 API xuất dữ liệu song ngữ (`vi`/`en`)**:
  - Nhà tuyển dụng: Xuất danh sách ứng viên kèm điểm AI & kỹ năng (`/api/v1/exports/applications`) và báo cáo phễu tuyển dụng (`/api/v1/exports/analytics`).
  - Quản trị viên: Xuất danh sách người dùng (`/api/v1/exports/admin/users`), doanh nghiệp (`/api/v1/exports/admin/companies`) và tin tuyển dụng (`/api/v1/exports/admin/jobs`).
- **Giao diện xuất & in A4 (`ExportMenu.tsx`, `index.css`)**: Thêm menu xuất CSV và in/lưu PDF (`@media print` ẩn thanh điều hướng, định dạng lại bảng biểu theo khổ giấy A4) trên các trang `ApplicantsPage`, `EmployerAnalyticsPage`, `AdminUsersPage` và `AdminModerationPage`.

### 2.4. Phân hệ Đánh giá Công ty & Kiểm duyệt Đánh giá
- **Cơ sở dữ liệu & Nghiệp vụ (`V4__company_reviews.sql`, `CompanyReviewService.java`)**: Tạo bảng `company_reviews` và thêm cột `average_rating`, `review_count` vào bảng `companies`. Chỉ ứng viên đã có ít nhất 1 hồ sơ ứng tuyển tại công ty mới được gửi đánh giá (tối đa 1 đánh giá/công ty, có tùy chọn đánh giá ẩn danh `isAnonymous`); tự động tính lại điểm sao trung bình của công ty khi có thay đổi.
- **Khởi tạo dữ liệu mẫu (`DemoReviewSeeder.java`)**: Tạo 29 đánh giá mẫu từ các tài khoản ứng viên mẫu có sẵn đơn ứng tuyển, không tác động tới tài khoản người dùng thật.
- **Giao diện Công ty & Admin (`CompanyReviewsSection.tsx`, `AdminReviewsPage.tsx`)**:
  - Hiển thị điểm sao và số lượng đánh giá trên thẻ công ty ở trang `/companies`.
  - Trang chi tiết công ty (`/companies/:id`) hiển thị điểm trung bình, biểu đồ phân bổ từ 1 đến 5 sao, tỷ lệ khuyến nghị làm việc, bộ lọc theo số sao và biểu mẫu gửi đánh giá.
  - Trang quản trị `/admin/reviews` cho phép Admin lọc đánh giá theo công ty, số sao, trạng thái (`APPROVED`, `HIDDEN`, `REJECTED`), xem người gửi thực tế đối với đánh giá ẩn danh, ẩn/hiện hoặc xóa đánh giá vi phạm kèm ghi nhận vào `AuditLog`.

### 2.5. Tách gói tải Frontend, WebSocket, Kiểm thử & Đóng gói Docker
- **Tách gói mã nguồn (`App.tsx`)**: Chuyển 20 trang của Nhà tuyển dụng, Admin và Tài khoản sang tải bất đồng bộ bằng `React.lazy` và `Suspense`, giảm dung lượng gói JS chính từ **1.104,34 kB (274,51 kB gzip)** xuống **463,36 kB (126,84 kB gzip)**.
- **Kết nối lại WebSocket (`RealtimeContext.tsx`)**: Thêm hook `beforeConnect` đọc lại JWT token mới nhất từ `localStorage` trước mỗi lần STOMP kết nối lại.
- **Kiểm thử tự động**:
  - Viết bổ sung các bộ Unit Test JUnit 5 (`AiServiceCityDetectionTest`, `AiRecommendationScoringTest`, `AuthServiceOAuthSecurityTest`, `CsvBuilderTest`, `ExportControllerTest`, `CompanyReviewServiceTest`), nâng tổng số bài kiểm thử backend lên **96/96 tests PASSED**.
  - Viết kịch bản Playwright E2E `frontend/test_phase_j_week11.cjs` kiểm tra tự động toàn bộ các luồng mới (**16/16 bước kiểm thử PASSED**).
- **Đóng gói Docker & Tài liệu**: Tạo `Dockerfile` cho `backend`, `frontend` (Nginx), `talentbridge-ai-engine` và tệp `docker-compose.yml` chạy 4 dịch vụ (`mysql`, `ai-engine`, `backend`, `frontend`); cập nhật tài liệu `04_API_SPECIFICATION.md` và viết mới `05_AI_RECOMMENDATION_ENGINE.md`.

___

## 3. Kết quả đạt được (Deliverables)
- **Mã nguồn đã thực hiện**:
  - Backend: `AiService` (ưu tiên thành phố 5 mức & chấm điểm địa điểm), `AuthServiceImpl` & `AuthController` (bảo mật OAuth2), `CsvBuilder`, `ExportService`, `ExportController`, `V4__company_reviews.sql`, `CompanyReview`, `CompanyReviewRepository`, `CompanyReviewService`, `CompanyReviewController`, `DemoReviewSeeder`.
  - Frontend: `JobCard.tsx`, `ExportMenu.tsx`, `CompanyReviewsSection.tsx`, `CompanyDetailPage.tsx`, `CompaniesPage.tsx`, `AdminReviewsPage.tsx`, `App.tsx` (`React.lazy`), `RealtimeContext.tsx`.
  - Hạ tầng & Tài liệu: `docker-compose.yml`, các `Dockerfile`, `04_API_SPECIFICATION.md`, `05_AI_RECOMMENDATION_ENGINE.md`.
- **Kết quả kiểm thử**:
  - Backend JUnit 5 & MockMvc: **96/96 tests PASSED (0 lỗi)**.
  - Frontend build (`tsc -b && vite build`): **0 lỗi TypeScript**, không còn cảnh báo kích thước gói vượt ngưỡng 500 kB.
  - Playwright E2E (`test_phase_j_week11.cjs`): **16/16 checks PASSED**.
- **Lịch sử Git Repository**:
  - `fix(jobs)`: Giữ thao tác nhấp chuột vào thẻ việc làm trên máy tính ở khung xem nhanh bên phải (`7b30252`).
  - `feat(ai-recommendations)`: Thêm tiêu chí địa điểm và thứ tự ưu tiên xác định thành phố từ hồ sơ/CV (`ab853ef`, `1a739bc`).
  - `sec(oauth2) & test`: Khóa OAuth2 sandbox, tách `.env` và bổ sung Unit Test JUnit 5 (`89e756b`).
  - `feat(exports, reviews, perf)`: Xuất CSV/PDF, đánh giá công ty, kiểm duyệt đánh giá Admin và tách gói `React.lazy` (`fc1603b`).
  - `chore(release)`: Đóng gói Docker, kịch bản E2E Tuần 11 và tài liệu kỹ thuật (`8886984`, `8a8c68c`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn 1 (Suy luận sai thành phố của ứng viên khi CV có tên trường đại học nhưng ứng viên đã chuyển nơi ở)**: Nếu quét tên trường đại học cùng lúc với địa chỉ, ứng viên học tại Đà Nẵng/Hà Nội nhưng khai báo nơi ở hiện tại ở TP.HCM vẫn có thể bị gán nhầm thành phố theo tên trường.
  - *Giải pháp*: Tách quy trình nhận diện thành phố thành 5 bước tuần tự trong `resolveCandidateCity`: luôn lấy địa chỉ trong Hồ sơ cá nhân (`PROFILE`) hoặc dòng địa chỉ tường minh trong CV (`CV_ADDRESS`, `CV_HEADER`) trước; chỉ khi không có thông tin địa chỉ nào mới dùng đến bước suy luận từ tên trường đại học (`CV_SCHOOL`).
- **Khó khăn 2 (Tệp CSV xuất ra bị lỗi phông chữ tiếng Việt khi mở trực tiếp bằng Microsoft Excel trên Windows)**: Mặc định Excel trên Windows đọc tệp `.csv` không có BOM theo bảng mã ANSI/Windows-1252 thay vì UTF-8.
  - *Giải pháp*: Ghi thêm 3 byte `UTF-8 BOM` (`0xEF, 0xBB, 0xBF`) ở đầu luồng dữ liệu trong `CsvBuilder.java`, giúp Excel nhận diện đúng bảng mã UTF-8 ngay khi mở tệp.
- **Khó khăn 3 (Rủi ro lỗi khi khởi chạy container `talentbridge-ai-engine` từ kho mã nguồn Git)**: Tệp trọng số `model.safetensors` (470 MB) trong thư mục `models/transformer_backbone_finetuned` được đưa vào `.gitignore`, trong khi `config.json` vẫn nằm trên Git, khiến hàm `ft_backbone_dir.exists()` trả về `True` nhưng thiếu tệp trọng số khi tải mô hình.
  - *Giải pháp*: Sửa điều kiện kiểm tra trong `main.py` sang kiểm tra trực tiếp sự tồn tại của tệp `model.safetensors` hoặc `pytorch_model.bin`; nếu không có tệp trọng số cục bộ thì tự động tải từ `DEFAULT_TRANSFORMER_BACKBONE` hoặc dùng checkpoint `cv_jd_biencoder.pt`.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 4 Argon**

### Prompt
- "Sửa lại hành vi click vào thẻ công việc bên cột trái ở trang `/jobs` để chỉ hiển thị chi tiết sơ bộ bên cột phải chứ không chuyển hẳn sang trang chi tiết."
- "Thêm tiêu chí địa điểm (location) vào thuật toán gợi ý việc làm theo CV, ưu tiên lấy location từ hồ sơ hoặc địa chỉ trong CV trước, nếu không có mới suy từ tên trường đại học."
- "Hướng dẫn tạo API xuất dữ liệu CSV có hỗ trợ tiếng Việt khi mở bằng Excel và định dạng trang in PDF khổ A4 cho trang thống kê tuyển dụng."
- "Thiết kế bảng cơ sở dữ liệu `company_reviews` và các API đánh giá công ty dành cho ứng viên đã từng nộp đơn, kèm trang kiểm duyệt cho Admin."
- "Hướng dẫn cấu hình `React.lazy` tách nhỏ bundle frontend và viết `Dockerfile` / `docker-compose.yml` cho Spring Boot, React (Nginx) và FastAPI."

### AI tạo ra
- Đoạn mã xử lý sự kiện click trên `JobCard.tsx` và hàm trích xuất địa danh từ văn bản CV trong `AiService.java`.
- Khung mã nguồn `CsvBuilder.java`, `ExportController.java`, migration `V4__company_reviews.sql` và giao diện `CompanyReviewsSection.tsx`, `AdminReviewsPage.tsx`.
- Cấu hình `Dockerfile` cho 3 dịch vụ, `docker-compose.yml` và khung bài kiểm thử JUnit 5 / Playwright E2E.

### SV đã sửa
- Phát hiện hệ thống gợi ý các công việc ở Hà Nội và Đà Nẵng dù ứng viên đang ở TP.HCM; yêu cầu bổ sung tiêu chí địa điểm và trực tiếp quy định thứ tự ưu tiên: phải lấy địa chỉ trong hồ sơ/CV trước, chỉ khi không có mới suy từ tên trường đại học.
- Phát hiện lỗi khi nhấp vào thẻ việc làm bên cột trái trên trang `/jobs` lại chuyển thẳng sang trang `/jobs/:id` thay vì cập nhật khung xem nhanh bên phải, và yêu cầu chỉnh lại luồng tương tác.
- Kiểm tra lại các ràng buộc nghiệp vụ của chức năng đánh giá công ty (chỉ tài khoản đã ứng tuyển mới được gửi đánh giá, ẩn tên thật khi bật chế độ ẩn danh ngoài trang công khai nhưng vẫn hiển thị cho Admin đối chiếu khi kiểm duyệt).
- Chạy kiểm tra toàn bộ 96 bài test JUnit 5, kịch bản Playwright E2E 16 bước và kiểm tra tệp CSV tải về trên Excel.
