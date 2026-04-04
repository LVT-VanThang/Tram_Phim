package com.example.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
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

import com.example.dto.BookingHistoryItem;
import com.example.dto.BookingResponse;
import com.example.dto.BookingStatusResponse;
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
    private static final String SHOWTIME_BOOKING_EXPIRED_MESSAGE = "Suất chiếu này đã hết thời gian đặt vé";

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

    @Autowired
    private VietQrPaymentService vietQrPaymentService;

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

        int quantity = normalizedSeatIds.size();
        var payment = vietQrPaymentService.buildPaymentInfo(
                showtime.getPrice(),
                quantity,
                savedBooking.getTotal_price(),
                savedBooking.getBooking_id());

        return new BookingResponse(
                BOOKING_SUCCESS_MESSAGE,
                savedBooking.getBooking_id(),
                showtime.getShowtime_id(),
                normalizedSeatIds,
                savedBooking.getTotal_price(),
                savedBooking.getStatus(),
                payment);
    }

    @Override
    public BookingStatusResponse getBookingStatusForCurrentUser(Integer bookingId) {
        if (bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bookingId không hợp lệ");
        }
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn"));

        if (booking.getUser() == null
                || !currentUser.getUser_id().equals(booking.getUser().getUser_id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem đơn này");
        }

        BookingStatusResponse out = new BookingStatusResponse();
        out.setBookingId(booking.getBooking_id());
        out.setStatus(booking.getStatus());
        if (booking.getPaidAt() != null) {
            out.setPaidAt(booking.getPaidAt().toString());
        }
        return out;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingHistoryItem> listMyBookings() {
        User currentUser = getCurrentUser();
        List<Booking> bookings = bookingRepository.findHistoryForUserWithDetails(currentUser.getUser_id());
        if (bookings.isEmpty()) {
            return List.of();
        }
        List<Integer> bookingIds = bookings.stream().map(Booking::getBooking_id).toList();
        List<Ticket> tickets = bookingIds.isEmpty()
                ? List.of()
                : ticketRepository.findWithSeatsByBookingIds(bookingIds);

        Map<Integer, List<String>> seatsByBooking = new HashMap<>();
        for (Ticket t : tickets) {
            Integer bid = t.getBooking().getBooking_id();
            String label = "?";
            if (t.getSeat() != null && t.getSeat().getSeat_number() != null) {
                label = t.getSeat().getSeat_number().trim();
            }
            seatsByBooking.computeIfAbsent(bid, k -> new ArrayList<>()).add(label);
        }

        List<BookingHistoryItem> out = new ArrayList<>();
        for (Booking b : bookings) {
            Showtime st = b.getShowtime();
            BookingHistoryItem item = new BookingHistoryItem();
            item.setBookingId(b.getBooking_id());
            item.setStatus(b.getStatus());
            item.setTotalPrice(b.getTotal_price());
            if (b.getCreated_at() != null) {
                item.setCreatedAt(b.getCreated_at().toString());
            }
            if (b.getPaidAt() != null) {
                item.setPaidAt(b.getPaidAt().toString());
            }
            item.setShowtimeId(st.getShowtime_id());
            item.setMovieId(st.getMovie().getMovie_id());
            item.setMovieTitle(st.getMovie().getTitle());
            item.setShowDate(st.getShow_date().toString());
            item.setStartTime(st.getStart_time().toString());
            item.setRoomName(st.getRoom().getRoom_name());
            List<String> labels = new ArrayList<>(seatsByBooking.getOrDefault(b.getBooking_id(), List.of()));
            Collections.sort(labels, String.CASE_INSENSITIVE_ORDER);
            item.setSeatLabels(labels);
            out.add(item);
        }
        return out;
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
}
