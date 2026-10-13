# BÁO CÁO TIẾN ĐỘ TUẦN 3

**Đề tài:** Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp  
**Nội dung thực hiện:** Thiết lập Dự án Frontend React 19 + Vite, Xây dựng Hệ thống Design System UI/UX Pro Max và Hoàn thiện Trang chủ (Landing Page)  
**Sinh viên thực hiện:** Vũ Minh Khang - 23110238  

___

## 1. Mục tiêu tuần 3
- Khởi tạo kiến trúc dự án Frontend hiện đại sử dụng React 19, TypeScript, Vite và Tailwind CSS.
- Xây dựng hệ thống Design System UI/UX Pro Max chuẩn mực: bảng màu thương hiệu (Primary Ocean Blue, AI Indigo, Dark Slate), cặp phông chữ hiện đại (Plus Jakarta Sans + Inter), chuẩn tương phản màu sắc WCAG 2.1 AA (≥ 4.5:1) và 100% SVG Vector Icons từ `lucide-react`.
- Lập trình hoàn thiện toàn bộ các thành phần trên Trang chủ (Landing Page/Homepage): Navbar kính mờ (Frosted Glass), Hero Search Section lọc theo vị trí và ngành nghề, Thanh chỉ số uy tín (Stats Trust Bar), Lưới danh mục nghề nghiệp, Danh sách việc làm nổi bật và Footer.
- Xây dựng kịch bản kiểm thử giao diện tự động hóa với Playwright, chụp ảnh màn hình đa độ phân giải (Desktop, Tablet, Mobile) đảm bảo giao diện responsive hoàn hảo.

___

## 2. Các công việc đã hoàn thành

### 2.1. Cấu hình Frontend Core & Hệ thống Design System
- Khởi tạo dự án React 19 + TypeScript + Vite (`4421faa`): cấu hình Tailwind CSS, xây dựng bộ biến CSS Design Tokens (màu sắc, khoảng cách, bo góc, bóng đổ).
- Thiết lập hệ thống Typography: tích hợp font Plus Jakarta Sans cho các tiêu đề (Headings) tạo phong cách sang trọng và font Inter cho nội dung hiển thị tối ưu khả năng đọc.
- Chuẩn hóa bộ dữ liệu mẫu (Mock Dataset) phong phú phục vụ kiểm thử giao diện độc lập.

### 2.2. Lập trình Navbar & Footer toàn cục
- Lập trình `Navbar.tsx` (`0c5d3a5`): hiệu ứng kính mờ (Frosted Glass), chuyển đổi giao diện Sáng/Tối (Light/Dark mode), nút chuyển vai trò Ứng viên / Nhà tuyển dụng, menu trượt mượt mà trên thiết bị di động (Drawer navigation).
- Lập trình `Footer.tsx`: bố cục chuyên nghiệp hiển thị danh mục liên kết, huy hiệu bảo mật dữ liệu cá nhân Nghị định 13/2023/NĐ-CP và form đăng ký nhận bản tin xu hướng việc làm.

### 2.3. Lập trình Hero Section & Thanh tìm kiếm đa tiêu chí
- Lập trình `HeroSection.tsx` (`2bbfe32`): tiêu đề ấn tượng, thanh tìm kiếm nhanh hỗ trợ nhập từ khóa chức danh, bộ lọc địa điểm (Hà Nội, TP.HCM, Đà Nẵng, Remote) và lựa chọn cấp bậc kinh nghiệm.
- Tích hợp thẻ trực quan mô phỏng bóc tách CV thông minh hiển thị điểm số tương thích ATS với hiệu ứng micro-interactions mượt mà.

### 2.4. Lập trình Danh mục nghề nghiệp & Việc làm nổi bật
- Lập trình `CategoryGrid.tsx` & `SuggestedJobs.tsx` (`d302681`, `0ecf408`): hiển thị lưới 8 nhóm ngành nghề trọng điểm kèm số lượng tin tuyển dụng đang mở.
- Danh sách thẻ việc làm nổi bật (Featured Jobs Cards) hiển thị đầy đủ thông tin: mức lương cạnh tranh, logo doanh nghiệp, địa điểm làm việc và các thẻ kỹ năng công nghệ yêu cầu (Tags).

### 2.5. Kiểm thử tự động hóa giao diện (Playwright UI Automation)
- Xây dựng kịch bản kiểm thử Playwright tự động kiểm tra tương tác: mở/đóng menu drawer mobile, tìm kiếm nhanh trên thanh Hero, chuyển đổi theme sáng/tối.
- Thu thập và đánh giá ảnh chụp màn hình tự động ở 3 độ phân giải tiêu chuẩn: Desktop (1440x900), Tablet (768x1024), Mobile (390x844), xác nhận không có lỗi tràn lề ngang (horizontal overflow).

___

## 3. Kết quả đạt được (Deliverables)
- **Mã nguồn hoàn thiện**: Toàn bộ mã nguồn Frontend Trang chủ tại thư mục `frontend/src/components/home/` và `frontend/src/components/layout/`.
- **Kiểm thử giao diện**: Bộ ảnh chụp màn hình kiểm thử Playwright tại `frontend/screenshots/` đạt 100% tỷ lệ responsive chuẩn xác trên 3 kích thước thiết bị.
- **Git Repository**: Các commit chuẩn Conventional Commits trên GitHub (`4421faa`, `0c5d3a5`, `2bbfe32`, `d302681`, `0ecf408`).

___

## 4. Khó khăn gặp phải & Hướng giải quyết
- **Khó khăn**: Thanh Header kính mờ (Fixed Navbar) khi cuộn trang che khuất một phần tiêu đề của các section trên Landing Page khi người dùng bấm vào các liên kết neo (Anchor Links).
  - *Giải pháp*: Bổ sung thuộc tính CSS Tailwind `scroll-mt-24` vào tất cả các thẻ `<section>`, đảm bảo khi cuộn hoặc nhảy trang tiêu đề luôn giữ khoảng cách an toàn dưới thanh Navbar.

___

## 5. Kế hoạch tuần 4 (Dự kiến: Xây dựng Trang Tìm kiếm Việc làm Chuyên sâu & Bố cục Master-Detail)
### 5.1. Thiết kế Trang Tìm kiếm Việc làm Chuyên sâu (`/jobs`)
- Thiết kế bố cục Master-Detail 2 cột chia đôi màn hình: Cột trái hiển thị danh sách việc làm tìm kiếm (Master list), Cột phải hiển thị chi tiết công việc đang chọn (Detail view).
- Xây dựng thanh điều khiển tìm kiếm từ khóa kết hợp bộ lọc đa tiêu chí (Mức lương, Cấp bậc kinh nghiệm, Hình thức làm việc, Kỹ năng).
### 5.2. Lập trình Tính năng Tương tác nhanh với Việc làm
- Lập trình tính năng xem chi tiết JD, yêu cầu, quyền lợi, thông tin công ty; tích hợp các nút hành động nhanh: Nộp đơn ứng tuyển (Quick Apply) và Lưu tin tuyển dụng (Save Job).
- Tối ưu hóa cuộn trang độc lập (Independent Scroll) giữa hai cột và tối ưu hóa co giãn responsive trên thiết bị di động.

___

## AI hỗ trợ
**Google Antigravity**  
**Gemini 3.8 Flash**

### Prompt
- "Tư vấn thiết kế bộ quy chuẩn Design System UI/UX hiện đại cho nền tảng tuyển dụng công nghệ với Tailwind CSS và chuẩn trợ năng WCAG 2.1 AA."
- "Gợi ý bố cục Hero Section ấn tượng kết hợp thanh tìm kiếm việc làm đa tiêu chí và thẻ chỉ số uy tín (Stats Trust Bar)."
- "Hỗ trợ viết kịch bản Playwright tự động chụp ảnh màn hình kiểm thử giao diện responsive trên 3 kích thước Desktop, Tablet và Mobile."

### AI tạo ra
- Khung cấu hình màu sắc Tailwind `theme.extend.colors` theo phong cách hiện đại.
- Mã nguồn mẫu kịch bản Playwright kiểm tra tự động và lưu ảnh chụp màn hình đa thiết bị.

### SV đã sửa
- Trực tiếp cấu hình và tinh chỉnh hiệu ứng kính mờ (Glassmorphism) trên Navbar kết hợp bộ lọc backdrop-blur phù hợp cho cả 2 chế độ Sáng và Tối.
- Bổ sung các thuộc tính trợ năng `aria-label` cho toàn bộ các nút bấm và icon trên giao diện để đạt chuẩn kiểm thử WCAG.
- Tự tay khắc phục lỗi tràn chữ (text wrap) của các badge trên màn hình di động 390px.
