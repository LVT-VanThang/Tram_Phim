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

    // --- HÀM ĐĂNG NHẬP ---
    public User login(String username, String password) {

        User user = userRepository
                .findByUsernameAndStatus(username, 1)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Sai mật khẩu");
        }

        return user;
    }

    // --- HÀM ĐĂNG KÝ ---
    public User register(RegisterRequest request) {
        // 1. Kiểm tra xem username hoặc email đã bị người khác dùng chưa
        if (userRepository.existsByUsername(request.username)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (request.email != null && userRepository.existsByEmail(request.email)) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        // 2. Tạo đối tượng User mới với dữ liệu từ request
        User newUser = new User();
        newUser.setUsername(request.username);
        newUser.setPassword(request.password); // Vẫn đang lưu mật khẩu thô để test, sau này nâng cấp có thể mã hóa bằng BCrypt sau
        newUser.setFull_name(request.full_name);
        newUser.setEmail(request.email);
        newUser.setPhone(request.phone);
        newUser.setStatus(1); // 1 = Trạng thái Active (Cho phép hoạt động ngay)

        // Lưu user vào database (Lúc này database sẽ tự sinh ra user_id)
        User savedUser = userRepository.save(newUser);

        // 3. Lấy quyền "USER" mặc định từ bảng roles
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("Lỗi cấu hình: Chưa có quyền 'USER' trong cơ sở dữ liệu!"));

        // 4. Lưu liên kết giữa tài khoản mới và quyền "USER" vào bảng user_roles
        UserRole newUserRole = new UserRole();
        newUserRole.setUser(savedUser);
        newUserRole.setRole(userRole);
        userRoleRepository.save(newUserRole);

        return savedUser;
    }
}