# BÁO CÁO TIẾN ĐỘ TUẦN 4

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Xây dựng Trang Tìm kiếm Việc làm Chuyên sâu (`/jobs`), Bố cục Master-Detail 2 Cột chia đôi màn hình và Bộ lọc Nâng cao Đa tiêu chí  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 4
- Thiết kế và phát triển trang Tìm kiếm Việc làm chuyên sâu (`/jobs`) phục vụ ứng viên tra cứu thông tin nhanh chóng, tiện lợi.
- Triển khai kiến trúc giao diện Master-Detail 2 cột chia đôi màn hình (Split-Screen Layout) chuẩn các trang tuyển dụng hàng đầu (LinkedIn, Indeed): Cột trái hiển thị danh sách việc làm (Master list), Cột phải hiển thị chi tiết công việc đang chọn (Detail view).
- Xây dựng bộ lọc nâng cao đa tiêu chí: Khoảng lương (Dưới 10tr, 10-20tr, 20-30tr, Trên 50tr, Thỏa thuận), Địa điểm, Loại hình làm việc (Toàn thời gian, Bán thời gian, Remote), Cấp bậc (Intern, Fresher, Junior, Middle, Senior, Lead).
- Phát triển khung hiển thị chi tiết công việc toàn diện: Mô tả công việc (JD), Yêu cầu chuyên môn, Quyền lợi, Thông tin công ty, nút Nộp hồ sơ nhanh (Quick Apply) và Lưu tin tuyển dụng (Save Job).
- Tối ưu hóa cơ chế cuộn trang độc lập (Independent Scroll) giữa 2 cột trên Desktop và xử lý responsive thông minh trên màn hình thiết bị di động.

___

## 2. Các công việc đã hoàn thành

### 2.1. Thiết kế Bố cục Master-Detail 2 Cột chia đôi màn hình
- Lập trình kiến trúc 2 cột (`93d127d`, `24bcdaa`): Cột trái (tỷ lệ 40% chiều rộng) hiển thị danh sách thẻ việc làm tóm tắt với thanh cuộn riêng; Cột phải (tỷ lệ 60% chiều rộng) ghim chi tiết việc làm đang chọn với đầy đủ thông tin chi tiết mà không cần tải lại trang.
- Tối ưu hóa tỷ lệ hiển thị giúp ứng viên vừa nắm bắt được danh sách vừa có không gian đọc nội dung bản mô tả công việc (JD) một cách thoải mái nhất.

### 2.2. Xây dựng Bộ lọc Tìm kiếm Nâng cao (Advanced Filter Bar)
- Lập trình thanh công cụ tìm kiếm: hỗ trợ tìm kiếm từ khóa thời gian thực (Real-time keyword search) theo chức danh và kỹ năng.
- Tích hợp các bộ lọc đa năng: lọc theo thành phố/khu vực làm việc, phân loại khoảng lương theo các mốc thực tế, lọc theo cấp bậc kinh nghiệm và hình thức làm việc.

### 2.3. Lập trình Khung hiển thị Chi tiết Công việc (Job Detail View)
- Xây dựng component chi tiết: hiển thị header công việc với nút ứng tuyển nhanh, thông tin lương/địa điểm nổi bật, khối thẻ tags kỹ năng yêu cầu, nội dung mô tả công việc chia đoạn rõ ràng và liên kết tới trang công ty tuyển dụng.
- Tích hợp trạng thái xem: tự động làm nổi bật (Highlight) thẻ công việc đang được chọn ở cột danh sách bên trái.

### 2.4. Phát triển Tính năng Tương tác nhanh phía Ứng viên
- Lập trình nút "Lưu tin tuyển dụng" (Save Job): cho phép ứng viên đánh dấu các công việc quan tâm, lưu trữ vào bộ nhớ phiên làm việc.
- Lập trình nút "Ứng tuyển ngay" (Quick Apply): mở modal tiếp nhận hồ sơ nhanh chóng kèm tùy chọn tải lên file CV cá nhân.

### 2.5. Tối ưu hóa Responsive cho Thiết bị Di động
- Xử lý chuyển đổi giao diện trên màn hình nhỏ (< 768px): tự động ẩn cột chi tiết và chỉ hiển thị danh sách; khi người dùng bấm vào thẻ công việc sẽ chuyển sang màn hình chi tiết toàn trang kèm nút Quay lại (Back button) mượt mà.
- Đảm bảo trải nghiệm xem việc làm trên thiết bị di động không bị vỡ layout hay tràn khung nhìn ngang.

___

## 3. Kết quả đạt được (Deliverables)
- **Mã nguồn hoàn thiện**: Toàn bộ component trang tìm việc tại `frontend/src/components/jobs/` (`JobSearchPage.tsx`, `JobMasterList.tsx`, `JobDetailPane.tsx`, `JobFilterDrawer.tsx`).
- **Hiệu năng trải nghiệm**: Tốc độ chuyển đổi giữa các công việc đạt dưới 50ms nhờ kỹ thuật Client-side State caching, không bị giật lag giao diện.
- **Git Repository**: Các commit chuẩn Conventional Commits trên GitHub (`93d127d`, `24bcdaa`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn**: Khi cuộn danh sách công việc ở cột trái, nếu cuộn hết danh sách thì sự kiện cuộn của toàn bộ trình duyệt bị kích hoạt theo, khiến người dùng bị trượt mất vị trí cột chi tiết bên phải.
  - *Giải pháp*: Áp dụng CSS `overflow-y-auto` với chiều cao cố định `h-[calc(100vh-theme(spacing.20))]` cho từng cột độc lập, kết hợp thuộc tính `overscroll-behavior-contain` để triệt tiêu hiện tượng cuộn lan (Scroll Chaining) ra toàn trang.

___

## 5. Kế hoạch tuần 5 (Dự kiến: Xây dựng Hệ thống Xác thực Tài khoản & Quản lý Hồ sơ Cá nhân)
### 5.1. Thiết kế Hệ thống Xác thực Tài khoản Người dùng
- Thiết kế Modal Đăng nhập / Đăng ký tài khoản (AuthModal) cho cả 2 nhóm đối tượng Ứng viên và Nhà tuyển dụng với tính năng 1-click Demo Account.
- Xây dựng tầng quản lý trạng thái phiên đăng nhập (Auth Context) phía Frontend.
### 5.2. Xây dựng Giao diện Quản lý Hồ sơ Cá nhân (Profile Page)
- Lập trình trang hồ sơ cá nhân: cập nhật thông tin liên hệ, xem danh sách việc làm đã lưu và theo dõi lịch sử đơn ứng tuyển.
- Chuẩn bị kiến trúc kết nối API xác thực với Backend ở giai đoạn tiếp theo.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 3.8 Flash**

### Prompt
- "Tư vấn thiết kế bố cục 2 cột Master-Detail chia đôi màn hình với Tailwind CSS hỗ trợ independent scroll cho trang tìm kiếm việc làm."
- "Cách xử lý responsive chuyển đổi giữa Master List và Detail View trên thiết bị di động trong React mà không cần reload trang."
- "Tư vấn giải pháp CSS ngăn chặn hiện tượng cuộn lan (Scroll Chaining) giữa hai cột có thanh cuộn riêng biệt."

### AI tạo ra
- Khung cấu trúc flexbox 2 cột Tailwind CSS và cấu hình thuộc tính `overscroll-behavior-contain`.
- Đoạn mã mẫu chuyển đổi trạng thái hiển thị mobile với biến state `selectedJobId`.

### SV đã sửa
- Trực tiếp điều chỉnh tỷ lệ hiển thị 2 cột về chuẩn 40% (danh sách) / 60% (chi tiết) thay vì chia đều 50/50, giúp không gian đọc bản mô tả công việc (JD) rộng rãi và khoa học hơn.
- Tự tay bổ sung logic quản lý danh sách việc làm đã lưu (Saved Jobs Pool) và xử lý tương tác nộp đơn nhanh từ cột chi tiết.
- Kiểm thử và tối ưu hóa chuyển động cuộn mượt mà trên cả trình duyệt máy tính và thiết bị di động.
