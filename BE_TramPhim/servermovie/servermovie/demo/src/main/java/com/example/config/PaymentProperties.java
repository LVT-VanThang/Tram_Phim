package com.example.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    private String bankName = "MB Bank";
    /** Mã ngân hàng theo VietQR (img.vietqr.io), ví dụ MBBank */
    private String vietQrBankId = "MBBank";
    private String accountNumber = "0372036292";
    private String accountHolder = "";
    private String qrTemplate = "compact2";

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getVietQrBankId() {
        return vietQrBankId;
    }

    public void setVietQrBankId(String vietQrBankId) {
        this.vietQrBankId = vietQrBankId;
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

    public String getQrTemplate() {
        return qrTemplate;
    }

    public void setQrTemplate(String qrTemplate) {
        this.qrTemplate = qrTemplate;
    }
}
