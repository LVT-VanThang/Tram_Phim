package com.example.controller;

import com.example.dto.BookingDetailResponse;
import com.example.dto.MyBookingResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.dto.BookingResponse;
import com.example.dto.CreateBookingRequest;
import com.example.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody(required = false) CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public List<MyBookingResponse> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @GetMapping("/{id}")
    public BookingDetailResponse getBookingDetail(@PathVariable Integer id) {
        return bookingService.getBookingDetail(id);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<BookingResponse> handleResponseStatusException(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(BookingResponse.messageOnly(exception.getReason()));
    }
}
