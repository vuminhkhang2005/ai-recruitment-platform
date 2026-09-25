import urllib.request
import json

puml = """@startuml
left to right direction
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

actor User
actor Admin

rectangle "Login Use Case" {
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
}
@enduml"""

req = urllib.request.Request(
    'https://kroki.io/plantuml/png',
    data=json.dumps({'diagram_source': puml, 'output_format': 'png'}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req) as resp:
    data = resp.read()
    with open('test_login_ea.png', 'wb') as f:
        f.write(data)
print('SUCCESS, size:', len(data))
