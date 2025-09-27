package com.jplearning.service;

import com.jplearning.dto.request.ManualEnrollmentRequest;
import com.jplearning.dto.response.EnrollmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminEnrollmentService {
    /**
     * Get all enrollments with pagination
     * @param pageable Pagination parameters
     * @return Page of enrollment responses
     */
    Page<EnrollmentResponse> getAllEnrollments(Pageable pageable);

    /**
     * Get enrollments for a specific student
     * @param studentId Student ID
     * @return List of enrollment responses
     */
    List<EnrollmentResponse> getStudentEnrollments(Long studentId);

    /**
     * Get enrollments for a specific course with pagination
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of enrollment responses
     */
    Page<EnrollmentResponse> getCourseEnrollments(Long courseId, Pageable pageable);

    /**
     * Create enrollment manually without payment
     * @param request Manual enrollment request
     * @return Created enrollment response
     */
    EnrollmentResponse createManualEnrollment(ManualEnrollmentRequest request);

    /**
     * Update enrollment status
     * @param enrollmentId Enrollment ID
     * @param completed Whether the enrollment is completed
     * @return Updated enrollment response
     */
    EnrollmentResponse updateEnrollmentStatus(Long enrollmentId, boolean completed);
}