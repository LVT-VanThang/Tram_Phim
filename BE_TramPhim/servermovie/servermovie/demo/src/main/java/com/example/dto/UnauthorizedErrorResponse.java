package com.example.dto;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public record UnauthorizedErrorResponse(
        String timestamp,
        int status,
        String error,
        String path,
        String message
) {
    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    public static UnauthorizedErrorResponse of(String path, String message) {
        String ts = OffsetDateTime.now(ZoneOffset.UTC).format(TS);
        return new UnauthorizedErrorResponse(ts, 401, "Unauthorized", path, message);
    }
}
