# Đặc Tả Kỹ Thuật API Phase 3 - TalentBridge

## 1. Danh Mục REST API Mới

### 1.1 Quản Lý Đội Ngũ Tuyển Dụng (Enterprise Hiring Team)

#### `GET /api/v1/team/overview`
- **Quyền hạn**: `ROLE_RECRUITER`
- **Mô tả**: Lấy tổng quan đội ngũ, bao gồm danh sách thành viên đang hoạt động và danh sách lời mời đang chờ phản hồi.
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "companyId": 1,
    "companyName": "VNG Corporation",
    "members": [
      {
        "id": 10,
        "userId": 2,
        "email": "recruiter.vng@vng.com.vn",
        "fullName": "Trần Minh Quân",
        "teamRole": "ADMIN",
        "jobTitle": "Head of Talent Acquisition",
        "active": true,
        "joinedAt": "2026-10-01T08:00:00"
      }
    ],
    "pendingInvitations": [
      {
        "id": 5,
        "email": "interviewer.tech@vng.com.vn",
        "fullName": "Đỗ Hoàng Long",
        "teamRole": "INTERVIEWER",
        "jobTitle": "Senior Backend Tech Lead",
        "status": "PENDING",
        "createdAt": "2026-10-10T14:00:00",
        "expiresAt": "2026-10-17T14:00:00"
      }
    ]
  }
}
```

#### `POST /api/v1/team/invitations`
- **Quyền hạn**: `ROLE_RECRUITER` (Yêu cầu quyền `ADMIN` trong công ty)
- **Request Body**:
```json
{
  "email": "interviewer.tech@vng.com.vn",
  "fullName": "Đỗ Hoàng Long",
  "jobTitle": "Senior Backend Tech Lead",
  "teamRole": "INTERVIEWER"
}
```
- **Response 201 Created**: Trả về `TeamInvitation` với trạng thái `PENDING` và gửi email kích hoạt tự động.

#### `DELETE /api/v1/team/invitations/{id}`
- **Quyền hạn**: `ROLE_RECRUITER` (ADMIN)
- **Mô tả**: Hủy lời mời đang chờ trước khi người dùng kích hoạt.

---

### 1.2 Kích Hoạt Lời Mời Công Khai (Public Token Invitation)

#### `GET /api/v1/auth/invitations/{token}`
- **Quyền hạn**: Công khai (Không cần đăng nhập)
- **Mô tả**: Xem trước thông tin lời mời để hiển thị giao diện tiếp nhận.
- **Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "token": "4763acdca11f0c630fe55737ce7791b8...",
    "email": "interviewer.tech@vng.com.vn",
    "fullName": "Đỗ Hoàng Long",
    "companyName": "VNG Corporation",
    "companyLogo": "https://img.vietnamworks.com/vng_logo.png",
    "teamRole": "INTERVIEWER",
    "invitedByName": "Trần Minh Quân",
    "expiresAt": "2026-10-17T14:00:00"
  }
}
```

#### `POST /api/v1/auth/invitations/{token}/accept`
- **Quyền hạn**: Công khai
- **Request Body**:
```json
{
  "fullName": "Đỗ Hoàng Long",
  "password": "Password@123",
  "phone": "0912345678"
}
```
- **Response 200 OK**: Trả về `AuthResponseDto` kèm JWT token đăng nhập tức thì.

---

### 1.3 Lịch Phỏng Vấn & Đánh Giá Tiêu Chuẩn (Interviews & Scorecards)

#### `GET /api/v1/applications/{applicationId}/interviews`
- **Quyền hạn**: `ROLE_RECRUITER` hoặc `ROLE_CANDIDATE` (Ứng viên sở hữu hồ sơ)
- **Mô tả**: Lấy danh sách tất cả các vòng phỏng vấn của hồ sơ kèm danh sách người phỏng vấn và đánh giá.

#### `POST /api/v1/applications/{applicationId}/interviews`
- **Quyền hạn**: `ROLE_RECRUITER` (ADMIN hoặc RECRUITER)
- **Request Body**:
```json
{
  "roundNumber": 1,
  "title": "Phỏng vấn chuyên môn Vòng 1",
  "scheduledStart": "2026-10-12T03:00:00Z",
  "scheduledEnd": "2026-10-12T03:45:00Z",
  "format": "ONLINE",
  "location": "https://meet.google.com/tb-interview-room",
  "notesToCandidate": "Chuẩn bị máy tính có webcam, micro và trình biên dịch mã nguồn.",
  "panelistUserIds": [2, 15]
}
```
- **Response 201 Created**: Lên lịch thành công, sinh file `.ics` và gửi thư mời email tự động.

#### `POST /api/v1/interviews/{interviewId}/evaluations`
- **Quyền hạn**: `ROLE_RECRUITER` (Thành viên ban phỏng vấn)
- **Request Body**:
```json
{
  "scorecard": {
    "technical": 5,
    "communication": 4,
    "problemSolving": 4,
    "cultureFit": 5
  },
  "recommendation": "STRONG_HIRE",
  "notes": "Ứng viên nắm rất sâu về hệ thống phân tán và kiến trúc microservices."
}
```
- **Response 200 OK**: Trả về `EvaluationDto` đã được ghi nhận.

#### `GET /api/v1/interviews/upcoming`
- **Quyền hạn**: `ROLE_RECRUITER`
- **Mô tả**: Lấy lịch trình phỏng vấn sắp diễn ra của doanh nghiệp hoặc theo người phỏng vấn.

---

### 1.4 Ghi Chú Nội Bộ Bảo Mật (Internal Team Notes)

#### `GET /api/v1/applications/{applicationId}/notes`
- **Quyền hạn**: `ROLE_RECRUITER` (Chỉ hội đồng tuyển dụng, ứng viên không có quyền truy cập)
- **Response 200 OK**: Trả về danh sách ghi chú (Lọc ghi chú Private theo quyền của user hiện tại).

#### `POST /api/v1/applications/{applicationId}/notes`
- **Quyền hạn**: `ROLE_RECRUITER`
- **Request Body**:
```json
{
  "content": "Ứng viên có chứng chỉ AWS Solutions Architect còn hiệu lực.",
  "isPrivate": false
}
```
- **Response 201 Created**: Trả về `NoteDto`.

#### `DELETE /api/v1/notes/{noteId}`
- **Quyền hạn**: `ROLE_RECRUITER` (Chính tác giả của ghi chú hoặc Hiring ADMIN).

---

### 1.5 Nhắn Tin Trực Tiếp (Direct Messaging)

#### `GET /api/v1/applications/{applicationId}/messages`
- **Quyền hạn**: Bên tham gia (Ứng viên hoặc Đội ngũ tuyển dụng công ty)
- **Response 200 OK**: Lịch sử tin nhắn theo thứ tự thời gian tăng dần.

#### `POST /api/v1/applications/{applicationId}/messages`
- **Quyền hạn**: Bên tham gia
- **Request Body**:
```json
{
  "content": "Dạ em xin chào anh/chị, em xin phép xác nhận lịch hẹn vào 10:00 sáng mai ạ!"
}
```
- **Response 201 Created**: Lưu tin nhắn vào MySQL và đồng thời phát sóng qua WebSocket topic `/topic/applications/{id}/messages`.

#### `PATCH /api/v1/applications/{applicationId}/messages/read`
- **Quyền hạn**: Bên tham gia
- **Mô tả**: Đánh dấu các tin nhắn chưa đọc của phía đối phương là đã đọc.

#### `GET /api/v1/messages/threads`
- **Quyền hạn**: `isAuthenticated()`
- **Mô tả**: Trả về danh sách các cuộc trò chuyện của người dùng hiện tại kèm số tin nhắn chưa đọc.

#### `GET /api/v1/messages/unread-count`
- **Quyền hạn**: `isAuthenticated()`
- **Mô tả**: Đếm tổng số tin nhắn chưa đọc để cập nhật badge số đỏ trên Navbar.

---

### 1.6 Bảo Mật Tài Khoản (Security)

#### `POST /api/v1/users/me/password`
- **Quyền hạn**: `isAuthenticated()`
- **Request Body**:
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456"
}
```
- **Response 200 OK**: Đổi mật khẩu thành công và cấp lại cặp Token JWT mới.

---

### 1.7 AI Gợi Ý Việc Làm Đa Chiều (Personalized AI Job Recommendations)

#### `GET /api/v1/ai/recommended-jobs?limit=6`
- **Quyền hạn**: `ROLE_CANDIDATE`
- **Mô tả**: Gợi ý danh sách việc làm phù hợp nhất với hồ sơ và CV mặc định của ứng viên dựa trên mô hình **Dual-Tower PyTorch Bi-Encoder + 4-Pillar Hybrid Scoring** (Skills 45%, Title & Specialization 25%, Location Priority 15%, Experience & Seniority 15%).
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "AI Job Recommendations retrieved successfully",
  "data": {
    "profileReady": true,
    "detectedSection": "Công nghệ thông tin",
    "candidateCity": "TP. Hồ Chí Minh",
    "candidateCitySource": "PROFILE",
    "candidateSkillCount": 8,
    "recommendations": [
      {
        "job": {
          "id": 102,
          "title": "Java Backend Developer (Spring Boot)",
          "companyName": "FPT Software",
          "location": "TP. Hồ Chí Minh",
          "experienceLevel": "JUNIOR"
        },
        "matchScore": 84.5,
        "matchLabel": "STRONG_MATCH",
        "matchedSkills": ["Java", "Spring Boot", "MySQL", "REST API", "Git"],
        "missingSkills": ["Docker"],
        "reasons": [
          "Khớp 5/6 kỹ năng yêu cầu (83%)",
          "Vị trí tương đồng cao với định hướng: Backend Developer",
          "Cùng khu vực làm việc: TP. Hồ Chí Minh (từ Hồ sơ cá nhân)",
          "Cấp bậc phù hợp năng lực hiện tại (Junior)"
        ],
        "locationMatch": "SAME_CITY",
        "detectedCandidateCity": "TP. Hồ Chí Minh",
        "detectedJobCity": "TP. Hồ Chí Minh"
      }
    ]
  }
}
```

---

### 1.8 Thao Tác Hàng Loạt & Gửi Email Tuyển Dụng (HR Bulk Actions & Email Composer)

#### `PATCH /api/v1/applications/bulk-status`
- **Quyền hạn**: `ROLE_RECRUITER`
- **Mô tả**: Chuyển trạng thái đồng loạt nhiều hồ sơ ứng tuyển (tối đa 100 hồ sơ/lần) kèm gửi email thông báo cá nhân hóa (hỗ trợ biến trộn `{{candidateName}}`, `{{jobTitle}}`, `{{companyName}}`) và ghi nhật ký thời gian tuyển dụng.
- **Request Body**:
```json
{
  "applicationIds": [12, 15, 19],
  "status": "INTERVIEW",
  "note": "Vượt qua vòng sàng lọc CV, mời làm bài test kỹ thuật",
  "sendCustomEmail": true,
  "emailSubject": "[{{companyName}}] Thư mời phỏng vấn vị trí {{jobTitle}}",
  "emailBody": "Chào {{candidateName}},\n\nChúc mừng bạn đã vượt qua vòng hồ sơ vị trí {{jobTitle}} tại {{companyName}}..."
}
```
- **Response 200 OK**: Trả về số lượng hồ sơ cập nhật thành công và số lượng email đã gửi.

---

### 1.9 Xuất Báo Cáo Dữ Liệu CSV & In PDF (Data Export & Reporting)

- **`GET /api/v1/exports/applications?jobId={optional}&lang={vi|en}`** (`ROLE_RECRUITER`): Xuất danh sách ứng viên kèm điểm AI Match, kỹ năng khớp/thiếu và trạng thái tuyển dụng ra chuẩn RFC 4180 CSV (UTF-8 BOM mở trực tiếp trên Microsoft Excel).
- **`GET /api/v1/exports/analytics?lang={vi|en}`** (`ROLE_RECRUITER`): Xuất báo cáo thống kê phễu tuyển dụng (Recruitment Funnel), phân phối điểm AI và hiệu quả theo từng tin đăng.
- **`GET /api/v1/exports/admin/users?keyword=&role=&status=&lang={vi|en}`** (`ROLE_ADMIN`): Xuất danh sách tài khoản người dùng toàn hệ thống.
- **`GET /api/v1/exports/admin/companies?keyword=&verificationStatus=&lang={vi|en}`** (`ROLE_ADMIN`): Xuất danh sách doanh nghiệp và trạng thái xác thực.
- **`GET /api/v1/exports/admin/jobs?keyword=&status=&companyId=&lang={vi|en}`** (`ROLE_ADMIN`): Xuất danh sách tin tuyển dụng toàn sàn.

---

### 1.10 Đánh Giá Công Ty & Kiểm Duyệt (Verified Company Reviews & Moderation)

#### `GET /api/v1/companies/{companyId}/reviews?rating={1..5}&page=0&size=10`
- **Quyền hạn**: Công khai (`permitAll`)
- **Mô tả**: Lấy thống kê điểm sao trung bình, biểu đồ phân phối 1-5 sao, tỷ lệ giới thiệu (`recommendRate`) và danh sách đánh giá đã duyệt (`APPROVED`) của công ty.

#### `GET /api/v1/companies/{companyId}/reviews/eligibility`
- **Quyền hạn**: `isAuthenticated()`
- **Mô tả**: Kiểm tra xem ứng viên hiện tại đã từng nộp hồ sơ ứng tuyển vào công ty chưa (`hasApplied`) và đã gửi đánh giá trước đó chưa (`alreadyReviewed`).

#### `POST /api/v1/companies/{companyId}/reviews`
- **Quyền hạn**: `ROLE_CANDIDATE` (Bắt buộc đã có ít nhất 1 hồ sơ ứng tuyển tại công ty)
- **Request Body**:
```json
{
  "rating": 5,
  "title": "Môi trường kỹ thuật xuất sắc, quy trình phỏng vấn chuyên nghiệp",
  "pros": "Đội ngũ mentor giàu kinh nghiệm, lương thưởng minh bạch, văn phòng hiện đại.",
  "cons": "Dự án đôi lúc nhịp độ nhanh vào giai đoạn release.",
  "isAnonymous": false,
  "workStatus": "INTERVIEWED",
  "jobTitle": "Java Backend Developer",
  "recommend": true
}
```
- **Response 201 Created**: Tạo đánh giá thành công và tự động tính toán lại điểm xếp hạng công ty.

#### `DELETE /api/v1/companies/{companyId}/reviews/{reviewId}`
- **Quyền hạn**: `ROLE_CANDIDATE` (Tác giả của đánh giá)

#### `GET /api/v1/admin/reviews?companyId=&status=&rating=&keyword=&page=0&size=15`
- **Quyền hạn**: `ROLE_ADMIN`
- **Mô tả**: Truy vấn toàn bộ đánh giá công ty trên hệ thống (hiển thị cả tác giả thật đối với đánh giá ẩn danh để phục vụ kiểm duyệt).

#### `PATCH /api/v1/admin/reviews/{reviewId}/status`
- **Quyền hạn**: `ROLE_ADMIN`
- **Request Body**: `{"status": "APPROVED" | "HIDDEN" | "REJECTED", "reason": "..."}`
- **Mô tả**: Ẩn/duyệt đánh giá và ghi nhận vào nhật ký kiểm toán (`AuditLog`).

#### `DELETE /api/v1/admin/reviews/{reviewId}`
- **Quyền hạn**: `ROLE_ADMIN`
- **Mô tả**: Xóa vĩnh viễn đánh giá vi phạm tiêu chuẩn cộng đồng và ghi nhận vào `AuditLog`.

---

## 2. Đặc Tả Giao Thức STOMP WebSocket

### 2.1 Cổng Kết Nối (Handshake)
- **URL**: `http://localhost:8080/ws` (SockJS fallback: `http://localhost:8080/ws/info`)
- **Khung Kết Nối (CONNECT Frame)**:
```stomp
CONNECT
accept-version:1.1,1.2
heart-beat:10000,10000
Authorization:Bearer <JWT_ACCESS_TOKEN>

^@
```

### 2.2 Đăng Ký Kênh (SUBSCRIBE Frame)
```stomp
SUBSCRIBE
id:sub-app-messages-42
destination:/topic/applications/42/messages

^@
```

### 2.3 Khung Nhận Tin Nhắn (MESSAGE Frame)
```stomp
MESSAGE
destination:/topic/applications/42/messages
content-type:application/json
subscription:sub-app-messages-42
message-id:msg-101

{
  "id": 101,
  "applicationId": 42,
  "senderUserId": 12,
  "senderName": "Nguyễn Văn An",
  "senderSide": "CANDIDATE",
  "content": "Dạ em xin chào anh/chị, em xin phép xác nhận lịch hẹn vào 10:00 sáng mai ạ!",
  "createdAt": "2026-10-10T16:35:00",
  "readAt": null
}
^@
```
