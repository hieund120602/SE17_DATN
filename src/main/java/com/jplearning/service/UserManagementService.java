package com.jplearning.service;

import com.jplearning.dto.response.UserResponse;

public interface UserManagementService {
    /**
     * Block a user account
     *
     * @param userId ID of the user to block
     * @param reason Optional reason for blocking
     * @return Updated user details
     */
    UserResponse blockUser(Long userId, String reason);

    /**
     * Unblock a user account
     *
     * @param userId ID of the user to unblock
     * @return Updated user details
     */
    UserResponse unblockUser(Long userId);

    /**
     * Get block status for a user
     *
     * @param userId ID of the user
     * @return User details including block status
     */
    UserResponse getUserBlockStatus(Long userId);
}