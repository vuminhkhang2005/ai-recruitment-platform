# BÁO CÁO TIẾN ĐỘ TUẦN 8
Đề tài: Xây dựng nền tảng hỗ trợ tuyển dụng và định hướng nghề nghiệp (TalentBridge)
Nội dung thực hiện: Triển khai Hệ thống Đội ngũ Tuyển dụng Doanh nghiệp (Enterprise Hiring Team RBAC), Email Giao dịch Tự động kèm File Lịch (.ics RFC 5545), Nhắn tin Thời gian thực STOMP WebSocket, Đánh giá Phỏng vấn Rubric Scorecards & Ghi chú Bảo mật
Sinh viên thực hiện: Vũ Minh Khang - 23110238

1. Mục tiêu tuần 8
- Hoàn thiện phân hệ Đội ngũ Tuyển dụng Doanh nghiệp (Enterprise Hiring Team) với phân quyền đa cấp bậc RBAC: Quản trị viên (ADMIN), Chuyên viên tuyển dụng (RECRUITER), Người phỏng vấn kỹ thuật (INTERVIEWER).
- Xây dựng cơ chế gửi lời mời thành viên bằng mã Token bảo mật 256-bit qua email, cho phép tiếp nhận và kích hoạt tài khoản trực tuyến một lần tại route công khai (/invite/:token).
- Triển khai hệ thống Email giao dịch (Transactional Email) bất đồng bộ (@Async) với Spring Boot JavaMailSender, tự động sinh và đính kèm file sự kiện lịch .ics theo chuẩn quốc tế RFC 5545 tương thích Google Calendar, Microsoft Outlook và Apple Calendar.
- Thiết lập kênh trao đổi thông tin thời gian thực giữa Ứng viên và Ban tuyển dụng qua giao thức STOMP over WebSocket (/ws), tích hợp tầng bảo mật bắt chặn StompAuthChannelInterceptor xác thực JWT và ngăn chặn triệt để lỗ hổng IDOR.
- Xây dựng bảng đánh giá phỏng vấn tiêu chuẩn Rubric Scorecard (4 tiêu chí: Chuyên môn, Giao tiếp, Giải quyết vấn đề, Văn hóa) và hệ thống ghi chú nội bộ phân cấp (Private / Shared Notes).
- Phát triển giao diện Lịch phỏng vấn tổng hợp (/employer/interviews), biên tập Hồ sơ công ty (/employer/company), và tính năng Đổi mật khẩu tài khoản an toàn (/profile#security).
- Xây dựng bộ kịch bản kiểm thử tự động hóa toàn diện End-to-End với Playwright (test_phase_f_enterprise_flow.cjs) đạt 100% tỷ lệ thành công (0 lỗi, 0 thất bại).
- Xuất bản bộ tài liệu kỹ thuật chuyên sâu (Kiến trúc Email, Giao thức WebSocket, Ma trận RBAC, Đặc tả REST/STOMP API).

2. Các công việc đã hoàn thành
2.1. Phân hệ Đội ngũ Tuyển dụng Doanh nghiệp & Phân quyền RBAC Đa cấp (Enterprise Hiring Team)
- Thiết kế và mở rộng cơ sở dữ liệu MySQL qua bản Flyway migration V2__hiring_team_interviews_messaging_email.sql: bổ sung 2 bảng cốt lõi company_team_members và company_team_invitations.
- Phân định rõ ràng ma trận quyền hạn cho 3 vai trò:
  + ADMIN: Toàn quyền quản trị đội ngũ, mời thành viên mới, phân bổ lại vai trò, vô hiệu hóa/kích hoạt lại tài khoản, chỉnh sửa hồ sơ công ty và xem được toàn bộ ghi chú riêng tư.
  + RECRUITER: Đăng tin/sửa tin tuyển dụng, chuyển giai đoạn ứng tuyển, lên lịch phỏng vấn, chấm điểm và trao đổi tin nhắn với ứng viên.
  + INTERVIEWER: Xem danh sách ứng viên của các vị trí được phân công, theo dõi lịch phỏng vấn cá nhân, chấm điểm Rubric Scorecard, để lại ghi chú nội bộ và trao đổi tin nhắn với ứng viên; không có quyền xóa tin hay mời thành viên khác.
- Quy trình mời thành viên bằng Token bảo mật một lần (One-Time Token):
  + Sinh chuỗi ngẫu nhiên 64 ký tự hex (256-bit entropy) từ SecureRandom, lưu trong bảng company_team_invitations với trạng thái PENDING và thời hạn 7 ngày.
  + Giao diện tiếp nhận lời mời (/invite/:token): kiểm tra tính hợp lệ của token, hiển thị xem trước thông tin doanh nghiệp, vai trò phân công, và cho phép thành viên tự thiết lập mật khẩu cá nhân.
  + Khi kích hoạt thành công, hệ thống tự động khởi tạo tài khoản User (ROLE_RECRUITER), liên kết bản ghi TeamMember và cấp cặp token JWT (Access Token + Refresh Token) để đăng nhập tức thì.
- Xây dựng trang Quản lý Đội ngũ (/employer/team): Hiển thị bảng danh sách thành viên hiện tại, danh sách lời mời đang chờ phản hồi, modal gửi thư mời mới, chức năng hủy lời mời, thay đổi vai trò và vô hiệu hóa thành viên.

2.2. Dịch vụ Email Giao dịch Tự động & Sinh Tệp Lịch (.ics RFC 5545)
- Áp dụng mô hình Kiến trúc Hướng sự kiện (Event-Driven Architecture): Tách rời hoàn toàn luồng xử lý HTTP request của người dùng khỏi luồng gửi thư SMTP bằng Spring ApplicationEventPublisher và TransactionalEmailListener (@Async), đảm bảo thời gian phản hồi giao diện luôn dưới 100ms.
- Xây dựng bộ sinh file sự kiện lịch iCalendar (.ics) chuẩn RFC 5545 tại EmailContentFactory:
  + Cấu trúc chuẩn hóa: VCALENDAR, VEVENT, UID duy nhất theo mã phỏng vấn, DTSTART và DTEND tính toán theo chuẩn UTC (Z), SUMMARY, DESCRIPTION, LOCATION (link Google Meet hoặc địa chỉ văn phòng), STATUS:CONFIRMED, ORGANIZER và ATTENDEE.
  + Hỗ trợ phương thức METHOD:REQUEST cho thư mời mới/dời lịch và METHOD:CANCEL khi buổi phỏng vấn bị hủy để Google/Outlook Calendar tự động cập nhật hoặc gỡ sự kiện.
- Các kịch bản email giao dịch được hỗ trợ:
  + Email mời tham gia đội ngũ tuyển dụng kèm liên kết kích hoạt tài khoản an toàn.
  + Thư mời phỏng vấn tự động kèm file đính kèm interview_round_<N>.ics.
  + Thư thông báo thay đổi thời gian/địa điểm phỏng vấn kèm file cập nhật lịch.
  + Thư thông báo hủy lịch phỏng vấn.
  + Thư thông báo cập nhật kết quả hồ sơ ứng tuyển (chúc mừng nhận offer hoặc cảm ơn).
- Tích hợp và kiểm thử tự động với máy chủ giả lập MailDev v3 (SMTP cổng 1025, REST API cổng 1080), cho phép trích xuất nội dung HTML và kiểm tra tính toàn vẹn của tệp đính kèm trong các kịch bản test Playwright.

2.3. Hệ thống Nhắn tin Thời gian thực STOMP over WebSocket (/ws)
- Thiết lập hạ tầng truyền thông hai chiều full-duplex: Cấu hình WebSocketMessageBrokerConfigurer với endpoint STOMP /ws (hỗ trợ SockJS fallback) và Message Broker trong bộ nhớ phục vụ định tuyến tin nhắn đến tiền tố /topic.
- Tầng bảo mật bắt chặn kênh STOMP (StompAuthChannelInterceptor):
  + Tại lệnh CONNECT: Trích xuất và xác thực JWT Bearer token qua header Authorization hoặc STOMP passcode, gán UserPrincipal vào phiên làm việc.
  + Tại lệnh SUBSCRIBE: Bắt chặn và kiểm tra quyền sở hữu đối với đích đến /topic/applications/{id}/messages. Chỉ cho phép chính ứng viên nộp hồ sơ hoặc thành viên đội ngũ tuyển dụng của doanh nghiệp đăng tuyển đăng ký nhận tin, ngăn chặn triệt để lỗ hổng rò rỉ dữ liệu giữa các doanh nghiệp (IDOR).
- Tự động hóa cập nhật trạng thái đọc tin nhắn:
  + Cập nhật thời điểm đọc tin (readAt) khi người dùng mở phòng chat qua PATCH /api/v1/applications/{id}/messages/read.
  + Phát sóng thông báo đã đọc qua kênh /topic/applications/{id}/read, hiển thị trực quan biểu tượng CheckCheck xanh trên giao diện tin nhắn của đối phương.
  + Tính toán số lượng tin nhắn chưa đọc tổng thể qua GET /api/v1/messages/unread-count để hiển thị badge số màu xanh/đỏ trên thanh Navbar.
- Giao diện Dual-Pane chuyên nghiệp tại /messages:
  + Cột bên trái: Danh sách các cuộc trò chuyện phân loại theo từng hồ sơ ứng tuyển, hỗ trợ tìm kiếm nhanh theo tên ứng viên, công ty hoặc vị trí công việc, hiển thị trích đoạn tin nhắn gần nhất và thời gian tương đối.
  + Cột bên phải: Khung hội thoại chi tiết hiển thị thẻ ứng viên/công ty, lịch sử tin nhắn với bong bóng chat thông minh (căn phải cho tin của mình, căn trái cho đối tác), ô nhập văn bản hỗ trợ phím tắt Enter để gửi và Shift + Enter để xuống dòng.
  + Tích hợp khung chat nhanh ngay trong tab "Tin nhắn" của bảng quản lý ứng viên ApplicantsPage.

2.4. Bảng Đánh Giá Năng Lực Rubric Scorecard & Ghi Chú Nội Bộ Bảo Mật
- Thiết kế bảng chấm điểm phỏng vấn theo khung Rubric chuẩn hóa tại bảng interview_evaluations:
  + Đánh giá 4 chiều năng lực cốt lõi theo thang điểm 1 đến 5: Kỹ năng chuyên môn (Technical), Giao tiếp (Communication), Giải quyết vấn đề (Problem Solving), Mức độ phù hợp văn hóa (Culture Fit).
  + Khuyến nghị tuyển dụng bắt buộc theo chuẩn công nghiệp: STRONG_HIRE (Rất nên tuyển), HIRE (Nên tuyển), NEUTRAL (Cân nhắc), NO_HIRE (Không phù hợp), STRONG_NO_HIRE (Rất không phù hợp).
  + Nhận xét chi tiết của từng thành viên ban phỏng vấn, đảm bảo tính khách quan và minh bạch trong hội đồng tuyển dụng.
- Hệ thống Ghi chú Nội bộ bảo mật tại bảng application_notes:
  + Ghi chú Toàn đội ngũ (Shared Notes): Mọi thành viên trong ban tuyển dụng đều có thể đọc để nắm bắt thông tin chung về ứng viên.
  + Ghi chú Riêng tư (Private Notes): Được bảo vệ bằng cờ is_private. Chỉ chính tác giả tạo ghi chú và thành viên có vai trò ADMIN của công ty mới có quyền truy xuất; các Interviewer khác hoàn toàn không thấy được nội dung, bảo vệ an toàn các nhận xét nhạy cảm về mức lương hoặc thỏa thuận cá nhân.

2.5. Hoàn Thiện Giao Diện Quản Trị Phỏng Vấn, Hồ Sơ Công Ty & Đổi Mật Khẩu
- Trang Lịch Phỏng vấn Doanh nghiệp (/employer/interviews): Bảng điều khiển tổng hợp toàn bộ các buổi hẹn phỏng vấn sắp diễn ra, phân loại theo ngày/giờ, hình thức trực tuyến (Google Meet) hay trực tiếp, và danh sách hội đồng phỏng vấn được phân công.
- Trang Hồ sơ Doanh nghiệp (/employer/company): Cung cấp biểu mẫu cho phép Recruiter trực tiếp cập nhật các thông tin đại chúng của công ty (giới thiệu tổng quan, quy mô nhân sự, địa chỉ trụ sở, liên kết website chính thức).
- Tính năng Đổi Mật khẩu An toàn (/profile#security): Biểu mẫu bảo mật tại trang cá nhân với các bước xác thực mật khẩu hiện tại, kiểm tra độ dài và độ phức tạp của mật khẩu mới (tối thiểu 8 ký tự gồm chữ và số), mã hóa BCrypt tại backend và tự động cập nhật lại phiên làm việc.

2.6. Kiểm Thử Tự Động Hóa E2E Toàn Trình (Playwright Automation Testing)
- Xây dựng bộ test suite mới test_phase_f_enterprise_flow.cjs gồm 18 kiểm tra độc lập mô phỏng hành vi người dùng thật trên trình duyệt Chromium:
  1. Xác thực đăng nhập của Recruiter và Candidate.
  2. Hiển thị bảng thành viên đội ngũ và gửi lời mời thành viên mới.
  3. Bắt email lời mời qua MailDev v3, xác thực tiêu đề và trích xuất token bảo mật.
  4. Truy cập trang /invite/:token, kích hoạt tài khoản và tự động chuyển hướng vào bảng điều khiển.
  5. Mở danh sách ứng viên, kiểm tra hiển thị đầy đủ 4 tab: Hồ sơ, Phỏng vấn, Ghi chú, Tin nhắn.
  6. Lên lịch phỏng vấn trực tuyến với link Google Meet và kiểm tra email phát hành kèm file .ics.
  7. Thêm ghi chú nội bộ bảo mật và kiểm tra hiển thị.
  8. Gửi tin nhắn từ phía nhà tuyển dụng, đăng nhập tài khoản ứng viên để kiểm tra nhận tin nhắn thời gian thực và gửi phản hồi hai chiều.
  9. Đổi mật khẩu tài khoản tại trang hồ sơ cá nhân và xác thực đăng nhập lại bằng mật khẩu mới.
  10. Tải và xác thực trang Lịch phỏng vấn tổng hợp (/employer/interviews) và Hồ sơ công ty (/employer/company).
- Kết quả kiểm thử: Đạt 18/18 checks PASSED (100% tỷ lệ thành công, 0 lỗi, 0 thất bại).
- Kiểm thử hồi quy toàn diện: test_phase_e_full_flow.cjs đạt 15/15 passed, test_real_backend_flow.cjs đạt 9/9 passed.
- Kiểm tra kiểu dữ liệu TypeScript (npx tsc -b): 0 lỗi.
- Kiểm tra biên dịch backend (mvn test-compile & mvn test): 18/18 tests passed, BUILD SUCCESS.

3. Kết quả đạt được (Deliverables)
Mã nguồn hoàn thiện:
- Backend:
  + Controllers mới: TeamController, InterviewController, NoteController, MessageController, bổ sung endpoint POST /api/v1/users/me/password tại UserController.
  + Services: TeamService, HiringTeamService, InterviewService, NoteService, MessageService, EmailService, EmailContentFactory.
  + Entities & Repositories: CompanyInvitation, Interview, InterviewEvaluation, ApplicationNote, ApplicationMessage, EmailLog và các repository tương ứng.
  + Config & Security: WebSocketConfig, AsyncConfig, StompAuthChannelInterceptor, StompPrincipal, DomainEvents, TransactionalEmailListener.
  + Migration SQL: backend/src/main/resources/db/migration/V2__hiring_team_interviews_messaging_email.sql.
- Frontend:
  + Pages mới: AcceptInvitationPage (/invite/:token), MessagesPage (/messages), TeamPage (/employer/team), InterviewsAgendaPage (/employer/interviews), EmployerCompanyPage (/employer/company).
  + Nâng cấp ApplicantsPage: tích hợp 4 tab chuyên sâu (Hồ sơ, Phỏng vấn, Ghi chú, Tin nhắn).
  + Realtime context: frontend/src/realtime/RealtimeContext.tsx kết nối STOMP client tự động duy trì trạng thái kết nối.
  + ProfilePage: bổ sung PasswordChangeForm tại phân vùng #security.
Kiểm thử hệ thống:
- Bộ test tự động E2E test_phase_f_enterprise_flow.cjs đạt 18/18 checks passed (100%).
- Bộ test hồi quy test_phase_e_full_flow.cjs đạt 15/15 checks passed (100%).
- Bộ test backend test_real_backend_flow.cjs đạt 9/9 checks passed (100%).
- Lệnh npx tsc -b trên Frontend hoàn thành với 0 lỗi TypeScript.
Tài liệu kỹ thuật xuất bản:
- docs/phase-3-implementation/01_TRANSACTIONAL_EMAIL_SYSTEM.md: Kiến trúc Email giao dịch, mẫu thư và chuẩn lịch .ics RFC 5545 kèm Sequence Diagram.
- docs/phase-3-implementation/02_REALTIME_MESSAGING_WEBSOCKET.md: Giao thức STOMP WebSocket, cấu trúc topic và cơ chế bảo mật chặn IDOR kèm Sequence Diagram.
- docs/phase-3-implementation/03_ENTERPRISE_HIRING_TEAM_RBAC.md: Ma trận phân quyền RBAC đa cấp, quy trình token lời mời và bảng điểm Rubric.
- docs/phase-3-implementation/04_API_SPECIFICATION.md: Bảng đặc tả toàn bộ REST API và WebSocket endpoints kèm JSON payload thực tế.
Lịch sử Git Repository:
- Commit: 7c5a928 - feat(phase-3): implement enterprise hiring team, email with .ics, realtime messaging, and documentation (91 files changed, +8998 / -532 lines).
- Nhánh: main đã được đẩy thành công lên remote repository https://github.com/vuminhkhang2005/ai-recruitment-platform.git.

4. Khó khăn gặp phải & Hướng giải quyết
Khó khăn 1 (Độ trễ và nguy cơ tắc nghẽn luồng khi gửi email SMTP đồng bộ): Việc gửi email qua giao thức SMTP tới máy chủ bên ngoài thường mất từ 1 đến 3 giây cho mỗi bức thư. Nếu thực hiện đồng bộ trong tiến trình xử lý request HTTP của Controller, người dùng sẽ gặp hiện tượng giao diện bị đơ/chậm, thậm chí timeout khi gửi thư mời cho hội đồng phỏng vấn gồm nhiều người.
Giải pháp: Tái cấu trúc theo mô hình Kiến trúc Hướng sự kiện (Event-Driven Architecture) với Spring ApplicationEventPublisher. Khi Recruiter lên lịch phỏng vấn hoặc gửi lời mời, Controller lưu dữ liệu vào cơ sở dữ liệu và phát sinh Domain Event (InterviewScheduledEvent, TeamInvitationCreatedEvent) rồi trả về phản hồi 200 OK ngay lập tức (< 100ms). Tiến trình TransactionalEmailListener được đánh dấu @Async sẽ tiếp nhận sự kiện trong một Thread Pool riêng để kết nối SMTP và gửi email ngầm.

Khó khăn 2 (Nguy cơ rò rỉ dữ liệu qua kênh WebSocket STOMP - Lỗ hổng IDOR): Trong giao thức STOMP, nếu chỉ kiểm tra xác thực JWT tại thời điểm bắt tay kết nối (CONNECT), client độc hại sau khi đăng nhập vẫn có thể tùy tiện gửi lệnh SUBSCRIBE tới các topic của hồ sơ khác (ví dụ: /topic/applications/999/messages) để nghe lén các trao đổi nhạy cảm giữa ứng viên khác và nhà tuyển dụng.
Giải pháp: Xây dựng bộ chặn StompAuthChannelInterceptor cài đặt ChannelInterceptor của Spring Messaging. Tại lệnh SUBSCRIBE, hệ thống bóc tách applicationId từ đường dẫn topic, sau đó kiểm tra chéo với cơ sở dữ liệu: nếu người dùng hiện tại không phải là ứng viên sở hữu đơn nộp đó VÀ cũng không thuộc ban tuyển dụng của công ty sở hữu tin đăng đó, lệnh đăng ký kênh sẽ bị từ chối ngay lập tức với AccessDeniedException.

Khó khăn 3 (Tính toàn vẹn và bảo mật của quy trình mời thành viên vào ban tuyển dụng): Nếu tạo sẵn tài khoản với mật khẩu mặc định hoặc gửi liên kết kích hoạt không có giới hạn thời gian, kẻ tấn công có thể lợi dụng để chiếm đoạt quyền truy cập doanh nghiệp.
Giải pháp: Thiết kế quy trình Token kích hoạt một lần (One-Time Invite Token). Hệ thống sinh mã ngẫu nhiên 256-bit bằng SecureRandom, lưu trữ kèm thời hạn 7 ngày. Khi thành viên truy cập /invite/:token, hệ thống chỉ cho phép xem trước thông tin công ty và bắt buộc người dùng tự nhập mật khẩu mới. Khi kích hoạt thành công, token được đổi trạng thái sang ACCEPTED và không thể sử dụng lại lần thứ hai.

Khó khăn 4 (Xung đột bảo mật và phân quyền giữa các ghi chú nội bộ nhạy cảm): Trong quá trình phỏng vấn, các thành viên thường trao đổi các nhận xét sơ bộ về chuyên môn (cần chia sẻ cho toàn bộ hội đồng), nhưng cũng có những nhận xét nhạy cảm về kỳ vọng mức lương hoặc đánh giá tính cách (chỉ Admin hoặc người viết mới được xem). Nếu lưu chung vào một bảng ghi chú công khai sẽ vi phạm chính sách bảo mật nội bộ.
Giải pháp: Bổ sung trường is_private vào bảng application_notes. Tại NoteService, hệ thống áp dụng logic lọc dữ liệu dựa trên vai trò: nếu ghi chú có is_private = true, chỉ người dùng có userId trùng khớp với tác giả HOẶC người dùng có vai trò ADMIN trong công ty đó mới được phép đọc; các Interviewer khác khi gọi API chỉ nhận về danh sách các ghi chú công khai (Shared Notes).

5. Kế hoạch tuần 9 (Dự kiến: Tích hợp Trí tuệ Nhân tạo AI & Hoàn thiện Thuyết minh Đồ án)
5.1. Nghiên cứu & Tích hợp Trí tuệ Nhân tạo (Phase 4 AI Integration)
- Tích hợp Google Gemini AI API phục vụ trích xuất tự động thông tin từ file CV (AI Resume Parser): Phân tích văn bản PDF/DOCX thành cấu trúc dữ liệu chuẩn hóa (Kỹ năng, Kinh nghiệm làm việc, Học vấn, Dự án cá nhân).
- Xây dựng thuật toán tính toán độ tương thích ATS nâng cao kết hợp giữa so khớp từ khóa kỹ năng (Keyword Matching) và độ tương đồng ngữ nghĩa (Semantic Embedding Similarity).
- Tích hợp tính năng AI Interview Copilot: Gợi ý các câu hỏi phỏng vấn kỹ thuật chuyên sâu dựa trên sự đối chiếu giữa yêu cầu công việc (JD) và năng lực thực tế trong hồ sơ ứng viên.
5.2. Hoàn thiện Báo cáo Thuyết minh Đồ án & Video Demo
- Tổng hợp toàn bộ sơ đồ kiến trúc hệ thống, sơ đồ quan hệ thực thể ERD, sơ đồ ca sử dụng Use Case và các sơ đồ tuần tự Sequence Diagram vào cuốn Báo cáo Thuyết minh Đồ án tốt nghiệp theo quy chuẩn học thuật của Nhà trường.
- Chuẩn bị kịch bản và ghi hình video demo vận hành thực tế toàn bộ các phân hệ của TalentBridge (Cổng Ứng viên, Cổng Nhà tuyển dụng, Chat thời gian thực, Lịch phỏng vấn .ics và Đội ngũ tuyển dụng doanh nghiệp).

AI hỗ trợ
Google Antigravity
Gemini 3.8 Flash
Prompt
"Tư vấn thiết kế kiến trúc gửi email giao dịch bất đồng bộ (@Async) trong Spring Boot 3 sử dụng Spring ApplicationEventPublisher và JavaMailSender."
"Hướng dẫn cú pháp tệp sự kiện lịch iCalendar (.ics) theo chuẩn RFC 5545 cho buổi phỏng vấn trực tuyến với link Google Meet và thời gian UTC."
"Tư vấn phương án bắt chặn bảo mật kênh WebSocket STOMP với StompAuthChannelInterceptor để kiểm tra quyền truy cập topic theo applicationId (chống IDOR)."
"Gợi ý cấu trúc bảng điểm đánh giá phỏng vấn Rubric Scorecard chuẩn Greenhouse với 4 chiều năng lực và 5 mức khuyến nghị tuyển dụng."
"Hỗ trợ xây dựng kịch bản kiểm thử End-to-End với Playwright kiểm tra luồng mời thành viên, bắt email qua MailDev, kích hoạt tài khoản và chat thời gian thực."
AI tạo ra
Khung mã nguồn cơ bản (boilerplate) cho WebSocketConfig, AsyncConfig, TransactionalEmailListener và StompAuthChannelInterceptor.
Mẫu định dạng chuỗi iCalendar (.ics) RFC 5545 với các thuộc tính VCALENDAR, VEVENT, DTSTART, DTEND, UID.
Bộ khung kịch bản kiểm thử Playwright cho các thao tác điền form và bắt sự kiện qua cổng REST của MailDev.
Cấu trúc mẫu cho các lớp DTO: TeamDtos, InterviewDtos, MessageDtos, NoteDtos.
SV đã sửa
Trực tiếp thiết kế và hoàn thiện logic bảo mật bắt chặn STOMP: Bổ sung bước kiểm tra chéo người dùng với quyền sở hữu JobApplication trong cơ sở dữ liệu, chặn hoàn toàn việc người lạ subscribe vào kênh chat nội bộ của doanh nghiệp.
Tự tay lập trình thuật toán sinh tệp lịch .ics chuẩn RFC 5545: Xử lý định dạng thời gian chuẩn UTC (Z), tích hợp linh hoạt link Google Meet và địa chỉ văn phòng, xử lý cơ chế cập nhật/hủy lịch với METHOD:REQUEST và METHOD:CANCEL.
Thiết kế và tối ưu hóa trải nghiệm giao diện Dual-Pane cho trang tin nhắn (/messages): Tự động tạo thread dự phòng khi người dùng điều hướng từ danh sách ứng viên, bổ sung phím tắt Enter/Shift+Enter, tích hợp trạng thái đã xem (CheckCheck) và huy hiệu số tin chưa đọc trên Navbar.
Xây dựng và tinh chỉnh bộ kịch bản kiểm thử tự động Playwright test_phase_f_enterprise_flow.cjs: Xử lý chuẩn xác các bộ chọn DOM (data-testid), cơ chế đợi phản hồi mạng (waitForResponse), bắt chính xác token lời mời từ MailDev v3 và khôi phục an toàn mật khẩu tài khoản test sau khi hoàn tất.
Xuất bản toàn bộ hệ thống tài liệu kỹ thuật chi tiết tại thư mục docs/phase-3-implementation/ và cập nhật báo cáo tiến độ tuần theo quy chuẩn học thuật nghiêm ngặt.
