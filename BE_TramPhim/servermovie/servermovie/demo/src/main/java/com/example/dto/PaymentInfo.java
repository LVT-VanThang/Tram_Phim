package com.example.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentInfo {

    /** Tên hiển thị ngân hàng */
    private String bankName;
    private String accountNumber;
    /** Chủ TK (nếu cấu hình — hiển thị trên một số app ngân hàng) */
    private String accountHolder;
    /** Giá 1 vé theo suất chiếu */
    private BigDecimal ticketUnitPrice;
    /** Số ghế / số vé */
    private int quantity;
    /** Tổng tiền = đơn giá × số lượng */
    private BigDecimal amount;
    /** Tổng tiền làm số nguyên VND (dùng cho QR) */
    private long amountVnd;
    /** Nội dung chuyển khoản gợi ý */
    private String transferContent;
    /** Ảnh QR (VietQR) — FE có thể dùng trực tiếp làm src ảnh */
    private String qrImageUrl;
    private String paymentDescription;

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountHolder() {
        return accountHolder;
    }

    public void setAccountHolder(String accountHolder) {
        this.accountHolder = accountHolder;
    }

    public BigDecimal getTicketUnitPrice() {
        return ticketUnitPrice;
    }

    public void setTicketUnitPrice(BigDecimal ticketUnitPrice) {
        this.ticketUnitPrice = ticketUnitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public long getAmountVnd() {
        return amountVnd;
    }

    public void setAmountVnd(long amountVnd) {
        this.amountVnd = amountVnd;
    }

    public String getTransferContent() {
        return transferContent;
    }

    public void setTransferContent(String transferContent) {
        this.transferContent = transferContent;
    }

    public String getQrImageUrl() {
        return qrImageUrl;
    }

    public void setQrImageUrl(String qrImageUrl) {
        this.qrImageUrl = qrImageUrl;
    }

    public String getPaymentDescription() {
        return paymentDescription;
    }

    public void setPaymentDescription(String paymentDescription) {
        this.paymentDescription = paymentDescription;
    }
}
