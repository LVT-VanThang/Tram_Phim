package com.example.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import com.example.dto.TopBookedMovieResponse;
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

    //Tìm kiếm phim theo tên và thể loại
    public List<Movie> searchMovies(String title, Integer genreId) {
        String normalizedTitle = title != null ? title.trim() : null;

        if (normalizedTitle != null && normalizedTitle.isEmpty()) {
            normalizedTitle = null;
        }

        return movieRepository.searchMovies(normalizedTitle, genreId);
    }

    public List<TopBookedMovieResponse> getTop5BookedMovies() {
        LocalDate currentDate = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        return movieRepository.findTop5BookedMovies(currentDate);
    }
}
