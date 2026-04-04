package com.example.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.config.PaymentProperties;
import com.example.dto.PaymentInfo;

@Service
public class VietQrPaymentService {

    private final PaymentProperties paymentProperties;

    public VietQrPaymentService(PaymentProperties paymentProperties) {
        this.paymentProperties = paymentProperties;
    }

    /**
     * Thông tin CK + link ảnh QR VietQR (quét bằng app ngân hàng / VNPay).
     * Số tiền QR = tổng vé (đơn giá suất × số ghế).
     */
    public PaymentInfo buildPaymentInfo(BigDecimal unitPrice, int quantity, BigDecimal totalAmount, int bookingId) {
        long amountVnd = totalAmount.setScale(0, RoundingMode.HALF_UP).longValue();
        String transferContent = "TramPhim " + bookingId;
        String qrUrl = buildQrImageUrl(amountVnd, transferContent);

        PaymentInfo info = new PaymentInfo();
        info.setBankName(paymentProperties.getBankName());
        info.setAccountNumber(paymentProperties.getAccountNumber());
        if (paymentProperties.getAccountHolder() != null && !paymentProperties.getAccountHolder().isBlank()) {
            info.setAccountHolder(paymentProperties.getAccountHolder().trim());
        }
        info.setTicketUnitPrice(unitPrice);
        info.setQuantity(quantity);
        info.setAmount(totalAmount);
        info.setAmountVnd(amountVnd);
        info.setTransferContent(transferContent);
        info.setQrImageUrl(qrUrl);
        info.setPaymentDescription("Quét mã VietQR bằng app ngân hàng hoặc VNPay để chuyển khoản");
        return info;
    }

    private String buildQrImageUrl(long amountVnd, String addInfo) {
        String imagePath = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png",
                paymentProperties.getVietQrBankId(),
                paymentProperties.getAccountNumber(),
                paymentProperties.getQrTemplate());
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(imagePath)
                .queryParam("amount", amountVnd)
                .queryParam("addInfo", addInfo);
        String holder = paymentProperties.getAccountHolder();
        if (holder != null && !holder.isBlank()) {
            builder.queryParam("accountName", holder.trim());
        }
        return builder.build().encode().toUriString();
    }
}
