package com.example.repository;

import java.time.LocalDate;
import java.util.List;

import com.example.dto.TopBookedMovieResponse;
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

    @Query(value = """
            select
                m.movie_id as movieId,
                m.title as title,
                m.description as description,
                m.duration as duration,
                m.poster_url as posterUrl,
                m.release_date as releaseDate,
                count(b.booking_id) as totalBookings
            from movies m
            left join showtimes s on m.movie_id = s.movie_id
            left join bookings b on s.showtime_id = b.showtime_id
            where s.show_date > :currentDate
            group by m.movie_id, m.title, m.description, m.duration, m.poster_url, m.release_date
            order by totalBookings desc
            limit 5
            """, nativeQuery = true)
    List<TopBookedMovieResponse> findTop5BookedMovies(@Param("currentDate") LocalDate currentDate);
}
