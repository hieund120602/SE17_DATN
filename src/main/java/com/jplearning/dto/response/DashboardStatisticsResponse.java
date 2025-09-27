package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatisticsResponse {
    private long totalStudents;
    private long totalTutors;
    private long totalCourses;
    private long pendingTutorApprovals;
    private long pendingCourseApprovals;
    private BigDecimal totalRevenue;
    private long totalEnrollments;
    private List<MonthlyRevenueData> recentRevenue;
    private Map<String, Long> enrollmentsByLevel;
}
