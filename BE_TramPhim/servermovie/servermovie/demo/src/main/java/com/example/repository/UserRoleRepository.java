package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
}