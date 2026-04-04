package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin; // Dùng dấu * để lấy đủ lệnh
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.MovieRequest;
import com.example.entity.Movie;
import com.example.service.MovieService;

@RestController
@RequestMapping("/api/admin/movies") // Đường dẫn chuẩn cho Admin
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}) // MỞ CỬA CHO REACT
public class AdminMovieController {

    @Autowired
    private MovieService movieService;

    // QUAN TRỌNG: Phải có hàm GET này thì React mới có phim để hiện ra bảng
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // API Thêm Phim
    @PostMapping
    public ResponseEntity<?> createMovie(@RequestBody MovieRequest request) {
        try {
            Movie movie = movieService.createMovie(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Thêm phim thành công!",
                    "movie", movie
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API Sửa Phim
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Integer id, @RequestBody MovieRequest request) {
        try {
            Movie movie = movieService.updateMovie(id, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật phim thành công!",
                    "movie", movie
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API Xóa Phim
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Integer id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa phim thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Không thể xóa phim này! Có thể do phim đang có lịch chiếu. Chi tiết lỗi: " + e.getMessage()
            ));
        }
    }
}