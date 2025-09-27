package com.jplearning.controller;

import com.jplearning.dto.request.CourseRequest;
import com.jplearning.dto.response.CourseResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/tutor/courses")
@Tag(name = "Tutor Course Management", description = "APIs for tutor to manage courses")
@CrossOrigin(origins = "*")
public class TutorCourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping
    @Operation(
            summary = "Create a new course",
            description = "Create a new course as a tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(courseService.createCourse(request, tutorId));
    }

    @GetMapping
    @Operation(
            summary = "Get all courses by tutor",
            description = "Get all courses created by the authenticated tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Page<CourseResponse>> getTutorCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Long tutorId = getCurrentUserId();
        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(courseService.getCoursesByTutor(tutorId, pageable));
    }

    @GetMapping("/{courseId}")
    @Operation(
            summary = "Get course details",
            description = "Get details of a specific course by ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PostMapping(value = "/{courseId}/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload course thumbnail",
            description = "Upload thumbnail image for a course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<CourseResponse> uploadCourseThumbnail(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file) {
        try {
            Long tutorId = getCurrentUserId();
            return ResponseEntity.ok(courseService.uploadThumbnail(courseId, file, tutorId));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload thumbnail: " + e.getMessage());
        }
    }

    @PutMapping("/{courseId}")
    @Operation(
            summary = "Update a course",
            description = "Update an existing course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseRequest request) {

        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(courseService.updateCourse(courseId, request, tutorId));
    }

    @DeleteMapping("/{courseId}")
    @Operation(
            summary = "Delete a course",
            description = "Delete an existing course",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        Long tutorId = getCurrentUserId();
        courseService.deleteCourse(courseId, tutorId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{courseId}/submit")
    @Operation(
            summary = "Submit course for approval",
            description = "Submit a course for admin approval",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<CourseResponse> submitCourseForApproval(@PathVariable Long courseId) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(courseService.submitCourseForApproval(courseId, tutorId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}