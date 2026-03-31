package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.entity.Movie;
import com.example.service.MovieService;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    // API lay tat ca phim
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // API lay chi tiet 1 phim
    @GetMapping("/{id}")
    public Movie getMovieById(@PathVariable Integer id) {
        return movieService.getMovieById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy phim với ID: " + id));
    }

    // API tim phim theo ten
    @GetMapping("/search")
    public ResponseEntity<?> searchMoviesByTitle(@RequestParam String title) {
        String normalizedTitle = title.trim();

        if (normalizedTitle.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Tên phim không được để trống"));
        }

        List<Movie> movies = movieService.searchMoviesByTitle(normalizedTitle);
        return ResponseEntity.ok(movies);
    }
}
