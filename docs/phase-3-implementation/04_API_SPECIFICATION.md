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
