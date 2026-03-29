package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.entity.Movie;
import com.example.repository.MovieRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    // Lấy danh sách tất cả phim
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Lấy chi tiết 1 bộ phim theo ID
    public Optional<Movie> getMovieById(Integer id) {
        return movieRepository.findById(id);
    }
}