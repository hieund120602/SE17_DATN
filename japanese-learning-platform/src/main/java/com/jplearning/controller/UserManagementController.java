package com.jplearning.controller;

import com.jplearning.dto.request.ProfileUpdateRequest;
import com.jplearning.dto.request.TutorProfileUpdateRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.UserResponse;
import com.jplearning.service.AdminUserService;
import com.jplearning.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-management")
@Tag(name = "User Management", description = "APIs for user account management")
@CrossOrigin(origins = "*")
public class UserManagementController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminUserService adminUserService;

    @PutMapping("/account/enable/{userId}")
    @Operation(
            summary = "Enable user account",
            description = "Admin can enable a user account",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> enableUserAccount(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.setUserStatus(userId, true));
    }

    @PutMapping("/account/disable/{userId}")
    @Operation(
            summary = "Disable user account",
            description = "Admin can disable a user account",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> disableUserAccount(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.setUserStatus(userId, false));
    }

    @PutMapping("/account/block/{userId}")
    @Operation(
            summary = "Block user account",
            description = "Admin can block a user account",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> blockUserAccount(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.setUserBlockStatus(userId, true));
    }

    @PutMapping("/account/unblock/{userId}")
    @Operation(
            summary = "Unblock user account",
            description = "Admin can unblock a user account",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> unblockUserAccount(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.setUserBlockStatus(userId, false));
    }

    @PutMapping("/tutor/approve/{tutorId}")
    @Operation(
            summary = "Approve tutor",
            description = "Admin can approve a pending tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> approveTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(adminUserService.approveTutor(tutorId));
    }

    @PutMapping("/tutor/reject/{tutorId}")
    @Operation(
            summary = "Reject tutor",
            description = "Admin can reject a pending tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> rejectTutor(
            @PathVariable Long tutorId,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(adminUserService.rejectTutor(tutorId, reason));
    }

    @GetMapping("/account/status")
    @Operation(
            summary = "Get account status",
            description = "Get detailed status information about the current user's account",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> getAccountStatus() {
        UserResponse user = userService.getCurrentUser();

        String statusMessage = "Your account is ";
        if (!user.isEnabled()) {
            statusMessage += "not activated. Please verify your email.";
        } else if (user.isBlocked()) {
            statusMessage += "blocked. Please contact administrator for assistance.";
        } else {
            statusMessage += "active and in good standing.";
        }

        if (user.getUserType().equals("TUTOR") && !user.isEnabled()) {
            statusMessage += " As a tutor, your account requires admin approval before you can access all features.";
        }

        return ResponseEntity.ok(new MessageResponse(statusMessage));
    }
}