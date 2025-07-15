package com.jplearning.dto.response;

import com.jplearning.entity.Voucher;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    private Long id;
    private String code;
    private String description;
    private Voucher.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumPurchaseAmount;
    private BigDecimal maximumDiscountAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer totalUsageLimit;
    private Integer perUserLimit;
    private Integer usageCount;
    private boolean isActive;
    private List<CourseBriefResponse> applicableCourses;
    private List<ComboBriefResponse> applicableCombos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}