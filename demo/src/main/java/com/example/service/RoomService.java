package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Room;
import com.example.repository.RoomRepository;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    //Lấy danh sách tất cả các phòng
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
}
