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

diagrams = {
    # 1. Login Use Case (Exactly like user reference image)
    "01_login_use_case": f"""@startuml
{skin_header}
actor User
actor Admin

rectangle "Login Use Case" {{
    usecase "Dang nhap" as UC_Login
    usecase "Kiem tra du lieu\\ndau vao" as UC_Validate
    usecase "Gioi han lan dang\\nnhap" as UC_RateLimit
    usecase "Xac thuc va tao\\nJWT" as UC_JWT
    usecase "Truy cap profile" as UC_Profile
    usecase "Xac thuc JWT" as UC_AuthJWT
    usecase "Phan quyen" as UC_RBAC

    User --> UC_Login
    Admin --> UC_Login

    UC_Login ..> UC_Validate : <<include>>
    UC_Login ..> UC_RateLimit : <<include>>
    UC_Login ..> UC_JWT : <<include>>
    UC_Login ..> UC_Profile : <<include>>

    UC_Profile ..> UC_AuthJWT : <<include>>
    UC_Profile ..> UC_RBAC : <<include>>
}}
@enduml""",

    # 2. CV Management & AI Parsing Use Case
    "02_cv_parsing_use_case": f"""@startuml
{skin_header}
actor "Ứng viên\\n(Candidate)" as Candidate

rectangle "CV Management & AI Parsing Use Case" {{
    usecase "Quan ly CV" as UC_CV
    usecase "Tai len file CV\\n(PDF/DOCX)" as UC_Upload
    usecase "Kiem tra hop le\\nva Magic Bytes" as UC_Validate
    usecase "Boc tach CV\\nbang AI" as UC_ParseAI
    usecase "Trich xuat ky nang\\nva kinh nghiem" as UC_Extract
    usecase "Anh xa vao\\nSkill Taxonomy" as UC_Taxonomy
    usecase "Doi soat thong tin\\nHuman-in-the-loop" as UC_Review
    usecase "Luu da phien ban\\nva Vector hoa" as UC_Save

    Candidate --> UC_CV

    UC_CV ..> UC_Upload : <<include>>
    UC_Upload ..> UC_Validate : <<include>>
    UC_CV ..> UC_ParseAI : <<include>>
    UC_ParseAI ..> UC_Extract : <<include>>
    UC_Extract ..> UC_Taxonomy : <<include>>
    UC_CV ..> UC_Review : <<include>>
    UC_Review ..> UC_Save : <<include>>
}}
@enduml""",

    # 3. Candidate-Job Matching & Explainable AI Use Case
    "03_matching_use_case": f"""@startuml
{skin_header}
actor "Ứng viên\\n(Candidate)" as Candidate
actor "Nhà tuyển dụng\\n(Recruiter)" as Recruiter

rectangle "Candidate - Job Matching Use Case" {{
    usecase "Xem do phu hop\\nviec lam" as UC_Match
    usecase "So khop Vector\\nCosine Similarity" as UC_Vector
    usecase "Doi chieu ky nang\\nbat buoc (Must-have)" as UC_MustHave
    usecase "Tinh diem tong the\\nMatch Score" as UC_CalcScore
    usecase "Giai thich ket qua\\n(Explainable AI)" as UC_Explain
    usecase "Boc tach ky nang\\nkhop (Matched)" as UC_Matched
    usecase "Chi ra ky nang\\nthieu (Missing)" as UC_Missing

    Candidate --> UC_Match
    Recruiter --> UC_Match

    UC_Match ..> UC_Vector : <<include>>
    UC_Match ..> UC_MustHave : <<include>>
    UC_Match ..> UC_CalcScore : <<include>>
    UC_Match ..> UC_Explain : <<include>>

    UC_Explain ..> UC_Matched : <<include>>
    UC_Explain ..> UC_Missing : <<include>>
}}
@enduml""",

    # 4. Skill Gap Analysis & Career Roadmap Use Case
    "04_skill_gap_roadmap_use_case": f"""@startuml
{skin_header}
actor "Ứng viên\\n(Candidate)" as Candidate

rectangle "Skill Gap & Career Roadmap Use Case" {{
    usecase "Nhan lo trinh\\nnghe nghiep" as UC_Roadmap
    usecase "Phan tich khoang\\ncach ky nang" as UC_Gap
    usecase "Xac dinh ky nang\\ncan bo sung" as UC_Deficit
    usecase "AI sinh lo trinh\\nca nhan hoa" as UC_GenAI
    usecase "Phan chia giai doan\\n(Milestones)" as UC_Milestones
    usecase "Goi y khoa hoc\\nva do an mau" as UC_Resources
    usecase "Theo doi tien do\\nhoan thanh" as UC_Track

    Candidate --> UC_Roadmap

    UC_Roadmap ..> UC_Gap : <<include>>
    UC_Gap ..> UC_Deficit : <<include>>
    UC_Roadmap ..> UC_GenAI : <<include>>
    UC_GenAI ..> UC_Milestones : <<include>>
    UC_GenAI ..> UC_Resources : <<include>>
    UC_Roadmap ..> UC_Track : <<include>>
}}
@enduml""",

    # 5. Job Posting & AI JD Analysis Use Case
    "05_job_posting_use_case": f"""@startuml
{skin_header}
actor "Nhà tuyển dụng\\n(Recruiter)" as Recruiter
actor "Hiring Manager" as HM

rectangle "Job Posting & AI JD Analysis Use Case" {{
    usecase "Dang tin\\ntuyen dung" as UC_Job
    usecase "Nhap mo ta\\ncong viec (JD)" as UC_Input
    usecase "Phan tich JD\\nbang AI" as UC_AnalyzeAI
    usecase "Trich xuat Must-have\\nva Nice-to-have" as UC_Weights
    usecase "Vector hoa noi dung\\ntin tuyen dung" as UC_Embedding
    usecase "Kiem duyet thong tin\\ndoanh nghiep" as UC_Verify
    usecase "Xuat ban va\\nthiet lap han nop" as UC_Publish

    Recruiter --> UC_Job
    HM --> UC_Job

    UC_Job ..> UC_Input : <<include>>
    UC_Job ..> UC_AnalyzeAI : <<include>>
    UC_AnalyzeAI ..> UC_Weights : <<include>>
    UC_AnalyzeAI ..> UC_Embedding : <<include>>
    UC_Job ..> UC_Verify : <<include>>
    UC_Job ..> UC_Publish : <<include>>
}}
@enduml""",

    # 6. ATS Pipeline Kanban & Interview Management Use Case
    "06_ats_kanban_interview_use_case": f"""@startuml
{skin_header}
actor "Nhà tuyển dụng\\n(Recruiter)" as Recruiter
actor "Hiring Manager" as HM

rectangle "ATS Pipeline & Interview Use Case" {{
    usecase "Quan ly ung vien\\ntren Kanban" as UC_Kanban
    usecase "Keo tha chuyen\\ntrang thai (Stage)" as UC_Drag
    usecase "Ghi nhan lich su\\nAudit Transition" as UC_Audit
    usecase "Len lich hen\\nphong van" as UC_Schedule
    usecase "Gui email moi\\ntu dong" as UC_Email
    usecase "Danh gia phong van\\ntheo Rubrics" as UC_Rubrics
    usecase "Trao doi ghi chu\\nnoi bo ung vien" as UC_Notes

    Recruiter --> UC_Kanban
    HM --> UC_Kanban

    UC_Kanban ..> UC_Drag : <<include>>
    UC_Drag ..> UC_Audit : <<include>>
    UC_Kanban ..> UC_Schedule : <<include>>
    UC_Schedule ..> UC_Email : <<include>>
    UC_Schedule ..> UC_Rubrics : <<include>>
    UC_Kanban ..> UC_Notes : <<include>>
}}
@enduml"""
}

def render_diagrams():
    for name, puml_source in diagrams.items():
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
    render_diagrams()
    print("\nAll 6 detailed EA-style Use Case diagrams generated successfully!")
