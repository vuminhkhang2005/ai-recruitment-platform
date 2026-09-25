package com.talentbridge.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TalentBridge AI Recruitment Platform API")
                        .version("1.0.0")
                        .description("Official RESTful API Documentation for TalentBridge - AI-Powered Job Recruitment & Career Guidance Platform.")
                        .contact(new Contact()
                                .name("Vu Minh Khang")
                                .email("23110238@student.hcmute.edu.vn")
                                .url("https://github.com/vuminhkhang2005/ai-recruitment-platform"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ));
    }
}
