package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Genre;
import com.example.repository.GenreRepository;

import java.util.List;

@Service
public class GenreService {

    @Autowired
    private GenreRepository genreRepository;

    // Hàm lấy danh sách tất cả thể loại
    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }
}