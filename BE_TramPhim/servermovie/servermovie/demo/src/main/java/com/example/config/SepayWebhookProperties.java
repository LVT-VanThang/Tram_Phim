package com.example.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.sepay.webhook")
public class SepayWebhookProperties {

    /**
     * Nếu có giá trị, bắt buộc header {@code Authorization: Apikey <giá trị>} khớp (theo cấu hình SePay).
     */
    private String apiKey = "";

    /**
     * STK nhận tiền (cùng số đã cấu hình trên SePay). Bật {@link #verifyAccountNumber} để so khớp với field accountNumber trong payload.
     */
    private String expectedAccountNumber = "";

    private boolean verifyAccountNumber = false;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getExpectedAccountNumber() {
        return expectedAccountNumber;
    }

    public void setExpectedAccountNumber(String expectedAccountNumber) {
        this.expectedAccountNumber = expectedAccountNumber;
    }

    public boolean isVerifyAccountNumber() {
        return verifyAccountNumber;
    }

    public void setVerifyAccountNumber(boolean verifyAccountNumber) {
        this.verifyAccountNumber = verifyAccountNumber;
    }
}
