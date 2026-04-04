package com.example.dto.sepay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Payload JSON SePay gửi khi có giao dịch (tiền vào / ra).
 *
 * @see <a href="https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook">SePay Webhooks</a>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SePayWebhookPayload {

    private Long id;
    private String gateway;
    @JsonProperty("transactionDate")
    private String transactionDate;
    @JsonProperty("accountNumber")
    private String accountNumber;
    private String code;
    private String content;
    @JsonProperty("transferType")
    private String transferType;
    @JsonProperty("transferAmount")
    private Integer transferAmount;
    private Long accumulated;
    @JsonProperty("subAccount")
    private String subAccount;
    @JsonProperty("referenceCode")
    private String referenceCode;
    private String description;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGateway() {
        return gateway;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTransferType() {
        return transferType;
    }

    public void setTransferType(String transferType) {
        this.transferType = transferType;
    }

    public Integer getTransferAmount() {
        return transferAmount;
    }

    public void setTransferAmount(Integer transferAmount) {
        this.transferAmount = transferAmount;
    }

    public Long getAccumulated() {
        return accumulated;
    }

    public void setAccumulated(Long accumulated) {
        this.accumulated = accumulated;
    }

    public String getSubAccount() {
        return subAccount;
    }

    public void setSubAccount(String subAccount) {
        this.subAccount = subAccount;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
