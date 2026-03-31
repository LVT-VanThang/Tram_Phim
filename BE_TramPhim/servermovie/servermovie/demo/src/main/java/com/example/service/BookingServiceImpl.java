package com.example.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.dto.BookingResponse;
import com.example.dto.CreateBookingRequest;
import com.example.entity.Booking;
import com.example.entity.Seat;
import com.example.entity.Showtime;
import com.example.entity.Ticket;
import com.example.entity.User;
import com.example.repository.BookingRepository;
import com.example.repository.SeatRepository;
import com.example.repository.ShowtimeRepository;
import com.example.repository.TicketRepository;
import com.example.repository.UserRepository;

@Service
public class BookingServiceImpl implements BookingService {

    private static final long PENDING_HOLD_MINUTES = 5L;

    private static final String LOGIN_REQUIRED_MESSAGE = "Bạn cần đăng nhập để đặt vé";
    private static final String SHOWTIME_REQUIRED_MESSAGE = "showtimeId không được để trống";
    private static final String SEAT_LIST_REQUIRED_MESSAGE = "Danh sách ghế không được để trống";
    private static final String DUPLICATE_SEAT_MESSAGE = "Danh sách ghế không được trùng nhau";
    private static final String SEAT_NULL_MESSAGE = "Danh sách ghế không được chứa giá trị null";
    private static final String SHOWTIME_NOT_FOUND_MESSAGE = "Không tìm thấy suất chiếu";
    private static final String SEAT_NOT_FOUND_MESSAGE = "Có ghế không tồn tại";
    private static final String SEAT_NOT_IN_ROOM_MESSAGE = "Có ghế không thuộc phòng của suất chiếu";
    private static final String SEAT_ALREADY_BOOKED_PREFIX = "Ghế ";
    private static final String SEAT_ALREADY_BOOKED_SUFFIX = " đã được đặt";
    private static final String BOOKING_SUCCESS_MESSAGE = "Tạo đơn đặt vé thành công, vui lòng thanh toán để hoàn tất ";

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        User currentUser = getCurrentUser();
        List<Integer> normalizedSeatIds = validateRequest(request);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pendingValidAfter = now.minusMinutes(PENDING_HOLD_MINUTES);

        cancelExpiredPendingBookings(pendingValidAfter);

        Showtime showtime = showtimeRepository.findDetailById(request.getShowtimeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        SHOWTIME_NOT_FOUND_MESSAGE));

        Integer roomId = showtime.getRoom().getRoom_id();
        List<Seat> seats = seatRepository.findAllById(normalizedSeatIds);

        if (seats.size() != normalizedSeatIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, SEAT_NOT_FOUND_MESSAGE);
        }

        boolean hasInvalidRoomSeat = seats.stream()
                .anyMatch(seat -> seat.getRoom() == null || !roomId.equals(seat.getRoom().getRoom_id()));

        if (hasInvalidRoomSeat) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, SEAT_NOT_IN_ROOM_MESSAGE);
        }

        List<Integer> bookedSeatIds = ticketRepository.findActiveBookedSeatIdsByShowtimeIdAndSeatIds(
                showtime.getShowtime_id(),
                normalizedSeatIds,
                pendingValidAfter);

        if (!bookedSeatIds.isEmpty()) {
            List<String> bookedSeatNumbers = seats.stream()
                    .filter(seat -> bookedSeatIds.contains(seat.getSeat_id()))
                    .map(Seat::getSeat_number)
                    .toList();

            String message = SEAT_ALREADY_BOOKED_PREFIX
                    + String.join(", ", bookedSeatNumbers)
                    + SEAT_ALREADY_BOOKED_SUFFIX;

            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }

        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setShowtime(showtime);
        booking.setStatus("Pending");
        booking.setCreated_at(now);
        booking.setTotal_price(showtime.getPrice().multiply(BigDecimal.valueOf(normalizedSeatIds.size())));

        Booking savedBooking = bookingRepository.save(booking);

        List<Ticket> tickets = new ArrayList<>();
        for (Seat seat : seats) {
            Ticket ticket = new Ticket();
            ticket.setBooking(savedBooking);
            ticket.setSeat(seat);
            tickets.add(ticket);
        }
        ticketRepository.saveAll(tickets);

        return new BookingResponse(
                BOOKING_SUCCESS_MESSAGE,
                savedBooking.getBooking_id(),
                showtime.getShowtime_id(),
                normalizedSeatIds,
                savedBooking.getTotal_price(),
                savedBooking.getStatus());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, LOGIN_REQUIRED_MESSAGE);
        }

        return userRepository.findByUsernameAndStatus(authentication.getName(), 1)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, LOGIN_REQUIRED_MESSAGE));
    }

    private List<Integer> validateRequest(CreateBookingRequest request) {
        if (request == null || request.getShowtimeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, SHOWTIME_REQUIRED_MESSAGE);
        }

        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, SEAT_LIST_REQUIRED_MESSAGE);
        }

        if (request.getSeatIds().stream().anyMatch(seatId -> seatId == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, SEAT_NULL_MESSAGE);
        }

        Set<Integer> uniqueSeatIds = new LinkedHashSet<>(request.getSeatIds());
        if (uniqueSeatIds.size() != request.getSeatIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, DUPLICATE_SEAT_MESSAGE);
        }

        return new ArrayList<>(uniqueSeatIds);
    }

    private void cancelExpiredPendingBookings(LocalDateTime expiredBefore) {
        bookingRepository.cancelExpiredPendingBookings(expiredBefore);
    }
}
