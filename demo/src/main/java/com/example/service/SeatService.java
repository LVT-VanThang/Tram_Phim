package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Seat;
import com.example.repository.SeatRepository;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    //Lấy danh sách tất cả các ghế
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }
}
