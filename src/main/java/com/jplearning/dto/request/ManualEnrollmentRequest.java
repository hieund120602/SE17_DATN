package com.jplearning.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ManualEnrollmentRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Price paid is required")
    @DecimalMin(value = "0.0", message = "Price paid must be greater than or equal to 0")
    private BigDecimal pricePaid;

    private Long comboId;

    private String voucherCode;

    private LocalDateTime expiryDate;

    private String notes;
}