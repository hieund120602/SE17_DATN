package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatisticsResponse {
    private BigDecimal totalRevenue;
    private long totalTransactions;
    private BigDecimal averagePaymentAmount;
    private List<MonthlyRevenueData> monthlyRevenue;
    private Map<String, Long> paymentStatusDistribution;
    private Map<String, BigDecimal> courseRevenue;
}

