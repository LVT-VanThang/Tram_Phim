package com.example.service;

import com.example.dto.BookingResponse;
import com.example.dto.CreateBookingRequest;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);
}
