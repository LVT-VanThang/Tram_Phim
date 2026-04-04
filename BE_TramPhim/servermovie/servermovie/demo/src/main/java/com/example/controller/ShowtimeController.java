package com.example.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ShowtimeResponse;
import com.example.dto.ShowtimeSeatResponse;
import com.example.service.ShowtimeService;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    //APT lấy toàn bộ suất chiếu
    @GetMapping
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeService.getAllShowtimes();
    }

    //API lấy suất chiếu theo id phim
    @GetMapping("/movie/{movieId}")
    public List<ShowtimeResponse> getShowtimesByMovieId(@PathVariable Integer movieId) {
        return showtimeService.getShowtimesByMovieId(movieId);
    }

    //API lấy suất chiếu theo id phim và ngày
    @GetMapping("/movie/{movieId}/date")
    public List<ShowtimeResponse> getShowtimesByMovieIdAndDate(
            @PathVariable Integer movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate showDate) {
        return showtimeService.getShowtimesByMovieIdAndDate(movieId, showDate);
    }

    //API lấy chi tiết 1 suất chiếu
    @GetMapping("/{showtimeId}")
    public ShowtimeResponse getShowtimeById(@PathVariable Integer showtimeId) {
        return showtimeService.getShowtimeById(showtimeId);
    }

    //API lấy tất cả các ghế của 1 suất chiếu
    @GetMapping("/{showtimeId}/seats")
    public List<ShowtimeSeatResponse> getSeatsByShowtimeId(@PathVariable Integer showtimeId) {
        return showtimeService.getSeatsByShowtimeId(showtimeId);
    }
}
