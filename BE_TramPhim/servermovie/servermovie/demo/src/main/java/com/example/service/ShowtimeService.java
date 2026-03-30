package com.example.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.dto.ShowtimeMovieResponse;
import com.example.dto.ShowtimeResponse;
import com.example.dto.ShowtimeRoomResponse;
import com.example.dto.ShowtimeSeatResponse;
import com.example.entity.Movie;
import com.example.entity.Room;
import com.example.entity.Seat;
import com.example.entity.Showtime;
import com.example.repository.SeatRepository;
import com.example.repository.ShowtimeRepository;
import com.example.repository.TicketRepository;

@Service
public class ShowtimeService {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TicketRepository ticketRepository;

    //Lấy danh sách tất cả các suất chiếu
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAllWithMovieAndRoom()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    //Lấy suất chiếu bằng id phim
    public List<ShowtimeResponse> getShowtimesByMovieId(Integer movieId) {
        return showtimeRepository.findByMovieId(movieId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    //Lấy suất chiếu bằng id phim và ngày
    public List<ShowtimeResponse> getShowtimesByMovieIdAndDate(Integer movieId, LocalDate showDate) {
        return showtimeRepository.findByMovieIdAndShowDate(movieId, showDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    //Lấy thông tin 1 suất chiếu
    public ShowtimeResponse getShowtimeById(Integer showtimeId) {
        return toResponse(getShowtimeOrThrow(showtimeId));
    }
    //Lấy tất cả ghế bằng mã suất chiếu
    public List<ShowtimeSeatResponse> getSeatsByShowtimeId(Integer showtimeId) {
        Showtime showtime = getShowtimeOrThrow(showtimeId);
        Integer roomId = showtime.getRoom().getRoom_id();

        List<Seat> seats = seatRepository.findAllByRoomId(roomId);
        Set<Integer> bookedSeatIds = Set.copyOf(ticketRepository.findBookedSeatIdsByShowtimeId(showtimeId));

        return seats.stream()
                .map(seat -> new ShowtimeSeatResponse(
                        seat.getSeat_id(),
                        roomId,
                        seat.getSeat_number(),
                        bookedSeatIds.contains(seat.getSeat_id()) ? "BOOKED" : "AVAILABLE"))
                .toList();
    }

    private ShowtimeResponse toResponse(Showtime showtime) {
        Movie movie = showtime.getMovie();
        Room room = showtime.getRoom();

        return new ShowtimeResponse(
                showtime.getShowtime_id(),
                movie.getMovie_id(),
                room.getRoom_id(),
                showtime.getShow_date(),
                showtime.getStart_time(),
                showtime.getEnd_time(),
                showtime.getPrice(),
                new ShowtimeMovieResponse(
                        movie.getMovie_id(),
                        movie.getTitle(),
                        movie.getDuration(),
                        movie.getPoster_url(),
                        movie.getRelease_date()),
                new ShowtimeRoomResponse(
                        room.getRoom_id(),
                        room.getRoom_name(),
                        room.getCapacity()));
    }

    private Showtime getShowtimeOrThrow(Integer showtimeId) {
        return showtimeRepository.findDetailById(showtimeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy suất chiếu voi ID: " + showtimeId));
    }
}
