package com.jplearning.controller;

import com.jplearning.dto.response.PaymentHistoryResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment-history")
@Tag(name = "Payment History", description = "APIs for payment history")
@CrossOrigin(origins = "*")
public class PaymentHistoryController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/my-history")
    @Operation(
            summary = "Get my payment history",
            description = "Get payment history for the current authenticated student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PaymentHistoryResponse>> getMyPaymentHistory() {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(statisticsService.getStudentPaymentHistory(studentId));
    }

    @GetMapping("/student/{studentId}")
    @Operation(
            summary = "Get student payment history",
            description = "Get payment history for a specific student (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentHistoryResponse>> getStudentPaymentHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(statisticsService.getStudentPaymentHistory(studentId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}