import os
import json
import urllib.request

output_dir = r"C:\Users\DELL\.gemini\antigravity\scratch\ai-recruitment-platform\docs\phase-1-requirements\diagrams"
os.makedirs(output_dir, exist_ok=True)

skin_header = """left to right direction
skinparam packageStyle rectangle
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam defaultFontColor #2C3E50

skinparam actor {
    BackgroundColor #FCEBB6
    BorderColor #7F6E65
}

skinparam usecase {
    BackgroundColor #EBF4FA-#C5E0F9
    BorderColor #4A708B
    FontColor #1F3A52
    FontStyle bold
}

skinparam arrow {
    Color #5D6D7E
    FontColor #2C3E50
    FontSize 11
}
"""

role_diagrams = {
    # 1. SƠ ĐỒ USE CASE PHÂN HỆ ỨNG VIÊN (CANDIDATE ROLE)
    "01_use_case_candidate_role": f"""@startuml
{skin_header}
actor "Ứng viên\\n(Candidate)" as Candidate

rectangle "Phân hệ Dành cho Ứng viên (Candidate Role)" {{
    ' Chức năng 1: Quản lý hồ sơ
    usecase "Quan ly ho so\\nca nhan" as UC_Profile
    usecase "Cap nhat thong tin\\nva Portfolio" as UC_UpdateProf

    ' Chức năng 2: Quản lý CV
    usecase "Quan ly & Tai len CV" as UC_CV
    usecase "Boc tach CV\\nbang AI" as UC_ParseAI
    usecase "Trich xuat ky nang\\nva kinh nghiem" as UC_Extract
    usecase "Doi soat thong tin\\nHuman-in-the-loop" as UC_Review
    usecase "Danh gia diem\\nchat luong CV" as UC_ScoreCV

    ' Chức năng 3: Tìm việc & Ứng tuyển & Matching
    usecase "Tim kiem viec lam" as UC_JobSearch
    usecase "Tim kiem Hybrid\\nSemantic" as UC_Hybrid
    usecase "Bo loc da tieu chi\\n(Faceted Filter)" as UC_Filter
    usecase "Xem do phu hop\\n(Match Score)" as UC_MatchScore
    usecase "Nop don\\nung tuyen" as UC_Apply
    usecase "Phan tich\\nSkill Gap" as UC_SkillGap
    usecase "Nhan lo trinh\\nCareer Roadmap" as UC_Roadmap

    ' Chức năng 4: Trợ lý AI
    usecase "Hoi thoai voi\\nAI Career Bot" as UC_ChatBot

    ' Liên kết Actor
    Candidate --> UC_Profile
    Candidate --> UC_CV
    Candidate --> UC_JobSearch
    Candidate --> UC_ChatBot

    ' Quan hệ Include & Extend của Hồ sơ & CV
    UC_Profile ..> UC_UpdateProf : <<include>>
    UC_CV ..> UC_ParseAI : <<include>>
    UC_ParseAI ..> UC_Extract : <<include>>
    UC_CV ..> UC_Review : <<extend>>
    UC_CV ..> UC_ScoreCV : <<extend>>

    ' Quan hệ Include & Extend của Tìm việc & Tuyển dụng
    UC_JobSearch ..> UC_Hybrid : <<include>>
    UC_JobSearch ..> UC_Filter : <<extend>>
    UC_JobSearch ..> UC_MatchScore : <<extend>>

    UC_MatchScore ..> UC_Apply : <<extend>>
    UC_MatchScore ..> UC_SkillGap : <<extend>>
    UC_SkillGap ..> UC_Roadmap : <<include>>
}}
@enduml""",

    # 2. SƠ ĐỒ USE CASE PHÂN HỆ NHÀ TUYỂN DỤNG (RECRUITER ROLE)
    "02_use_case_recruiter_role": f"""@startuml
{skin_header}
actor "Nhà tuyển dụng\\n(Recruiter)" as Recruiter
actor "Hiring Manager" as HM

rectangle "Phân hệ Nhà tuyển dụng (Recruiter Role)" {{
    ' Chức năng 1: Công ty
    usecase "Quan ly ho so\\ndoanh nghiep" as UC_Company

    ' Chức năng 2: Đăng tin
    usecase "Dang tin\\ntuyen dung" as UC_PostJob
    usecase "Phan tich JD\\nbang AI" as UC_AnalyzeJD
    usecase "Trich xuat ky nang\\nbat buoc (Must-have)" as UC_MustHave
    usecase "AI goi y toi uu\\nnoi dung JD" as UC_OptimizeJD
    usecase "Xuat ban tin\\ntuyen dung" as UC_PublishJob

    ' Chức năng 3: Quản lý Kanban ATS
    usecase "Quan ly Pipeline\\nATS Kanban" as UC_Kanban
    usecase "Xem xep hang\\nung vien AI" as UC_RankAI
    usecase "Keo tha chuyen\\ntrang thai (Stage)" as UC_MoveStage
    usecase "Trao doi ghi chu\\nnoi bo ung vien" as UC_Notes
    usecase "Len lich hen\\nphong van" as UC_Schedule
    usecase "Gui email moi\\ntu dong" as UC_Email
    usecase "Cham diem Rubrics\\nphong van" as UC_Rubrics

    ' Chức năng 4: Dashboard
    usecase "Xem Dashboard\\nthong ke tuyen dung" as UC_Dash

    ' Liên kết Actor
    Recruiter --> UC_Company
    Recruiter --> UC_PostJob
    Recruiter --> UC_Kanban
    Recruiter --> UC_Dash

    HM --> UC_Kanban
    HM --> UC_Rubrics

    ' Quan hệ Include & Extend
    UC_PostJob ..> UC_AnalyzeJD : <<include>>
    UC_AnalyzeJD ..> UC_MustHave : <<include>>
    UC_PostJob ..> UC_OptimizeJD : <<extend>>
    UC_PostJob ..> UC_PublishJob : <<include>>

    UC_Kanban ..> UC_RankAI : <<include>>
    UC_Kanban ..> UC_MoveStage : <<include>>
    UC_Kanban ..> UC_Notes : <<extend>>
    UC_Kanban ..> UC_Schedule : <<extend>>
    UC_Schedule ..> UC_Email : <<include>>
    UC_Schedule ..> UC_Rubrics : <<extend>>
}}
@enduml""",

    # 3. SƠ ĐỒ USE CASE PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN ROLE)
    "03_use_case_admin_role": f"""@startuml
{skin_header}
actor "Quản trị viên\\n(Admin)" as Admin

rectangle "Phân hệ Quản trị viên (Admin Role)" {{
    ' Chức năng 1: User & RBAC
    usecase "Quan ly nguoi dung\\nva RBAC" as UC_Users
    usecase "Khoa / Mo khoa\\ntai khoan" as UC_BanUser
    usecase "Phan quyen Role\\nva Permission" as UC_AssignRole

    ' Chức năng 2: Kiểm duyệt
    usecase "Kiem duyet\\nnoi dung san" as UC_Moderate
    usecase "Phe duyet ho so\\ndoanh nghiep" as UC_ApproveComp
    usecase "Kiem duyet tin\\ntuyen dung" as UC_ApproveJob

    ' Chức năng 3: Skill Taxonomy
    usecase "Quan ly Cây\\nSkill Taxonomy" as UC_Taxonomy
    usecase "Chuan hoa ten\\nky nang va Alias" as UC_Standardize

    ' Chức năng 4: Giám sát
    usecase "Kiem toan &\\nGiam sat he thong" as UC_Audit
    usecase "Giam sat han ngach\\nToken AI & Latency" as UC_MonitorAI
    usecase "Tra cuu nhat ky\\nAudit Logs" as UC_Logs

    Admin --> UC_Users
    Admin --> UC_Moderate
    Admin --> UC_Taxonomy
    Admin --> UC_Audit

    UC_Users ..> UC_BanUser : <<extend>>
    UC_Users ..> UC_AssignRole : <<include>>

    UC_Moderate ..> UC_ApproveComp : <<include>>
    UC_Moderate ..> UC_ApproveJob : <<include>>

    UC_Taxonomy ..> UC_Standardize : <<include>>

    UC_Audit ..> UC_MonitorAI : <<include>>
    UC_Audit ..> UC_Logs : <<include>>
}}
@enduml""",

    # 4. SƠ ĐỒ USE CASE PHÂN HỆ DÙNG CHUNG & KHÁCH (GUEST & COMMON ROLE)
    "04_use_case_guest_common_role": f"""@startuml
{skin_header}
actor "Khách vãng lai\\n(Guest)" as Guest
actor "Người dùng\\n(Registered User)" as User

rectangle "Chức năng Dùng chung & Khách (Guest & Common Role)" {{
    usecase "Dang ky\\ntai khoan" as UC_Register
    usecase "Xac thuc vai tro\\n(Candidate/Recruiter)" as UC_ChooseRole

    usecase "Dang nhap" as UC_Login
    usecase "Xac thuc va tao\\nJWT Token" as UC_JWT
    usecase "Xac thuc 2 buoc\\n(2FA TOTP)" as UC_2FA

    usecase "Quen mat khau" as UC_Forgot
    usecase "Xac thuc ma OTP\\nqua Email" as UC_OTP

    usecase "Xem tin tuyen dung\\ncong khai" as UC_ViewPublic

    Guest --> UC_Register
    Guest --> UC_Login
    Guest --> UC_Forgot
    Guest --> UC_ViewPublic

    User --> UC_2FA

    UC_Register ..> UC_ChooseRole : <<include>>
    UC_Login ..> UC_JWT : <<include>>
    UC_Login ..> UC_2FA : <<extend>>
    UC_Forgot ..> UC_OTP : <<include>>
}}
@enduml"""
}

def render_role_diagrams():
    for name, puml_source in role_diagrams.items():
        for fmt in ["png", "svg"]:
            url = f"https://kroki.io/plantuml/{fmt}"
            data = json.dumps({"diagram_source": puml_source, "output_format": fmt}).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
            target_path = os.path.join(output_dir, f"{name}.{fmt}")
            try:
                with urllib.request.urlopen(req, timeout=20) as resp:
                    raw_data = resp.read()
                    with open(target_path, "wb") as f:
                        f.write(raw_data)
                print(f"Rendered: {name}.{fmt} ({len(raw_data)} bytes)")
            except Exception as e:
                print(f"Error {name}.{fmt}: {e}")

if __name__ == "__main__":
    render_role_diagrams()
    print("\nAll Role-based Use Case diagrams rendered successfully!")
