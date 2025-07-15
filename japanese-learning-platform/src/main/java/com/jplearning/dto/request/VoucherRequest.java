package com.jplearning.dto.request;

import com.jplearning.entity.Voucher;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VoucherRequest {
    @NotBlank(message = "Code is required")
    @Pattern(regexp = "^[A-Z0-9_]{3,20}$", message = "Code must be 3-20 uppercase letters, numbers, or underscores")
    private String code;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Discount type is required")
    private Voucher.DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0", message = "Minimum purchase amount must be greater than or equal to 0")
    private BigDecimal minimumPurchaseAmount;

    private BigDecimal maximumDiscountAmount;

    @NotNull(message = "Valid from date is required")
    @FutureOrPresent(message = "Valid from date must be in the present or future")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    @Future(message = "Valid until date must be in the future")
    private LocalDateTime validUntil;

    private Integer totalUsageLimit;

    private Integer perUserLimit;

    // Không bắt buộc nhập danh sách khóa học
    private List<Long> applicableCourseIds;

    // Không bắt buộc nhập danh sách combo
    private List<Long> applicableComboIds;
}