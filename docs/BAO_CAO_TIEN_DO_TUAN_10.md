# BÁO CÁO TIẾN ĐỘ TUẦN 10

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Tích hợp Đăng nhập OAuth 2.0 thật (Google, LinkedIn), Nâng cấp Nhắn tin tuyển dụng thời gian thực, Bóc tách CV thật (PDF/DOCX) kết hợp mô hình PyTorch Bi-Encoder, Song ngữ VI/EN toàn hệ thống, Thiết kế lại Phân hệ Quản trị (Admin), Chuyển vòng ATS hàng loạt kèm Email tự động và Hiệu chỉnh Động cơ Gợi ý việc làm theo CV  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 10
- Thay thế luồng đăng nhập mô phỏng bằng **OAuth 2.0 thật** với Google (Google Identity Services / UserInfo) và LinkedIn (OpenID Connect).
- Nâng cấp phân hệ nhắn tin tuyển dụng lên giao diện **3 cột thời gian thực** (đã xem, nhóm tin nhắn, trả lời nhanh, hồ sơ ứng viên bên cạnh).
- Bóc tách nội dung **từ chính tệp CV thật** (PDF/DOCX) thay vì dữ liệu hồ sơ mẫu, và kết nối **microservice AI riêng (FastAPI + PyTorch Bi-Encoder)** để chấm điểm CV so với JD.
- Hoàn thiện **song ngữ VI/EN** cho cả 3 cổng (Ứng viên, Nhà tuyển dụng, Quản trị viên) và chuyển dữ liệu mẫu trong DB sang tiếng Anh.
- Thiết kế lại giao diện **Admin** (bảng điều khiển, hộp thoại xem chi tiết, nhật ký hệ thống và nhật ký email).
- Cho phép nhà tuyển dụng **chuyển vòng ATS cho một hoặc nhiều ứng viên cùng lúc**, kèm soạn email theo mẫu hoặc tự viết, gửi qua kênh email miễn phí dùng được khi chạy thật.
- Xây dựng **động cơ gợi ý việc làm dựa trên CV** có giải thích lý do, và hiệu chỉnh để điểm phù hợp sát thực tế (đúng cấp bậc, đúng chuyên môn).

___

## 2. Các công việc đã hoàn thành

### 2.1. Đăng nhập OAuth 2.0 thật với Google & LinkedIn
- **Luồng Authorization Code**: Chuyển hướng trực tiếp tới `accounts.google.com` và `linkedin.com`, xác thực bằng Client ID/Secret thật trên Google Cloud và LinkedIn Developer, lấy thông tin người dùng qua `UserInfo` / `api.linkedin.com`.
- **Sửa lỗi email thông báo lặp lại**: Google gửi email *"tóm tắt thông tin bạn đã chia sẻ"* sau **mỗi lần** đăng nhập vì URL dùng `prompt=consent`. Đã đổi sang `prompt=select_account` trong `AuthPages.tsx`, nên màn hình xin quyền chỉ hiện ở lần đăng nhập đầu tiên.

### 2.2. Nhắn tin tuyển dụng thời gian thực dạng 3 cột
- Nâng cấp giao diện chat thành 3 cột: danh sách hội thoại – khung chat – hồ sơ ứng viên; có trạng thái đã xem, gom nhóm tin nhắn theo thời gian và mẫu trả lời nhanh.
- Chỉnh bố cục cho vừa màn hình 1366×768, bỏ thanh cuộn ngang và sửa tỉ lệ logo.

### 2.3. Bóc tách CV thật & Microservice AI (PyTorch Bi-Encoder)
- **Đọc nội dung CV thật**: Dùng Apache PDFBox (PDF) và thư viện đọc DOCX để lấy văn bản; kỹ năng, chức danh, cấp bậc kinh nghiệm và thành phố được trích xuất **chỉ từ tệp CV đã tải lên**, không lẫn dữ liệu hồ sơ mẫu.
- **Microservice `talentbridge-ai-engine`** (FastAPI, cổng `8000`): Mô hình Bi-Encoder mã hóa CV và JD thành vector để tính độ tương đồng; Spring Boot gọi sang service này và tự dùng thuật toán trong `AiService` nếu service không phản hồi.
- **So sánh CV với JD ngay lúc nộp đơn**: Ứng viên có thể chủ động bật phân tích AI trong `ApplyModal` (tương tự TopCV).

### 2.4. Song ngữ VI/EN & Giao diện toàn hệ thống
- Chuyển toàn bộ dữ liệu mẫu trong DB/backend sang tiếng Anh, phủ đủ song ngữ VI/EN cho cả 3 cổng; gộp nút chuyển ngôn ngữ về một kiểu `VI | EN`.
- Làm dịu bảng màu và các bề mặt ở chế độ tối trên toàn hệ thống.
- Thêm ảnh bìa văn phòng cho 10 công ty, thiết kế lại `CompanyDetailPage` (phần giới thiệu + lưới việc làm 3 cột); rà soát giao diện bằng Playwright trên 27 trang và 3 vai trò.
- Trang chủ: đếm số việc làm theo chuyên ngành từ lần tải đầu tiên thay vì gọi 6 API riêng.

### 2.5. Thiết kế lại Phân hệ Quản trị (Admin)
- Làm mới giao diện Admin: bảng điều khiển, hộp thoại xem chi tiết người dùng/doanh nghiệp/tin đăng, hỗ trợ song ngữ, xem **Nhật ký hệ thống (Audit Log)** và **Nhật ký email (Email Logs)**.
- Navbar của Admin và Nhà tuyển dụng chỉ hiện icon logo và có menu thả xuống, không bị tràn ngang.

### 2.6. Chuyển vòng ATS hàng loạt & Gửi email tự động
- **Chuyển vòng một hoặc nhiều ứng viên**: Nhà tuyển dụng chọn nhiều hồ sơ và chuyển vòng cùng lúc (mời làm bài test, phỏng vấn, từ chối, ...), kèm khung soạn email **theo mẫu có sẵn hoặc tự viết**, có xem trước nội dung.
- **Kênh gửi email miễn phí dùng được khi chạy thật**: Gửi qua **Google Apps Script** (mặc định), có Gmail SMTP làm phương án dự phòng; tự chuyển sang URL dự phòng nếu bản triển khai chính trả lỗi `401`.
- **Tên người gửi theo từng công ty/HR**: Chỉ dùng một địa chỉ gửi đã xác minh, nhưng tên hiển thị và `Reply-To` đổi theo từng công ty/HR; mẫu email có logo TalentBridge và thanh thông tin HR/công ty.
- **Sửa lỗi email bị trả về (bounce)**: Không gửi tới các email giả trong dữ liệu mẫu và không dùng `Reply-To` có tên miền công ty giả; giải thích trường hợp `fpt.com` chặn thư từ Gmail cá nhân bằng quy tắc *FreeMail Policy*.
- Sửa lỗi `email_logs` không được lưu: Cho các hàm xử lý trong `EmailContentFactory` chạy trong transaction có quyền ghi.

### 2.7. Động cơ Gợi ý việc làm theo CV (Hybrid 4 tiêu chí) & Hiệu chỉnh điểm
- **Gợi ý theo 4 tiêu chí**: Kỹ năng, kinh nghiệm/cấp bậc, chuyên ngành và độ tương đồng ngữ nghĩa. Mỗi gợi ý đều ghi rõ lý do, hiển thị ở Trang chủ, trang Việc làm và mục *Việc làm tương tự* trong trang chi tiết; tự loại các tin đã hết hạn.
- **Sửa lỗi nhận nhầm kỹ năng**: So khớp kiểu chuỗi con khiến từ viết tắt `"ts"` (TypeScript) khớp với chữ `projects`, `"java"` khớp `javascript`, `"go"` khớp `mongodb`. Đã chuyển sang so khớp **theo ranh giới từ (regex word-boundary)** ở cả `AiService.java` và `model_arch.py`.
- **Kiểm tra chuyên môn trong tiêu đề JD**: Nếu tiêu đề yêu cầu chuyên môn đặc thù (Flutter/Dart, Android/Kotlin, Golang, DevOps, QA, Python/AI, ...) mà CV không có, điểm tối đa chỉ còn **34%** và tin đó bị loại khỏi danh sách gợi ý. Đồng thời sửa sai tag kỹ năng của 2 tin mẫu (Flutter, Kotlin).
- **Hiệu chỉnh theo cấp bậc**: CV Intern/Fresher (0 năm kinh nghiệm) bị giới hạn điểm tối đa **68%** với JD Junior (1–3 năm), **54%** với Middle và **40%** với Senior.

**Kết quả kiểm tra trên CV thật của sinh viên (Intern, 0 năm kinh nghiệm):**

| Vị trí | Cấp bậc | Trước hiệu chỉnh | Sau hiệu chỉnh |
| :--- | :---: | :---: | :---: |
| Intern .NET Backend Developer | INTERN | 95% | **95%** |
| Fresher Java Software Engineer | FRESHER | ~92% | **90%** |
| Junior Software Engineer (.NET & Cloud) | JUNIOR | >90% | **67%** |
| Full-Stack Engineer (React & Java) | MIDDLE | >90% | **54%** |
| Mobile Developer (Flutter) | JUNIOR | 95% | **25%** (bị loại khỏi gợi ý) |
| Fresher Android Developer (Kotlin) | FRESHER | cao | **34%** (bị loại khỏi gợi ý) |

___

## 3. Kết quả đạt được (Deliverables)
- **Mã nguồn hoàn thiện**:
  - Backend: `AiService` (hiệu chỉnh theo cấp bậc, so khớp theo ranh giới từ, kiểm tra chuyên môn trong tiêu đề), `MatchingService`, `DemoAccountInitializer` (sửa dữ liệu mẫu, tự gia hạn tin tuyển dụng mẫu), các dịch vụ gửi email (Google Apps Script / Gmail SMTP), OAuth2 Google & LinkedIn.
  - Frontend: `AuthPages.tsx`, giao diện nhắn tin 3 cột, `ApplyModal.tsx`, `JobsPage.tsx`, `CompanyDetailPage`, các trang Admin, khung soạn email chuyển vòng ATS hàng loạt.
  - Microservice AI: `talentbridge-ai-engine` (`main.py`, `model_arch.py`) chạy bằng FastAPI + PyTorch.
- **Kiểm thử hệ thống**:
  - Frontend build (`tsc -b && vite build`): **0 lỗi TypeScript**.
  - Kiểm tra trực tiếp trên giao diện bằng Playwright, có ảnh chụp minh chứng cho: chuyển vòng & gửi email hàng loạt, bảng màu mới (sáng/tối), gợi ý việc làm bằng AI (Trang chủ, Việc làm, Chi tiết việc làm).
  - Kiểm tra gửi email thật tới Gmail cá nhân qua Google Apps Script.
- **Lịch sử Git Repository** (một số commit chính):
  - `feat(oauth2)`: Tích hợp OAuth 2.0 thật với Google & LinkedIn (`00c41ce`, `3fb1401`).
  - `feat(chat)`: Nhắn tin tuyển dụng 3 cột thời gian thực (`440ecf4`).
  - `feat(ai)`: Bóc tách CV PDF/DOCX thật & microservice PyTorch Bi-Encoder (`73e82bb`, `b75f0d4`).
  - `feat(i18n & data)`: Song ngữ VI/EN toàn hệ thống (`36ae70d`).
  - `feat(admin)`: Thiết kế lại Admin (`241e673`).
  - `feat(ats)`: Chuyển vòng hàng loạt + khung soạn email (`9c6ce96`), kênh gửi Google Apps Script (`c460f6c`, `deee0d4`).
  - `feat(ai-recommendations)`: Động cơ gợi ý 4 tiêu chí (`0d8eae0`), hiệu chỉnh điểm theo cấp bậc & chuyên môn (`35ce219`).
  - `fix(oauth)`: Sửa email xin quyền Google bị gửi lặp lại (`234b149`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn 1 (AI chấm điểm quá cao, không sát thực tế)**: CV Intern vẫn đạt trên 90% ở JD Junior 1–3 năm, và CV không có Flutter vẫn đạt 95% ở tin Mobile Flutter.
  - *Nguyên nhân*: (1) So khớp kiểu chuỗi con nên `"ts"` khớp với `projects`, khiến CV tiếng Anh nào cũng bị coi là biết TypeScript; (2) tin Flutter trong dữ liệu mẫu bị gắn sai tag `[TypeScript, Git]`; (3) thuật toán cũ cho điểm kinh nghiệm 86% với ứng viên 0 năm ở JD Junior và luôn nâng điểm lên tối thiểu 92% khi trùng hết từ khóa.
  - *Giải pháp*: So khớp theo ranh giới từ, sửa tag dữ liệu mẫu, thêm bước kiểm tra chuyên môn trong tiêu đề JD, và giới hạn điểm theo khoảng cách kinh nghiệm (áp dụng đồng thời ở Spring Boot và microservice Python).
- **Khó khăn 2 (Email gửi đi bị trả về hoặc bị chặn)**: Email gửi tới tài khoản mẫu không tồn tại bị trả về; `fpt.com` chặn thư gửi từ Gmail cá nhân bằng quy tắc *FreeMail Policy*.
  - *Giải pháp*: Bỏ qua các email giả trong dữ liệu mẫu, không đặt `Reply-To` có tên miền giả. Trường hợp `fpt.com` là do chính sách của bên nhận, không phải lỗi hệ thống; muốn khắc phục cần gửi từ tên miền riêng đã xác minh (SPF/DKIM).
- **Khó khăn 3 (Google gửi email thông báo sau mỗi lần đăng nhập)**: Do URL OAuth luôn dùng `prompt=consent` nên lần nào Google cũng hỏi lại quyền.
  - *Giải pháp*: Đổi sang `prompt=select_account` và bỏ `access_type=offline` (hệ thống không cần refresh token của Google).
- **Khó khăn 4 (Lỗi khởi động `null id in Skill entry`)**: Cột `skills.category` trong MySQL là kiểu `ENUM` không có giá trị `MOBILE`.
  - *Giải pháp*: Dùng giá trị `OTHER` có sẵn, thống nhất với `JobServiceImpl`.

___

## 5. Kế hoạch tuần 11 (Dự kiến: Hoàn thiện, Kiểm thử & Chuẩn bị Báo cáo Đồ án)
### 5.1. Kiểm thử & Ổn định hệ thống
- Viết unit test JUnit 5 cho phần hiệu chỉnh điểm AI (`computeSeniorityCalibration`, `detectMissingTitleCoreSkill`, so khớp theo ranh giới từ) với các bộ CV mẫu Intern / Fresher / Junior / Senior.
- Cập nhật các kịch bản Playwright E2E cho luồng OAuth2, chuyển vòng hàng loạt và gợi ý việc làm.
- Tách nhỏ bundle frontend (hiện khoảng 1,1 MB) bằng `dynamic import()` để trang tải nhanh hơn.
### 5.2. Bổ sung tính năng còn lại
- Xuất báo cáo tuyển dụng / danh sách ứng viên ra CSV/PDF cho Nhà tuyển dụng và Admin.
- Tính năng đánh giá & nhận xét công ty.
### 5.3. Tài liệu & Triển khai
- Cập nhật tài liệu API (`04_API_SPECIFICATION.md`) và tài liệu kiến trúc microservice AI.
- Chuẩn bị môi trường demo/triển khai và slide báo cáo đồ án.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 4 Argon**

### Prompt
- "Hướng dẫn tích hợp OAuth 2.0 Authorization Code với Google và LinkedIn (OpenID Connect) cho Spring Boot + React."
- "Tư vấn cách đọc văn bản từ CV PDF/DOCX bằng PDFBox và cách dựng microservice FastAPI + PyTorch Bi-Encoder để chấm điểm CV so với JD."
- "Gợi ý kênh gửi email miễn phí dùng được khi chạy thật (Google Apps Script, Gmail SMTP), hiển thị tên người gửi theo từng công ty/HR."
- "Vì sao Google gửi email thông báo chia sẻ thông tin sau mỗi lần đăng nhập OAuth, và cách khắc phục."
- "Vì sao CV Intern vẫn đạt trên 90% với JD Junior 1–3 năm, và CV không có Flutter vẫn đạt 95% ở tin Mobile? Đề xuất cách hiệu chỉnh."

### AI tạo ra
- Khung mã nguồn cho luồng OAuth2, giao diện chat 3 cột, khung soạn email chuyển vòng hàng loạt và giao diện Admin mới.
- Khung microservice FastAPI (`main.py`, `model_arch.py`) và phiên bản đầu của thuật toán gợi ý việc làm 4 tiêu chí.
- Bản nháp các hàm hiệu chỉnh điểm theo cấp bậc và kiểm tra chuyên môn trong tiêu đề JD.

### SV đã sửa
- Tự kiểm tra hệ thống bằng **CV thật của bản thân** và phát hiện 2 lỗi chấm điểm quan trọng (CV Intern đạt >90% ở JD Junior; CV không có Flutter vẫn được gợi ý tin Mobile 95%), yêu cầu và kiểm chứng lại kết quả sau hiệu chỉnh (Junior 58–67%, Middle ≤54%, tin Mobile/Android bị loại).
- Phát hiện lỗi Google gửi email thông báo sau mỗi lần đăng nhập và yêu cầu chỉ hiện màn hình xin quyền ở lần đầu.
- Tự tạo và triển khai Google Apps Script làm kênh gửi email, cấu hình Gmail cá nhân làm địa chỉ gửi; yêu cầu bỏ ảnh đại diện/tên tài khoản cá nhân trong email gửi tới ứng viên, thay bằng tên công ty/HR.
- Phân tích lỗi thư bị `fpt.com` trả về (FreeMail Policy) để xác định đây là chính sách của bên nhận chứ không phải lỗi hệ thống.
- Định hướng giao diện (làm dịu màu, chế độ tối, chuyển ngôn ngữ VI | EN) và rà soát kết quả trên từng trang.
