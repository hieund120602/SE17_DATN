package com.jplearning.dto.response;

import com.jplearning.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRTransferResponse {
    private Long paymentId;
    private String transactionId;
    private BigDecimal amount;
    private String orderInfo;
    private String qrCodeUrl;
    private String bankAccountInfo;
    private Payment.PaymentStatus status;
    private LocalDateTime createdAt;
    private String message;
}


