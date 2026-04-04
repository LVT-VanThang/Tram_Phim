package com.example.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    @EntityGraph(attributePaths = { "seat" })
    @Query("select t from Ticket t where t.booking.booking_id in :bookingIds")
    List<Ticket> findWithSeatsByBookingIds(@Param("bookingIds") Collection<Integer> bookingIds);

    @Query("""
            select distinct t.seat.seat_id
            from Ticket t
            join t.booking b
            where b.showtime.showtime_id = :showtimeId
              and (
                    lower(b.status) = 'completed'
                    or (
                        lower(b.status) = 'pending'
                        and b.created_at >= :pendingValidAfter
                    )
                  )
            """)
    List<Integer> findActiveBookedSeatIdsByShowtimeId(@Param("showtimeId") Integer showtimeId,
                                                      @Param("pendingValidAfter") LocalDateTime pendingValidAfter);

    @Query("""
            select distinct t.seat.seat_id
            from Ticket t
            join t.booking b
            where b.showtime.showtime_id = :showtimeId
              and t.seat.seat_id in :seatIds
              and (
                    lower(b.status) = 'completed'
                    or (
                        lower(b.status) = 'pending'
                        and b.created_at >= :pendingValidAfter
                    )
                  )
            """)
    List<Integer> findActiveBookedSeatIdsByShowtimeIdAndSeatIds(@Param("showtimeId") Integer showtimeId,
                                                                @Param("seatIds") List<Integer> seatIds,
                                                                @Param("pendingValidAfter") LocalDateTime pendingValidAfter);
}
