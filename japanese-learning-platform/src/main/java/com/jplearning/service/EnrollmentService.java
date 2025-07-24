package com.jplearning.service;

import com.jplearning.dto.response.EnrollmentResponse;
import com.jplearning.entity.Payment;

import java.util.List;

public interface EnrollmentService {
    /**
     * Enroll a student in a course
     *
     * @param studentId ID of the student
     * @param courseId ID of the course
     * @param payment Payment information
     * @return Enrollment response
     */
    EnrollmentResponse enrollStudentInCourse(Long studentId, Long courseId, Payment payment);

    /**
     * Enroll a student in a course combo
     *
     * @param studentId ID of the student
     * @param comboId ID of the course combo
     * @param payment Payment information
     * @return List of enrollment responses
     */
    List<EnrollmentResponse> enrollStudentInCombo(Long studentId, Long comboId, Payment payment);

    /**
     * Get all enrollments for a student
     *
     * @param studentId ID of the student
     * @return List of enrollment responses
     */
    List<EnrollmentResponse> getStudentEnrollments(Long studentId);

    /**
     * Update student's course progress
     *
     * @param enrollmentId ID of the enrollment
     * @param lessonId ID of the completed lesson
     * @return Updated enrollment response
     */
    EnrollmentResponse updateProgress(Long enrollmentId, Long lessonId);

    /**
     * Generate course completion certificate
     *
     * @param enrollmentId ID of the enrollment
     * @return URL of the generated certificate
     */
    String generateCertificate(Long enrollmentId);

    /**
     * Check if student is enrolled in a course
     * @param studentId ID of the student
     * @param courseId ID of the course
     * @return true if student is enrolled in course
     */
    boolean isStudentEnrolledInCourse(Long studentId, Long courseId);

    /**
     * Check if student is enrolled in a combo
     * @param studentId ID of the student
     * @param comboId ID of the combo
     * @return true if student is enrolled in combo
     */
    boolean isStudentEnrolledInCombo(Long studentId, Long comboId);
}