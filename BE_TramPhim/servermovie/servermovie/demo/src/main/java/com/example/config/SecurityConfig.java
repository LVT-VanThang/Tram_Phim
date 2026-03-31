package com.example.config;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.dto.BookingResponse;
import com.example.util.JwtFilter;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String BOOKING_LOGIN_REQUIRED_MESSAGE = "Bạn cần đăng nhập để đặt vé";

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint bookingAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            new ObjectMapper().writeValue(
                    response.getOutputStream(),
                    BookingResponse.messageOnly(BOOKING_LOGIN_REQUIRED_MESSAGE));
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.httpBasic(httpBasic -> httpBasic.disable());
        http.formLogin(form -> form.disable());
        http.addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class);
        http.exceptionHandling(exception -> exception
                .defaultAuthenticationEntryPointFor(
                        bookingAuthenticationEntryPoint(),
                        request -> request.getRequestURI() != null
                                && request.getRequestURI().startsWith("/api/bookings")));

        http.authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD).permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/movies/**").permitAll()
                .requestMatchers("/api/showtimes/**").permitAll()
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers("/admin/**").hasAuthority("ADMIN")
                .anyRequest().authenticated());

        return http.build();
    }
}
