package com.jplearning.service;

import com.jplearning.dto.request.CourseApprovalRequest;
import com.jplearning.dto.request.CourseRequest;
import com.jplearning.dto.response.CourseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CourseService {
    /**
     * Create a new course by a tutor
     *
     * @param request Course details
     * @param tutorId ID of the tutor creating the course
     * @return Created course response
     */
    CourseResponse createCourse(CourseRequest request, Long tutorId);

    /**
     * Get a course by ID
     *
     * @param courseId Course ID
     * @return Course response
     */
    CourseResponse getCourseById(Long courseId);

    /**
     * Get a course by ID with enrollment status
     *
     * @param courseId Course ID
     * @param studentId Student ID to check enrollment status
     * @return Course response with enrollment status
     */
    CourseResponse getCourseWithEnrollmentStatus(Long courseId, Long studentId);

    /**
     * Update an existing course
     *
     * @param courseId Course ID to update
     * @param request Updated course details
     * @param tutorId ID of the tutor updating the course
     * @return Updated course response
     */
    CourseResponse updateCourse(Long courseId, CourseRequest request, Long tutorId);

    /**
     * Delete a course
     *
     * @param courseId Course ID to delete
     * @param tutorId ID of the tutor deleting the course
     */
    void deleteCourse(Long courseId, Long tutorId);

    /**
     * Submit a course for approval by admin
     *
     * @param courseId Course ID to submit
     * @param tutorId ID of the tutor submitting the course
     * @return Updated course response
     */
    CourseResponse submitCourseForApproval(Long courseId, Long tutorId);

    /**
     * Approve or reject a course by admin
     *
     * @param courseId Course ID to approve/reject
     * @param request Approval details with status and optional feedback
     * @return Updated course response
     */
    CourseResponse approveCourse(Long courseId, CourseApprovalRequest request);

    /**
     * Get all courses by a tutor
     *
     * @param tutorId Tutor ID
     * @param pageable Pagination information
     * @return Page of courses by tutor
     */
    Page<CourseResponse> getCoursesByTutor(Long tutorId, Pageable pageable);

    /**
     * Get all courses pending approval
     *
     * @param pageable Pagination information
     * @return Page of courses pending approval
     */
    Page<CourseResponse> getCoursesPendingApproval(Pageable pageable);

    /**
     * Get all approved courses
     *
     * @param pageable Pagination information
     * @return Page of approved courses
     */
    Page<CourseResponse> getApprovedCourses(Pageable pageable);

    /**
     * Get all approved courses with enrollment status for a student
     *
     * @param pageable Pagination information
     * @param studentId Student ID to check enrollment status
     * @return Page of approved courses with enrollment status
     */
    Page<CourseResponse> getApprovedCoursesWithEnrollmentStatus(Pageable pageable, Long studentId);

    /**
     * Search courses by title
     *
     * @param title Title to search for
     * @param pageable Pagination information
     * @return Page of matching courses
     */
    Page<CourseResponse> searchCoursesByTitle(String title, Pageable pageable);

    /**
     * Search courses by title with enrollment status
     *
     * @param title Title to search for
     * @param pageable Pagination information
     * @param studentId Student ID to check enrollment status
     * @return Page of matching courses with enrollment status
     */
    Page<CourseResponse> searchCoursesByTitleWithEnrollmentStatus(String title, Pageable pageable, Long studentId);

    /**
     * Upload thumbnail for a course
     *
     * @param courseId Course ID
     * @param file Thumbnail image file
     * @param tutorId ID of the tutor uploading the thumbnail
     * @return Updated course response
     * @throws IOException If an I/O error occurs
     */
    CourseResponse uploadThumbnail(Long courseId, MultipartFile file, Long tutorId) throws IOException;

    public CourseResponse withdrawCourse(Long courseId);

    /**
     * Get top popular courses based on purchase count
     *
     * @return List of top 10 most purchased courses
     */
    List<CourseResponse> getTopCoursesByPurchaseCount();
}