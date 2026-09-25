package com.talentbridge.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/", "/swagger-ui/index.html");
        registry.addRedirectViewController("/swagger", "/swagger-ui/index.html");
        registry.addRedirectViewController("/swagger-ui", "/swagger-ui/index.html");
        registry.addRedirectViewController("/swagger-ui/", "/swagger-ui/index.html");
        registry.addRedirectViewController("/docs", "/swagger-ui/index.html");
    }
}
