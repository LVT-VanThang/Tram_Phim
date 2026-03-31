package com.example.dto;

import java.util.List;

public class CreateBookingRequest {

    private Integer showtimeId;
    private List<Integer> seatIds;

    public CreateBookingRequest() {
    }

    public CreateBookingRequest(Integer showtimeId, List<Integer> seatIds) {
        this.showtimeId = showtimeId;
        this.seatIds = seatIds;
    }

    public Integer getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Integer showtimeId) {
        this.showtimeId = showtimeId;
    }

    public List<Integer> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Integer> seatIds) {
        this.seatIds = seatIds;
    }
}
