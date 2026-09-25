import os
import json
import urllib.request

output_dir = r"C:\Users\DELL\.gemini\antigravity\scratch\ai-recruitment-platform\docs\phase-1-requirements\diagrams"
os.makedirs(output_dir, exist_ok=True)

# 1. Candidate Use Case Diagram (PlantUML EA Style)
candidate_puml = """@startuml
left to right direction
skinparam packageStyle rectangle
skinparam backgroundColor #FFFFFF
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12

skinparam actor {
    BackgroundColor #FEFECE
    BorderColor #A80036
}

skinparam usecase {
    BackgroundColor #EBF5FB
    BorderColor #2980B9
    ArrowColor #2C3E50
}

actor "Ứng viên\\n(Candidate)" as Candidate
actor "AI Service" as AI <<Secondary>>
actor "Cloud Storage" as Storage <<Secondary>>

rectangle "Hệ thống: Phân hệ Dành cho Ứng viên" {
    (UC-CAN-01: Quản lý Hồ sơ Cá nhân) as UC1
    (UC-CAN-02: Quản lý & Tải lên CV) as UC2
    (UC-CAN-03: Bóc tách CV bằng AI) as UC3
    (UC-CAN-04: Đối soát & Sửa thông tin AI) as UC4
    (UC-CAN-05: Tìm kiếm Việc làm Hybrid) as UC5
    (UC-CAN-06: Xem Điểm & Giải thích Match) as UC6
    (UC-CAN-07: Nộp Đơn Ứng tuyển) as UC7
    (UC-CAN-08: Phân tích Khoảng cách Kỹ năng) as UC8
    (UC-CAN-09: Nhận Lộ trình Học tập) as UC9
    (UC-CAN-10: Chat với Trợ lý AI) as UC10
    (UC-CAN-11: Quản lý Lịch Phỏng vấn) as UC11
}

Candidate --> UC1
Candidate --> UC2
Candidate --> UC5
Candidate --> UC10
Candidate --> UC11

UC2 ..> UC3 : <<include>>
UC3 ..> UC4 : <<include>>
UC5 ..> UC6 : <<extend>>
UC6 ..> UC7 : <<extend>>
UC6 ..> UC8 : <<extend>>
UC8 ..> UC9 : <<include>>

UC2 --> Storage
UC3 --> AI
UC6 --> AI
UC8 --> AI
UC10 --> AI
@enduml"""

# 2. Recruiter Use Case Diagram (PlantUML EA Style)
recruiter_puml = """@startuml
left to right direction
skinparam packageStyle rectangle
skinparam backgroundColor #FFFFFF
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12

skinparam actor {
    BackgroundColor #FEFECE
    BorderColor #A80036
}

skinparam usecase {
    BackgroundColor #E8F8F5
    BorderColor #16A085
    ArrowColor #2C3E50
}

actor "Nhà tuyển dụng\\n(Recruiter)" as Recruiter
actor "Hiring Manager" as HM
actor "AI Service" as AI <<Secondary>>
actor "Email Service" as Mail <<Secondary>>

rectangle "Hệ thống: Phân hệ Nhà tuyển dụng" {
    (UC-REC-01: Quản lý Hồ sơ Doanh nghiệp) as R1
    (UC-REC-02: Đăng Tin Tuyển dụng) as R2
    (UC-REC-03: Phân tích JD bằng AI) as R3
    (UC-REC-04: Quản lý Pipeline ATS Kanban) as R4
    (UC-REC-05: Xem Điểm & Xếp hạng AI) as R5
    (UC-REC-06: Tìm kiếm Hồ sơ Nhân tài) as R6
    (UC-REC-07: Lên Lịch Phỏng vấn) as R7
    (UC-REC-08: Chấm điểm Rubrics) as R8
    (UC-REC-09: Gửi Email Quyết định) as R9
    (UC-REC-10: Xem Báo cáo Phễu Tuyển dụng) as R10
}

Recruiter --> R1
Recruiter --> R2
Recruiter --> R4
Recruiter --> R6
Recruiter --> R10

HM --> R4
HM --> R8

R2 ..> R3 : <<include>>
R4 ..> R5 : <<include>>
R4 ..> R7 : <<extend>>
R7 ..> R8 : <<extend>>
R7 ..> R9 : <<include>>

R3 --> AI
R5 --> AI
R9 --> Mail
@enduml"""

# 3. Admin Use Case Diagram (PlantUML EA Style)
admin_puml = """@startuml
left to right direction
skinparam packageStyle rectangle
skinparam backgroundColor #FFFFFF
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12

skinparam actor {
    BackgroundColor #FEFECE
    BorderColor #A80036
}

skinparam usecase {
    BackgroundColor #FEF9E7
    BorderColor #F39C12
    ArrowColor #2C3E50
}

actor "Quản trị viên\\n(Admin)" as Admin
actor "AI Monitor" as AI <<Secondary>>

rectangle "Hệ thống: Phân hệ Quản trị viên" {
    (UC-ADM-01: Quản lý User & RBAC) as A1
    (UC-ADM-02: Kiểm duyệt Tin & Doanh nghiệp) as A2
    (UC-ADM-03: Quản lý Cây Kỹ năng Taxonomy) as A3
    (UC-ADM-04: Giám sát Tải & Token AI) as A4
    (UC-ADM-05: Kiểm toán Audit Logs) as A5
    (UC-ADM-06: Báo cáo Thống kê Toàn sàn) as A6
}

Admin --> A1
Admin --> A2
Admin --> A3
Admin --> A4
Admin --> A5
Admin --> A6

A4 --> AI
@enduml"""

# 4. Guest & Common Use Case Diagram (PlantUML EA Style)
common_puml = """@startuml
left to right direction
skinparam packageStyle rectangle
skinparam backgroundColor #FFFFFF
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12

skinparam actor {
    BackgroundColor #FEFECE
    BorderColor #A80036
}

skinparam usecase {
    BackgroundColor #F4ECF7
    BorderColor #8E44AD
    ArrowColor #2C3E50
}

actor "Khách vãng lai\\n(Guest)" as Guest
actor "Người dùng\\n(Registered User)" as User

rectangle "Hệ thống: Chức năng Dùng chung & Khách" {
    (UC-COM-01: Đăng ký Tài khoản) as C1
    (UC-COM-02: Đăng nhập JWT/OAuth) as C2
    (UC-COM-03: Quên Mật khẩu OTP) as C3
    (UC-COM-04: Xem Tin Tuyển dụng Công khai) as C4
    (UC-COM-05: Cài đặt Thông báo & 2FA) as C5
}

Guest --> C1
Guest --> C2
Guest --> C3
Guest --> C4

User --> C5
@enduml"""

diagrams = [
    ("01_use_case_candidate", candidate_puml),
    ("02_use_case_recruiter", recruiter_puml),
    ("03_use_case_admin", admin_puml),
    ("04_use_case_guest_common", common_puml)
]

def render_diagram(name, puml_code):
    for fmt in ["png", "svg"]:
        url = f"https://kroki.io/plantuml/{fmt}"
        data = json.dumps({"diagram_source": puml_code, "output_format": fmt}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
        target_file = os.path.join(output_dir, f"{name}.{fmt}")
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read()
                with open(target_file, "wb") as f:
                    f.write(content)
            print(f"Rendered: {target_file} ({len(content)} bytes)")
        except Exception as e:
            print(f"Error rendering {name}.{fmt}: {e}")

if __name__ == "__main__":
    for name, code in diagrams:
        render_diagram(name, code)
    print("\nAll EA-style diagrams rendered successfully!")
