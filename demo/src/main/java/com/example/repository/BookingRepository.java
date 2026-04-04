package com.example.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

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
