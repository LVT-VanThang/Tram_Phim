package com.example.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user;
        try {
            user = authService.login(loginRequest.username, loginRequest.password);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", e.getMessage()));
        }

        List<String> roles = user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getRole_name())
                .collect(Collectors.toList());

        String token = JwtUtil.generateToken(user.getUsername(), roles);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "roles", roles,
                "full_name", user.getFull_name(),
                "email", user.getEmail(),
                "phone", user.getPhone()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User newUser = authService.register(request);

            return ResponseEntity.ok(Map.of(
                    "message", "Đăng ký tài khoản thành công!",
                    "username", newUser.getUsername(),
                    "full_name", newUser.getFull_name()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()));
        }
    }
}
