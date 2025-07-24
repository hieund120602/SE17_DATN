package com.jplearning.controller;

import com.jplearning.dto.response.EnrollmentResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.EnrollmentService;
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
@RequestMapping("/enrollments")
@Tag(name = "Enrollment", description = "Course enrollment APIs")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping("/my-enrollments")
    @Operation(
            summary = "Get my enrollments",
            description = "Get all enrollments for the current student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments() {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    @GetMapping("/student/{studentId}")
    @Operation(
            summary = "Get student enrollments",
            description = "Get all enrollments for a specific student (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    @PutMapping("/{enrollmentId}/progress")
    @Operation(
            summary = "Update progress",
            description = "Update course progress by marking a lesson as completed",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> updateProgress(
            @PathVariable Long enrollmentId,
            @RequestParam Long lessonId) {
        return ResponseEntity.ok(enrollmentService.updateProgress(enrollmentId, lessonId));
    }

    @GetMapping("/{enrollmentId}/certificate")
    @Operation(
            summary = "Generate certificate",
            description = "Generate or get a certificate for a completed course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getCertificate(@PathVariable Long enrollmentId) {
        return ResponseEntity.ok(enrollmentService.generateCertificate(enrollmentId));
    }

    @GetMapping("/check-combo/{comboId}")
    @Operation(
            summary = "Check combo enrollment",
            description = "Check if current student is enrolled in a combo",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Boolean> checkComboEnrollment(@PathVariable Long comboId) {
        Long studentId = getCurrentUserId();
        boolean isEnrolled = enrollmentService.isStudentEnrolledInCombo(studentId, comboId);
        return ResponseEntity.ok(isEnrolled);
    }

    @GetMapping("/check-course/{courseId}")
    @Operation(
            summary = "Check course enrollment",
            description = "Check if current student is enrolled in a course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Boolean> checkCourseEnrollment(@PathVariable Long courseId) {
        Long studentId = getCurrentUserId();
        boolean isEnrolled = enrollmentService.isStudentEnrolledInCourse(studentId, courseId);
        return ResponseEntity.ok(isEnrolled);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}