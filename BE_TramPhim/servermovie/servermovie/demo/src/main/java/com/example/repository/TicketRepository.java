package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    @Query("""
            select distinct t.seat.seat_id
            from Ticket t
            join t.booking b
            where b.showtime.showtime_id = :showtimeId
              and (b.status is null or lower(b.status) <> 'cancelled')
            """)
    List<Integer> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Integer showtimeId);
}
