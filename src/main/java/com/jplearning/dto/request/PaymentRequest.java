package com.jplearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String orderInfo;

    private Long studentId;

    private Long courseId;

    private Long comboId;

    private String voucherCode;

    private String successRedirectUrl;

    private String cancelRedirectUrl;
}