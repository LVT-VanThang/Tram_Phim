package com.example.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponse {

    private Integer showtime_id;
    private Integer movie_id;
    private Integer room_id;
    private LocalDate show_date;
    private LocalTime start_time;
    private LocalTime end_time;
    private BigDecimal price;
    private ShowtimeMovieResponse movie;
    private ShowtimeRoomResponse room;
}
