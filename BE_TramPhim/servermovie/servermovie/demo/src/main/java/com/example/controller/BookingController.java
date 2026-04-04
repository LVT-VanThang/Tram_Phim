package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.dto.BookingHistoryItem;
import com.example.dto.BookingResponse;
import com.example.dto.BookingStatusResponse;
import com.example.dto.CreateBookingRequest;
import com.example.service.BookingService;

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

    @GetMapping("/me")
    public ResponseEntity<List<BookingHistoryItem>> listMyBookings() {
        return ResponseEntity.ok(bookingService.listMyBookings());
    }

    @GetMapping("/{bookingId}/status")
    public ResponseEntity<BookingStatusResponse> getBookingStatus(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(bookingService.getBookingStatusForCurrentUser(bookingId));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<BookingResponse> handleResponseStatusException(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(BookingResponse.messageOnly(exception.getReason()));
    }
}
