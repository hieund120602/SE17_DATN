package com.jplearning.service;

import com.jplearning.dto.request.ProfileUpdateRequest;
import com.jplearning.dto.request.TutorProfileUpdateRequest;
import com.jplearning.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UserService {
    /**
     * Get current authenticated user details
     * @return User details of the authenticated user
     */
    UserResponse getCurrentUser();

    /**
     * Update user avatar
     * @param userId ID of the user
     * @param file Avatar image file
     * @return Updated user details
     * @throws IOException If an I/O error occurs
     */
    UserResponse updateAvatar(Long userId, MultipartFile file) throws IOException;

    /**
     * Update student profile
     * @param userId ID of the user
     * @param request Profile update details
     * @return Updated user details
     */
    UserResponse updateStudentProfile(Long userId, ProfileUpdateRequest request);

    /**
     * Update tutor profile
     * @param userId ID of the user
     * @param request Tutor profile update details
     * @return Updated user details
     */
    UserResponse updateTutorProfile(Long userId, TutorProfileUpdateRequest request);

    /**
     * Get user details by ID (admin only)
     * @param userId ID of the user
     * @return User details
     */
    UserResponse getUserById(Long userId);

    /**
     * Enable or disable a user (admin only)
     * @param userId ID of the user
     * @param enabled Whether to enable or disable the user
     * @return Updated user details
     */
    UserResponse setUserStatus(Long userId, boolean enabled);

    /**
     * Block or unblock a user (admin only)
     * @param userId ID of the user
     * @param blocked Whether to block or unblock the user
     * @return Updated user details
     */
    UserResponse blockUser(Long userId, boolean blocked);
}