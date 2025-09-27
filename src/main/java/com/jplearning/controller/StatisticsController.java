package com.jplearning.controller;

import com.jplearning.dto.response.DashboardStatisticsResponse;
import com.jplearning.dto.response.PaymentHistoryResponse;
import com.jplearning.dto.response.PaymentStatisticsResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/statistics")
@Tag(name = "Statistics", description = "Statistics API")
@CrossOrigin(origins = "*")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @Operation(
            summary = "Get dashboard statistics",
            description = "Get statistics for admin dashboard",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatisticsResponse> getDashboardStatistics() {
        return ResponseEntity.ok(statisticsService.getDashboardStatistics());
    }

    @GetMapping("/payments")
    @Operation(
            summary = "Get payment statistics",
            description = "Get payment statistics for a date range",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentStatisticsResponse> getPaymentStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getPaymentStatistics(startDate, endDate));
    }

    @GetMapping("/payments/history")
    @Operation(
            summary = "Get all payment history",
            description = "Get all payment history for a date range (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentHistoryResponse>> getAllPaymentHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getAllPaymentHistory(startDate, endDate));
    }

    @GetMapping("/payments/history/course/{courseId}")
    @Operation(
            summary = "Get course payment history",
            description = "Get payment history for a specific course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
    public ResponseEntity<List<PaymentHistoryResponse>> getCoursePaymentHistory(@PathVariable Long courseId) {
        return ResponseEntity.ok(statisticsService.getCoursePaymentHistory(courseId));
    }

    @GetMapping("/payments/history/tutor")
    @Operation(
            summary = "Get tutor payment history",
            description = "Get payment history for the current tutor's courses",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<PaymentHistoryResponse>> getTutorPaymentHistory() {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(statisticsService.getTutorPaymentHistory(tutorId));
    }

    @GetMapping("/payments/history/tutor/{tutorId}")
    @Operation(
            summary = "Get tutor payment history by ID",
            description = "Get payment history for a specific tutor's courses (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentHistoryResponse>> getTutorPaymentHistoryById(@PathVariable Long tutorId) {
        return ResponseEntity.ok(statisticsService.getTutorPaymentHistory(tutorId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}