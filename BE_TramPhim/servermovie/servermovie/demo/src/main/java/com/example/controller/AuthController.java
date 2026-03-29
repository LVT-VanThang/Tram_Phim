package com.example.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.LoginRequest;
import com.example.dto.RegisterRequest;
import com.example.entity.User;
import com.example.service.AuthService;
import com.example.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // --- API ĐĂNG NHẬP ---
    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest loginRequest) {
        System.out.println("username: " + loginRequest.username);
        User user = authService.login(loginRequest.username, loginRequest.password);

        List<String> roles = user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getRole_name())
                .collect(Collectors.toList());

        String token = JwtUtil.generateToken(user.getUsername(), roles);

        return Map.of(
                "token", token,
                "roles", roles,
                "full_name", user.getFull_name(),
                "email", user.getEmail(),
                "phone", user.getPhone());
    }

    // --- API ĐĂNG KÝ ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Gọi sang AuthService để xử lý logic lưu vào Database
            User newUser = authService.register(request);
            
            // Nếu thành công, trả về HTTP 200 OK kèm thông báo
            return ResponseEntity.ok(Map.of(
                    "message", "Đăng ký tài khoản thành công!",
                    "username", newUser.getUsername(),
                    "full_name", newUser.getFull_name()
            ));
        } catch (RuntimeException e) {
            // Nếu có lỗi (ví dụ: trùng username, trùng email), bắt lỗi và trả về HTTP 400 Bad Request
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }
}