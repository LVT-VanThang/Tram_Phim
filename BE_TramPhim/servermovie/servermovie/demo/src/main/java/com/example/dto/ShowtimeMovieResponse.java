package com.example.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeMovieResponse {

    private Integer movie_id;
    private String title;
    private Integer duration;
    private String poster_url;
    private LocalDate release_date;
}
