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
public class PaymentResponse {
    private Long id;
    private String transactionId;
    private String orderInfo;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private Payment.PaymentMethod method;
    private String successRedirectUrl;
    private String cancelRedirectUrl;
    private StudentBriefResponse student;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}