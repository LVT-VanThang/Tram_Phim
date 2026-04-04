package com.example.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsernameAndStatus(String username, Integer status);
    
    // Thêm 2 hàm này để check trùng khi đăng ký
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}