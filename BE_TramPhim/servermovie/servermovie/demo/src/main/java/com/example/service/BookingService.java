package com.example.service;

import java.util.List;

import com.example.dto.BookingDetailResponse;
import com.example.dto.BookingResponse;
import com.example.dto.CreateBookingRequest;
import com.example.dto.MyBookingResponse;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    List<MyBookingResponse> getMyBookings();

    BookingDetailResponse getBookingDetail(Integer bookingId);
}
