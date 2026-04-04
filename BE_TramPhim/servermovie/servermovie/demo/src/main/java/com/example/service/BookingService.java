package com.example.service;

import java.util.List;

import com.example.dto.BookingHistoryItem;
import com.example.dto.BookingResponse;
import com.example.dto.BookingStatusResponse;
import com.example.dto.CreateBookingRequest;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    BookingStatusResponse getBookingStatusForCurrentUser(Integer bookingId);

    List<BookingHistoryItem> listMyBookings();
}
