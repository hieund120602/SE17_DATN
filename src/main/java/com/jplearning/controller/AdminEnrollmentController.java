package com.jplearning.controller;

import com.jplearning.dto.request.ManualEnrollmentRequest;
import com.jplearning.dto.response.EnrollmentResponse;
import com.jplearning.entity.Enrollment;
import com.jplearning.service.AdminEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/enrollments")
@Tag(name = "Admin Enrollment Management", description = "APIs for admin to manage enrollments")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEnrollmentController {

    @Autowired
    private AdminEnrollmentService adminEnrollmentService;

    @GetMapping
    @Operation(
            summary = "Get all enrollments",
            description = "Get all enrollments with pagination",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Page<EnrollmentResponse>> getAllEnrollments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(adminEnrollmentService.getAllEnrollments(pageable));
    }

    @GetMapping("/student/{studentId}")
    @Operation(
            summary = "Get student enrollments",
            description = "Get enrollments for a specific student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<List<EnrollmentResponse>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(adminEnrollmentService.getStudentEnrollments(studentId));
    }

    @GetMapping("/course/{courseId}")
    @Operation(
            summary = "Get course enrollments",
            description = "Get enrollments for a specific course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Page<EnrollmentResponse>> getCourseEnrollments(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminEnrollmentService.getCourseEnrollments(courseId, pageable));
    }

    @PostMapping("/manual")
    @Operation(
            summary = "Create manual enrollment",
            description = "Create enrollment manually without payment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<EnrollmentResponse> createManualEnrollment(
            @Valid @RequestBody ManualEnrollmentRequest request) {
        return ResponseEntity.ok(adminEnrollmentService.createManualEnrollment(request));
    }

    @PutMapping("/{enrollmentId}/status")
    @Operation(
            summary = "Update enrollment status",
            description = "Update enrollment status (completed, expired, etc.)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<EnrollmentResponse> updateEnrollmentStatus(
            @PathVariable Long enrollmentId,
            @RequestParam boolean completed) {
        return ResponseEntity.ok(adminEnrollmentService.updateEnrollmentStatus(enrollmentId, completed));
    }
}