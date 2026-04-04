package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.dto.RegisterRequest;
import com.example.entity.Role;
import com.example.entity.User;
import com.example.entity.UserRole;
import com.example.repository.RoleRepository;
import com.example.repository.UserRepository;
import com.example.repository.UserRoleRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    public User login(String username, String password) {
        User user = userRepository
                .findByUsernameAndStatus(username, 1)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Sai mật khẩu");
        }

        return user;
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (request.email != null && userRepository.existsByEmail(request.email)) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User newUser = new User();
        newUser.setUsername(request.username);
        newUser.setPassword(request.password);
        newUser.setFull_name(request.full_name);
        newUser.setEmail(request.email);
        newUser.setPhone(request.phone);
        newUser.setStatus(1);

        User savedUser = userRepository.save(newUser);

        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException(
                        "Lỗi cấu hình: Chưa có quyền 'USER' trong cơ sở dữ liệu!"));

        UserRole newUserRole = new UserRole();
        newUserRole.setUser(savedUser);
        newUserRole.setRole(userRole);
        userRoleRepository.save(newUserRole);

        return savedUser;
    }
}
