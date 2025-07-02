package com.jplearning.service;

import com.jplearning.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {
    /**
     * Get all students with pagination
     * @param pageable Pagination information
     * @return Page of student responses
     */
    Page<UserResponse> getAllStudents(Pageable pageable);

    /**
     * Get all tutors with pagination
     * @param pageable Pagination information
     * @return Page of tutor responses
     */
    Page<UserResponse> getAllTutors(Pageable pageable);

    /**
     * Get pending tutor approvals
     * @param pageable Pagination information
     * @return Page of pending tutor responses
     */
    Page<UserResponse> getPendingTutors(Pageable pageable);

    /**
     * Approve a tutor account
     * @param tutorId ID of the tutor
     * @return Updated tutor response
     */
    UserResponse approveTutor(Long tutorId);

    /**
     * Reject a tutor account
     * @param tutorId ID of the tutor
     * @param reason Optional reason for rejection
     * @return Updated tutor response
     */
    UserResponse rejectTutor(Long tutorId, String reason);

    /**
     * Search users by email or name
     * @param query Search query
     * @param pageable Pagination information
     * @return Page of matching user responses
     */
    Page<UserResponse> searchUsers(String query, Pageable pageable);

    /**
     * Enable or disable a user account
     * @param userId ID of the user
     * @param enabled Whether to enable or disable the account
     * @return Updated user response
     */
    UserResponse setUserStatus(Long userId, boolean enabled);

    /**
     * Block or unblock a user account
     * @param userId ID of the user
     * @param blocked Whether to block or unblock the account
     * @return Updated user response
     */
    UserResponse setUserBlockStatus(Long userId, boolean blocked);
}