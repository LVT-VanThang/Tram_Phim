package com.example.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.dto.BookingDetailResponse;
import com.example.dto.BookingResponse;
import com.example.dto.CreateBookingRequest;
import com.example.dto.MyBookingResponse;
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
    private static final String MY_BOOKINGS_LOGIN_REQUIRED_MESSAGE = "Bạn cần đăng nhập để xem lịch sử đặt vé";
    private static final String BOOKING_DETAIL_LOGIN_REQUIRED_MESSAGE = "Bạn cần đăng nhập để xem chi tiết đặt vé";
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
    private static final String SHOWTIME_BOOKING_EXPIRED_MESSAGE = "Suất chiếu này đã hết thời gian đặt vé";
    private static final String BOOKING_NOT_FOUND_MESSAGE = "Không tìm thấy booking";
    private static final String BOOKING_FORBIDDEN_MESSAGE = "Bạn không có quyền xem booking này";

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
        User currentUser = getCurrentUser(LOGIN_REQUIRED_MESSAGE);
        List<Integer> normalizedSeatIds = validateRequest(request);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pendingValidAfter = now.minusMinutes(PENDING_HOLD_MINUTES);

        cancelExpiredPendingBookings(pendingValidAfter);

        Showtime showtime = showtimeRepository.findDetailById(request.getShowtimeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        SHOWTIME_NOT_FOUND_MESSAGE));

        validateShowtimeBookingTime(showtime, now);

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

    @Override
    @Transactional(readOnly = true)
    public List<MyBookingResponse> getMyBookings() {
        User currentUser = getCurrentUser(MY_BOOKINGS_LOGIN_REQUIRED_MESSAGE);
        List<Booking> bookings = bookingRepository.findAllByUserIdWithDetails(currentUser.getUser_id());

        if (bookings.isEmpty()) {
            return List.of();
        }

        List<Integer> bookingIds = bookings.stream()
                .map(Booking::getBooking_id)
                .toList();

        List<Ticket> tickets = ticketRepository.findAllByBookingIdsWithSeat(bookingIds);
        Map<Integer, List<Ticket>> ticketsByBookingId = groupTicketsByBookingId(tickets);

        List<MyBookingResponse> responses = new ArrayList<>();
        for (Booking booking : bookings) {
            List<Ticket> bookingTickets = ticketsByBookingId.getOrDefault(
                    booking.getBooking_id(),
                    Collections.emptyList());

            responses.add(toMyBookingResponse(booking, bookingTickets));
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetail(Integer bookingId) {
        User currentUser = getCurrentUser(BOOKING_DETAIL_LOGIN_REQUIRED_MESSAGE);

        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        BOOKING_NOT_FOUND_MESSAGE));

        if (!booking.getUser().getUser_id().equals(currentUser.getUser_id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, BOOKING_FORBIDDEN_MESSAGE);
        }

        List<Ticket> tickets = ticketRepository.findAllByBookingIdsWithSeat(List.of(bookingId));
        return toBookingDetailResponse(booking, tickets);
    }

    private User getCurrentUser(String loginRequiredMessage) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, loginRequiredMessage);
        }

        return userRepository.findByUsernameAndStatus(authentication.getName(), 1)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, loginRequiredMessage));
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

    private void validateShowtimeBookingTime(Showtime showtime, LocalDateTime now) {
        LocalDate currentDate = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();
        LocalDate showDate = showtime.getShow_date();
        LocalTime startTime = showtime.getStart_time();

        boolean isBookingExpired = currentDate.isAfter(showDate)
                || (currentDate.isEqual(showDate) && !currentTime.isBefore(startTime));

        if (isBookingExpired) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, SHOWTIME_BOOKING_EXPIRED_MESSAGE);
        }
    }

    private void cancelExpiredPendingBookings(LocalDateTime expiredBefore) {
        bookingRepository.cancelExpiredPendingBookings(expiredBefore);
    }

    private Map<Integer, List<Ticket>> groupTicketsByBookingId(List<Ticket> tickets) {
        Map<Integer, List<Ticket>> ticketsByBookingId = new LinkedHashMap<>();

        for (Ticket ticket : tickets) {
            Integer bookingId = ticket.getBooking().getBooking_id();
            ticketsByBookingId.computeIfAbsent(bookingId, key -> new ArrayList<>()).add(ticket);
        }

        return ticketsByBookingId;
    }

    private MyBookingResponse toMyBookingResponse(Booking booking, List<Ticket> tickets) {
        List<Integer> seatIds = tickets.stream()
                .map(ticket -> ticket.getSeat().getSeat_id())
                .toList();

        List<String> seatNumbers = tickets.stream()
                .map(ticket -> ticket.getSeat().getSeat_number())
                .toList();

        Showtime showtime = booking.getShowtime();

        return new MyBookingResponse(
                booking.getBooking_id(),
                showtime.getShowtime_id(),
                showtime.getMovie().getMovie_id(),
                showtime.getMovie().getTitle(),
                showtime.getShow_date(),
                showtime.getStart_time(),
                showtime.getEnd_time(),
                showtime.getRoom().getRoom_id(),
                showtime.getRoom().getRoom_name(),
                seatIds,
                seatNumbers,
                booking.getTotal_price(),
                booking.getStatus(),
                booking.getCreated_at());
    }

    private BookingDetailResponse toBookingDetailResponse(Booking booking, List<Ticket> tickets) {
        List<Integer> seatIds = tickets.stream()
                .map(ticket -> ticket.getSeat().getSeat_id())
                .toList();

        List<String> seatNumbers = tickets.stream()
                .map(ticket -> ticket.getSeat().getSeat_number())
                .toList();

        Showtime showtime = booking.getShowtime();

        return new BookingDetailResponse(
                booking.getBooking_id(),
                booking.getUser().getUser_id(),
                showtime.getShowtime_id(),
                showtime.getMovie().getMovie_id(),
                showtime.getMovie().getTitle(),
                showtime.getShow_date(),
                showtime.getStart_time(),
                showtime.getEnd_time(),
                showtime.getRoom().getRoom_id(),
                showtime.getRoom().getRoom_name(),
                seatIds,
                seatNumbers,
                booking.getTotal_price(),
                booking.getStatus(),
                booking.getCreated_at());
    }
}
