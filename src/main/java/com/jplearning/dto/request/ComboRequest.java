package com.jplearning.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ComboRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must be less than 5000 characters")
    private String description;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.0", message = "Original price must be greater than or equal to 0")
    private BigDecimal originalPrice;

    @NotNull(message = "Discount price is required")
    @DecimalMin(value = "0.0", message = "Discount price must be greater than or equal to 0")
    private BigDecimal discountPrice;

    @Positive(message = "Discount percentage must be positive")
    private Integer discountPercentage;

    private String thumbnailUrl;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    @NotEmpty(message = "Course IDs are required")
    private List<Long> courseIds;

    // Removed: validUntil and accessPeriodMonths
}