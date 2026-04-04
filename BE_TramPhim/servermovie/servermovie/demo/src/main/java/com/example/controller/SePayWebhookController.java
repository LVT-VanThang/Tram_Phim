package com.example.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.sepay.SePayWebhookPayload;
import com.example.service.SePayWebhookService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Nhận Webhook từ SePay khi có tiền vào STK đã liên kết.
 * Cấu hình URL trên SePay: {@code https://<host>/api/webhooks/sepay}, Content-Type: application/json.
 */
@RestController
@RequestMapping("/api/webhooks")
public class SePayWebhookController {

    private static final Logger log = LoggerFactory.getLogger(SePayWebhookController.class);

    private final SePayWebhookService sePayWebhookService;

    public SePayWebhookController(SePayWebhookService sePayWebhookService) {
        this.sePayWebhookService = sePayWebhookService;
    }

    @PostMapping(value = "/sepay", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Boolean>> receiveSePay(
            @RequestBody SePayWebhookPayload payload,
            HttpServletRequest request) {
        if (!sePayWebhookService.verifyApiKey(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false));
        }
        try {
            sePayWebhookService.handleIncomingPayment(payload);
        } catch (Exception e) {
            log.error("SePay webhook xử lý lỗi", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true));
    }
}
