package com.jplearning.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QRTransferPaymentRequest {
    @NotNull
    @Min(1000)
    private BigDecimal amount;

    @NotBlank
    private String orderInfo;

    private String successRedirectUrl;
    private String cancelRedirectUrl;
    private String bankAccountInfo;
}


