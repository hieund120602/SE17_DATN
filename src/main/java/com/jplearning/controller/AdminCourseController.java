package com.jplearning.controller;

import com.jplearning.dto.request.CourseApprovalRequest;
import com.jplearning.dto.response.CourseResponse;
import com.jplearning.service.CourseService;
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

@RestController
@RequestMapping("/admin/courses")
@Tag(name = "Admin Course Management", description = "APIs for admin to manage courses")
@CrossOrigin(origins = "*")
public class AdminCourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/pending")
    @Operation(
            summary = "Get pending courses",
            description = "Get all courses pending approval",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CourseResponse>> getPendingCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(courseService.getCoursesPendingApproval(pageable));
    }

    @GetMapping
    @Operation(
            summary = "Get all courses",
            description = "Get all courses (admin can view all courses)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(courseService.getApprovedCourses(pageable));
    }

    @GetMapping("/{courseId}")
    @Operation(
            summary = "Get course details",
            description = "Get details of a specific course by ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PutMapping("/{courseId}/approval")
    @Operation(
            summary = "Approve or reject a course",
            description = "Approve or reject a course that is pending approval",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> approveCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseApprovalRequest request) {

        return ResponseEntity.ok(courseService.approveCourse(courseId, request));
    }

    @DeleteMapping("/{courseId}")
    @Operation(
            summary = "Delete a course",
            description = "Admin can delete any course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        // Admin can delete any course, so we use a placeholder for tutorId
        courseService.deleteCourse(courseId, null);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{courseId}/withdraw")
    @Operation(
            summary = "Withdraw a course",
            description = "Withdraw a course from approved/pending state back to draft state",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> withdrawCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.withdrawCourse(courseId));
    }
}