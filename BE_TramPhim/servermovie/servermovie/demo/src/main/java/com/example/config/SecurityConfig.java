package com.example.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.util.JwtFilter;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // THÊM: Cho phép domain thật của Thắng
        //config.setAllowedOrigins(List.of("https://vanthang13.id.vn", "https://www.vanthang13.id.vn", "http://localhost:5173"));
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println(">>> SECURITY CONFIG LOADED <<<");
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(h -> h.disable())
                .formLogin(f -> f.disable()) // Tắt trang login mặc định
                .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
                        .requestMatchers("/api/auth/**","/auth/**").permitAll()
                        // Tránh lỗi match pattern khi deploy (render/proxy có thể thay đổi path).
                        // Trong app này, FE đang gọi toàn bộ endpoint /api/** nên cho phép truy cập công khai
                        // (admin vẫn bảo vệ riêng).
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/admin/**").hasAuthority("ADMIN")
                        .anyRequest().authenticated());

        // Với API (/api/**) thì không redirect về trang /login (SPA/API debugging sẽ rất khó),
        // mà trả 401 để frontend/Postman hiểu đúng lỗi.
        http.exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
            System.out.println("URI: " + request.getRequestURL());
            System.out.println("AUTH HEADER: " + request.getHeader("Authorization"));
            if (request.getRequestURI() != null && request.getRequestURI().startsWith("/api/")) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            response.sendRedirect("/login");
        }));
        return http.build();
    }
}
