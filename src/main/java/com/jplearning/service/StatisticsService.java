package com.jplearning.service;

import com.jplearning.dto.response.DashboardStatisticsResponse;
import com.jplearning.dto.response.PaymentHistoryResponse;
import com.jplearning.dto.response.PaymentStatisticsResponse;

import java.time.LocalDate;
import java.util.List;

public interface StatisticsService {

    /**
     * Get payment statistics for the given date range
     *
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return payment statistics
     */
    PaymentStatisticsResponse getPaymentStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * Get payment history for a specific student
     *
     * @param studentId student ID
     * @return list of payment history
     */
    List<PaymentHistoryResponse> getStudentPaymentHistory(Long studentId);

    /**
     * Get all payment history (admin only)
     *
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return list of payment history
     */
    List<PaymentHistoryResponse> getAllPaymentHistory(LocalDate startDate, LocalDate endDate);

    /**
     * Get payment history for a specific course
     *
     * @param courseId course ID
     * @return list of payment history
     */
    List<PaymentHistoryResponse> getCoursePaymentHistory(Long courseId);

    /**
     * Get payment history for a specific tutor's courses
     *
     * @param tutorId tutor ID
     * @return list of payment history
     */
    List<PaymentHistoryResponse> getTutorPaymentHistory(Long tutorId);

    /**
     * Get dashboard statistics for admin
     *
     * @return dashboard statistics
     */
    DashboardStatisticsResponse getDashboardStatistics();
}