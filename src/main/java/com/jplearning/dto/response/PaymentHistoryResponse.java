package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponse {
    private Long id;
    private String transactionId;
    private String orderInfo;
    private BigDecimal amount;
    private String status;
    private String paymentMethod;
    private String courseName;
    private Long courseId;
    private String comboName;
    private Long comboId;
    private LocalDate paymentDate;
    private String studentName;
    private Long studentId;
}
