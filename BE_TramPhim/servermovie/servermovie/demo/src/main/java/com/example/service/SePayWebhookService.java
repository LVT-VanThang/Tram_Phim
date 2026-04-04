package com.example.service;

import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.config.SepayWebhookProperties;
import com.example.dto.sepay.SePayWebhookPayload;
import com.example.entity.Booking;
import com.example.repository.BookingRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class SePayWebhookService {

    private static final Logger log = LoggerFactory.getLogger(SePayWebhookService.class);
    private static final Pattern TRAM_PHIM_BOOKING = Pattern.compile("(?i)TramPhim\\s+(\\d+)");

    private final BookingRepository bookingRepository;
    private final SepayWebhookProperties sepayWebhookProperties;

    public SePayWebhookService(
            BookingRepository bookingRepository,
            SepayWebhookProperties sepayWebhookProperties) {
        this.bookingRepository = bookingRepository;
        this.sepayWebhookProperties = sepayWebhookProperties;
    }

    public boolean verifyApiKey(HttpServletRequest request) {
        String configured = sepayWebhookProperties.getApiKey();
        if (!StringUtils.hasText(configured)) {
            return true;
        }
        String header = request.getHeader("Authorization");
        String expected = "Apikey " + configured.trim();
        return expected.equals(header);
    }

    /**
     * Xử lý giao dịch tiền vào: khớp nội dung {@code TramPhim &lt;bookingId&gt;} và số tiền với đơn Pending.
     * Trả về true nếu đã ack (xử lý xong hoặc bỏ qua an toàn — tránh SePay retry vô hạn).
     */
    @Transactional
    public boolean handleIncomingPayment(SePayWebhookPayload payload) {
        if (payload == null) {
            log.warn("SePay webhook: payload null");
            return true;
        }

        if (!"in".equalsIgnoreCase(StringUtils.trimWhitespace(payload.getTransferType()))) {
            log.debug("SePay webhook: bỏ qua transferType={}", payload.getTransferType());
            return true;
        }

        if (sepayWebhookProperties.isVerifyAccountNumber()
                && StringUtils.hasText(sepayWebhookProperties.getExpectedAccountNumber())) {
            String expected = normalizeDigits(sepayWebhookProperties.getExpectedAccountNumber());
            String actual = normalizeDigits(payload.getAccountNumber());
            if (StringUtils.hasText(expected) && !expected.equals(actual)) {
                log.warn("SePay webhook: accountNumber không khớp (expected={}, actual={})", expected, actual);
                return true;
            }
        }

        if (payload.getId() != null && bookingRepository.findBySepayTransactionId(payload.getId()).isPresent()) {
            log.debug("SePay webhook: giao dịch id={} đã xử lý (idempotent)", payload.getId());
            return true;
        }

        Integer amount = payload.getTransferAmount();
        if (amount == null || amount <= 0) {
            log.warn("SePay webhook: transferAmount không hợp lệ");
            return true;
        }

        Integer bookingId = resolveBookingId(payload);
        if (bookingId == null) {
            log.warn("SePay webhook: không tìm thấy mã đơn trong content/code, id Sepay={}", payload.getId());
            return true;
        }

        Optional<Booking> opt = bookingRepository.findById(bookingId);
        if (opt.isEmpty()) {
            log.warn("SePay webhook: booking_id={} không tồn tại", bookingId);
            return true;
        }

        Booking booking = opt.get();
        String status = booking.getStatus() != null ? booking.getStatus().trim() : "";
        if (!"Pending".equalsIgnoreCase(status)) {
            log.info("SePay webhook: booking {} trạng thái {}, bỏ qua", bookingId, status);
            return true;
        }

        long expectedVnd = booking.getTotal_price().setScale(0, RoundingMode.HALF_UP).longValue();
        if (amount.longValue() != expectedVnd) {
            log.warn(
                    "SePay webhook: booking {} số tiền không khớp (ck={}, don={}), không đổi trạng thái",
                    bookingId,
                    amount,
                    expectedVnd);
            return true;
        }

        booking.setStatus("Paid");
        booking.setPaidAt(LocalDateTime.now());
        if (payload.getId() != null) {
            booking.setSepayTransactionId(payload.getId());
        }
        bookingRepository.save(booking);
        log.info("SePay webhook: booking {} đã chuyển sang Paid (sepay id={})", bookingId, payload.getId());
        return true;
    }

    private Integer resolveBookingId(SePayWebhookPayload payload) {
        if (StringUtils.hasText(payload.getCode())) {
            String code = payload.getCode().trim();
            if (code.matches("\\d+")) {
                return Integer.valueOf(code);
            }
        }
        String text = payload.getContent();
        if (!StringUtils.hasText(text)) {
            text = payload.getDescription();
        }
        if (!StringUtils.hasText(text)) {
            return null;
        }
        Matcher m = TRAM_PHIM_BOOKING.matcher(text);
        if (m.find()) {
            return Integer.valueOf(m.group(1));
        }
        return null;
    }

    private static String normalizeDigits(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.replaceAll("\\D", "");
    }
}
