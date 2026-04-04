package com.example.dto;

import java.time.LocalDate;

public interface TopBookedMovieResponse {

    Integer getMovieId();

    String getTitle();

    String getDescription();

    Integer getDuration();

    String getPosterUrl();

    LocalDate getReleaseDate();

    Long getTotalBookings();
}
