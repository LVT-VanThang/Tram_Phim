package com.example.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.entity.Showtime;

public interface ShowtimeRepository extends JpaRepository<Showtime, Integer> {

    @Query("""
            select s
            from Showtime s
            join fetch s.movie
            join fetch s.room
            order by s.show_date asc, s.start_time asc
            """)
    List<Showtime> findAllWithMovieAndRoom();

    @Query("""
            select s
            from Showtime s
            join fetch s.movie
            join fetch s.room
            where s.movie.movie_id = :movieId
            order by s.show_date asc, s.start_time asc
            """)
    List<Showtime> findByMovieId(@Param("movieId") Integer movieId);

    @Query("""
            select s
            from Showtime s
            join fetch s.movie
            join fetch s.room
            where s.movie.movie_id = :movieId
              and s.show_date = :showDate
            order by s.start_time asc
            """)
    List<Showtime> findByMovieIdAndShowDate(@Param("movieId") Integer movieId,
                                            @Param("showDate") LocalDate showDate);

    @Query("""
            select s
            from Showtime s
            join fetch s.movie
            join fetch s.room
            where s.showtime_id = :showtimeId
            """)
    Optional<Showtime> findDetailById(@Param("showtimeId") Integer showtimeId);
}
