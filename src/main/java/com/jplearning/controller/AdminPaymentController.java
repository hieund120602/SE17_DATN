package com.jplearning.controller;

import com.jplearning.dto.request.AdminProcessPaymentRequest;
import com.jplearning.dto.response.PaymentResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.entity.Course;
import com.jplearning.entity.Payment;
import com.jplearning.repository.CourseRepository;
import com.jplearning.repository.PaymentRepository;
import com.jplearning.service.EnrollmentService;

@RestController
@RequestMapping("/admin/payments")
@Tag(name = "Admin Payment", description = "Admin Payment Management APIs")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping("/waiting-confirmation")
    @Operation(
            summary = "Get payments waiting for confirmation",
            description = "Get all QR transfer payments waiting for admin confirmation",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Page<PaymentResponse>> getPaymentsWaitingConfirmation(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(paymentService.getPaymentsWaitingConfirmation(pageable));
    }

    @PostMapping("/process")
    @Operation(
            summary = "Process payment by admin",
            description = "Approve or reject a QR transfer payment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody AdminProcessPaymentRequest request) {
        Long adminId = getCurrentUserId();
        return ResponseEntity.ok(paymentService.processPaymentByAdmin(request, adminId));
    }

    @GetMapping("/{paymentId}")
    @Operation(
            summary = "Get payment details",
            description = "Get detailed information about a specific payment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    @GetMapping("/pending")
    @Operation(
            summary = "Get pending payments",
            description = "Get all pending payments (VNPay, etc.)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Page<PaymentResponse>> getPendingPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(paymentService.getPendingPayments(pageable));
    }

    @PostMapping("/test-enrollment/{paymentId}")
    @Operation(
            summary = "Test enrollment for payment",
            description = "Test enrollment creation for a specific payment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testEnrollment(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
            
            // Test enrollment process
            String orderInfo = payment.getOrderInfo();
            System.out.println("Testing enrollment for payment: " + paymentId);
            System.out.println("Order info: " + orderInfo);
            
            if (orderInfo.contains("Payment for course:")) {
                String courseTitle = orderInfo.replace("Payment for course: ", "").trim();
                System.out.println("Course title: " + courseTitle);
                
                // Find course
                Course course = courseRepository.findByTitleContainingIgnoreCase(courseTitle, org.springframework.data.domain.PageRequest.of(0, 1))
                    .getContent()
                    .stream()
                    .findFirst()
                    .orElse(null);
                
                if (course != null) {
                    System.out.println("Found course: " + course.getTitle() + " (ID: " + course.getId() + ")");
                    enrollmentService.enrollStudentInCourse(payment.getStudent().getId(), course.getId(), payment);
                    return ResponseEntity.ok("Enrollment created successfully for course: " + course.getTitle());
                } else {
                    return ResponseEntity.badRequest().body("Course not found: " + courseTitle);
                }
            } else {
                return ResponseEntity.badRequest().body("Not a course payment");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
} 