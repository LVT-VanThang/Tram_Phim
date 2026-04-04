package com.example.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {

    private String message;
    private Integer bookingId;
    private Integer showtimeId;
    private List<Integer> seatIds;
    private BigDecimal totalPrice;
    private String status;

    public BookingResponse() {
    }

    public BookingResponse(String message,
                           Integer bookingId,
                           Integer showtimeId,
                           List<Integer> seatIds,
                           BigDecimal totalPrice,
                           String status) {
        this.message = message;
        this.bookingId = bookingId;
        this.showtimeId = showtimeId;
        this.seatIds = seatIds;
        this.totalPrice = totalPrice;
        this.status = status;
    }

    public static BookingResponse messageOnly(String message) {
        return new BookingResponse(message, null, null, null, null, null);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
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
}
