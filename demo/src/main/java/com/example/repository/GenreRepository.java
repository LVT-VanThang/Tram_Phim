package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.entity.Genre;

public interface GenreRepository extends JpaRepository<Genre, Integer> {
    // Spring Data JPA đã lo hết các hàm cơ bản như findAll(), save(), deleteById()...
}