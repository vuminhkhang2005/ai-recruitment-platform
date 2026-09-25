package com.talentbridge.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "BearerAuth";
    public static final String COOKIE_AUTH = "CookieAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TalentBridge AI Recruitment Platform RESTful API")
                        .version("1.0.0")
                        .description("Official RESTful API Documentation for TalentBridge - AI-Powered Job Recruitment & Career Guidance Platform.\n\n"
                                + "### Hướng dẫn xác thực:\n"
                                + "- **JWT Bearer Token:** Nhấn nút **Authorize** ở trên, nhập `Bearer <token>` vào trường `BearerAuth`.\n"
                                + "- **HttpOnly Cookie:** Khi gọi `/api/v1/auth/login`, trình duyệt sẽ tự động lưu `accessToken` và `refreshToken` vào Cookie an toàn.")
                        .contact(new Contact()
                                .name("Vu Minh Khang (HCMUTE)")
                                .email("23110238@student.hcmute.edu.vn")
                                .url("https://github.com/vuminhkhang2005/ai-recruitment-platform"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server (Live)")
                ))
                .tags(List.of(
                        new Tag().name("1. Authentication & Security").description("Đăng ký, Đăng nhập, Refresh Token, Logout, OAuth2 Google & LinkedIn"),
                        new Tag().name("2. Jobs Management").description("Toàn diện CRUD việc làm, Lọc đa tiêu chí, Phân trang, Phân quyền Recruiter/Admin"),
                        new Tag().name("3. Applications Management").description("Nộp hồ sơ (Ứng viên), Xem danh sách đơn nộp, Cập nhật trạng thái duyệt (Nhà tuyển dụng)"),
                        new Tag().name("4. Companies Management").description("CRUD hồ sơ công ty tuyển dụng, Danh sách việc làm theo công ty"),
                        new Tag().name("5. User Profile").description("Xem và cập nhật thông tin cá nhân của ứng viên và nhà tuyển dụng"),
                        new Tag().name("6. Job Categories").description("Danh mục ngành nghề và định hướng thị trường")
                ))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Nhập token JWT dạng: `Bearer <token>`"))
                        .addSecuritySchemes(COOKIE_AUTH, new SecurityScheme()
                                .name("accessToken")
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .description("HttpOnly Cookie tự động đính kèm khi gọi từ Trình duyệt/Client")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH).addList(COOKIE_AUTH));
    }
}
