package com.example.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.MovieRequest;
import com.example.entity.Genre;
import com.example.entity.Movie;
import com.example.repository.GenreRepository;
import com.example.repository.MovieRepository;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GenreRepository genreRepository; // Thêm dòng này để gọi được bảng Thể loại

    // ==========================================
    // CÁC HÀM DÀNH CHO KHÁCH HÀNG (GIỮ NGUYÊN)
    // ==========================================
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Optional<Movie> getMovieById(Integer id) {
        return movieRepository.findById(id);
    }

    public List<Movie> searchMovies(String title, Integer genreId) {
        String normalizedTitle = title != null ? title.trim() : null;
        if (normalizedTitle != null && normalizedTitle.isEmpty()) {
            normalizedTitle = null;
        }
        return movieRepository.searchMovies(normalizedTitle, genreId);
    }

    // ==========================================
    // CÁC HÀM MỚI DÀNH CHO ADMIN
    // ==========================================

    // 1. Thêm Phim
    @Transactional
    public Movie createMovie(MovieRequest request) {
        Movie movie = new Movie();
        movie.setTitle(request.title);
        movie.setDescription(request.description);
        movie.setDuration(request.duration);
        movie.setPoster_url(request.poster_url);
        movie.setRelease_date(request.release_date);

        // Map thể loại: Tìm các thể loại trong DB dựa vào danh sách ID gửi lên
        if (request.genre_ids != null && !request.genre_ids.isEmpty()) {
            List<Genre> genres = genreRepository.findAllById(request.genre_ids);
            movie.setGenres(genres); 
        }

        return movieRepository.save(movie);
    }

    // 2. Cập nhật Phim
    @Transactional
    public Movie updateMovie(Integer id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + id));

        movie.setTitle(request.title);
        movie.setDescription(request.description);
        movie.setDuration(request.duration);
        movie.setPoster_url(request.poster_url);
        movie.setRelease_date(request.release_date);

        // Cập nhật lại danh sách thể loại
        if (request.genre_ids != null) {
            List<Genre> genres = genreRepository.findAllById(request.genre_ids);
            movie.setGenres(genres);
        }

        return movieRepository.save(movie);
    }

    // 3. Xóa Phim
    @Transactional
    public void deleteMovie(Integer id) {
        if (!movieRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy phim để xóa!");
        }
        movieRepository.deleteById(id);
    }
}