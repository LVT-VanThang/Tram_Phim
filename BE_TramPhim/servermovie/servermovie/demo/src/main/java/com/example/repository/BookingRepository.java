package com.example.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("""
            select b
            from Booking b
            join fetch b.user
            join fetch b.showtime s
            join fetch s.movie
            join fetch s.room
            where b.booking_id = :bookingId
            """)
    Optional<Booking> findByIdWithDetails(@Param("bookingId") Integer bookingId);

    @Query("""
            select b
            from Booking b
            join fetch b.showtime s
            join fetch s.movie
            join fetch s.room
            where b.user.user_id = :userId
            order by b.created_at desc
            """)
    List<Booking> findAllByUserIdWithDetails(@Param("userId") Integer userId);
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("""
            update Booking b
            set b.status = 'Cancelled'
            where lower(b.status) = 'pending'
              and b.created_at < :expiredBefore
            """)
    int cancelExpiredPendingBookings(@Param("expiredBefore") LocalDateTime expiredBefore);
}
