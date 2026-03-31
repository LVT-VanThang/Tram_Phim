package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.entity.Movie;

public interface MovieRepository extends JpaRepository<Movie, Integer> {

    List<Movie> findByTitleContainingIgnoreCase(String title);

    @Query("""
            select distinct m
            from Movie m
            left join m.genres g
            where (:title is null or lower(m.title) like lower(concat('%', :title, '%')))
              and (:genreId is null or g.genre_id = :genreId)
            """)
    List<Movie> searchMovies(@Param("title") String title, @Param("genreId") Integer genreId);
}
