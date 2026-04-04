package com.example.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class BookingDetailResponse {

    private Integer bookingId;
    private Integer userId;
    private Integer showtimeId;
    private Integer movieId;
    private String movieTitle;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer roomId;
    private String roomName;
    private List<Integer> seatIds;
    private List<String> seatNumbers;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime createdAt;

    public BookingDetailResponse() {
    }

    public BookingDetailResponse(Integer bookingId,
                                 Integer userId,
                                 Integer showtimeId,
                                 Integer movieId,
                                 String movieTitle,
                                 LocalDate showDate,
                                 LocalTime startTime,
                                 LocalTime endTime,
                                 Integer roomId,
                                 String roomName,
                                 List<Integer> seatIds,
                                 List<String> seatNumbers,
                                 BigDecimal totalPrice,
                                 String status,
                                 LocalDateTime createdAt) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.showDate = showDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.roomId = roomId;
        this.roomName = roomName;
        this.seatIds = seatIds;
        this.seatNumbers = seatNumbers;
        this.totalPrice = totalPrice;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Integer showtimeId) {
        this.showtimeId = showtimeId;
    }

    public Integer getMovieId() {
        return movieId;
    }

    public void setMovieId(Integer movieId) {
        this.movieId = movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    public LocalDate getShowDate() {
        return showDate;
    }

    public void setShowDate(LocalDate showDate) {
        this.showDate = showDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public List<Integer> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Integer> seatIds) {
        this.seatIds = seatIds;
    }

    public List<String> getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(List<String> seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
