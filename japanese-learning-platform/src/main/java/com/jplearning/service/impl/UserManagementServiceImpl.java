package com.jplearning.service.impl;

import com.jplearning.dto.response.EducationResponse;
import com.jplearning.dto.response.ExperienceResponse;
import com.jplearning.dto.response.UserResponse;
import com.jplearning.entity.Role;
import com.jplearning.entity.Tutor;
import com.jplearning.entity.User;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.UserMapper;
import com.jplearning.repository.TutorRepository;
import com.jplearning.repository.UserRepository;
import com.jplearning.service.EmailService;
import com.jplearning.service.UserManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserManagementServiceImpl implements UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public UserResponse blockUser(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is already blocked
        if (user.isBlocked()) {
            throw new BadRequestException("User is already blocked");
        }

        // Block user
        user.setBlocked(true);

        User updatedUser = userRepository.save(user);

        // Send notification email
        sendBlockNotificationEmail(user, reason);

        return mapUserToResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is already unblocked
        if (!user.isBlocked()) {
            throw new BadRequestException("User is not blocked");
        }

        // Unblock user
        user.setBlocked(false);

        User updatedUser = userRepository.save(user);

        // Send notification email
        sendUnblockNotificationEmail(user);

        return mapUserToResponse(updatedUser);
    }

    @Override
    public UserResponse getUserBlockStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapUserToResponse(user);
    }

    // Helper methods

    private void sendBlockNotificationEmail(User user, String reason) {
        String reasonText = reason != null && !reason.isEmpty()
                ? "\n\nReason: " + reason
                : "";

        String emailBody = "Dear " + user.getFullName() + ",\n\n" +
                "We regret to inform you that your account on the Japanese Learning Platform has been blocked." +
                reasonText + "\n\n" +
                "If you believe this is an error or would like to appeal this decision, " +
                "please contact our support team at support@jplearning.com.\n\n" +
                "Best regards,\n" +
                "Japanese Learning Platform Team";

        emailService.sendEmail(
                user.getEmail(),
                "Japanese Learning Platform - Account Blocked",
                emailBody
        );
    }

    private void sendUnblockNotificationEmail(User user) {
        String emailBody = "Dear " + user.getFullName() + ",\n\n" +
                "We are pleased to inform you that your account on the Japanese Learning Platform has been unblocked. " +
                "You can now log in and access all features of the platform.\n\n" +
                "If you have any questions or concerns, please contact our support team at support@jplearning.com.\n\n" +
                "Best regards,\n" +
                "Japanese Learning Platform Team";

        emailService.sendEmail(
                user.getEmail(),
                "Japanese Learning Platform - Account Unblocked",
                emailBody
        );
    }

    private UserResponse mapUserToResponse(User user) {
        // Convert user roles to strings
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .enabled(user.isEnabled())
                .blocked(user.isBlocked())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        // Determine user type and add additional fields
        if (roles.contains(Role.ERole.ROLE_TUTOR.name())) {
            builder.userType("TUTOR");

            // Get tutor-specific details if available
            tutorRepository.findById(user.getId()).ifPresent(tutor -> {
                builder.teachingRequirements(tutor.getTeachingRequirements());

                // Map educations
                if (tutor.getEducations() != null && !tutor.getEducations().isEmpty()) {
                    List<EducationResponse> educationResponses = tutor.getEducations().stream()
                            .map(userMapper::educationToEducationResponse)
                            .collect(Collectors.toList());
                    builder.educations(educationResponses);
                }

                // Map experiences
                if (tutor.getExperiences() != null && !tutor.getExperiences().isEmpty()) {
                    List<ExperienceResponse> experienceResponses = tutor.getExperiences().stream()
                            .map(userMapper::experienceToExperienceResponse)
                            .collect(Collectors.toList());
                    builder.experiences(experienceResponses);
                }

                // Set certificate URLs
                builder.certificateUrls(tutor.getCertificateUrls());
            });
        } else if (roles.contains(Role.ERole.ROLE_STUDENT.name())) {
            builder.userType("STUDENT");
        } else if (roles.contains(Role.ERole.ROLE_ADMIN.name())) {
            builder.userType("ADMIN");
        } else {
            builder.userType("GUEST");
        }

        return builder.build();
    }
}