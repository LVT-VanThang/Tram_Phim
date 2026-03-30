package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Integer> {

    @Query("""
            select s
            from Seat s
            where s.room.room_id = :roomId
            order by s.seat_number asc, s.seat_id asc
            """)
    List<Seat> findAllByRoomId(@Param("roomId") Integer roomId);
}
