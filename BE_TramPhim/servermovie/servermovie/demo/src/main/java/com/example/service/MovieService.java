package com.example.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Movie;
import com.example.repository.MovieRepository;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    // Lay danh sach tat ca phim
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Lay chi tiet 1 bo phim theo ID
    public Optional<Movie> getMovieById(Integer id) {
        return movieRepository.findById(id);
    }

    // Tim phim theo tieu de
    public List<Movie> searchMoviesByTitle(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }
}
