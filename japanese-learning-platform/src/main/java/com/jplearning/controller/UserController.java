package com.jplearning.controller;

import com.jplearning.dto.request.ProfileUpdateRequest;
import com.jplearning.dto.request.TutorProfileUpdateRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.UserResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/users")
@Tag(name = "User", description = "User API")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @Operation(
            summary = "Get current user profile",
            description = "Get the profile of the currently authenticated user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Update user avatar",
            description = "Upload a new avatar image for the current user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        try {
            Long userId = getCurrentUserId();
            return ResponseEntity.ok(userService.updateAvatar(userId, file));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @PutMapping("/me/profile")
    @Operation(
            summary = "Update student profile",
            description = "Update profile for student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<UserResponse> updateStudentProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.updateStudentProfile(userId, request));
    }

    @PutMapping("/me/tutor-profile")
    @Operation(
            summary = "Update tutor profile",
            description = "Update profile for tutor including education and experience",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<UserResponse> updateTutorProfile(@Valid @RequestBody TutorProfileUpdateRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userService.updateTutorProfile(userId, request));
    }

    @PostMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Update user avatar by ID",
            description = "Admin can upload a new avatar image for any user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserAvatar(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(userService.updateAvatar(userId, file));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/profile")
    @Operation(
            summary = "Update user profile by ID",
            description = "Admin can update profile for any student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserProfile(
            @PathVariable Long userId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateStudentProfile(userId, request));
    }

    @PutMapping("/{userId}/tutor-profile")
    @Operation(
            summary = "Update tutor profile by ID",
            description = "Admin can update profile for any tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateTutorProfileById(
            @PathVariable Long userId,
            @Valid @RequestBody TutorProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateTutorProfile(userId, request));
    }

    @GetMapping("/{userId}")
    @Operation(
            summary = "Get user by ID",
            description = "Admin can get details of any user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/account-status")
    @Operation(
            summary = "Get account status",
            description = "Get current account status (enabled/blocked)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> getAccountStatus() {
        UserResponse user = userService.getCurrentUser();
        String status;

        if (user.isBlocked()) {
            status = "Your account is currently blocked. Please contact administrator for assistance.";
        } else if (!user.isEnabled()) {
            status = "Your account has not been activated. Please verify your email.";

            if (user.getUserType().equals("TUTOR")) {
                status += " As a tutor, your account also requires admin approval after email verification.";
            }
        } else {
            status = "Your account is active and in good standing.";
        }

        return ResponseEntity.ok(new MessageResponse(status));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}