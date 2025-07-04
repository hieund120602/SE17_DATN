package com.jplearning.service.impl;

import com.jplearning.entity.Education;
import com.jplearning.entity.Experience;
import com.jplearning.dto.request.ProfileUpdateRequest;
import com.jplearning.dto.request.TutorProfileUpdateRequest;
import com.jplearning.dto.response.EducationResponse;
import com.jplearning.dto.response.ExperienceResponse;
import com.jplearning.dto.response.UserResponse;
import com.jplearning.entity.Role;
import com.jplearning.entity.Student;
import com.jplearning.entity.Tutor;
import com.jplearning.entity.User;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.UserMapper;
import com.jplearning.repository.StudentRepository;
import com.jplearning.repository.TutorRepository;
import com.jplearning.repository.UserRepository;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    public UserResponse getCurrentUser() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Long userId = userDetails.getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Convert user roles to strings
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        // Create base user response
        UserResponse.UserResponseBuilder responseBuilder = UserResponse.builder()
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

        // Check if user is a student
        if (isRolePresent(roles, Role.ERole.ROLE_STUDENT.name())) {
            responseBuilder.userType("STUDENT");

            // If needed, get more student-specific details
            studentRepository.findById(userId).ifPresent(student -> {
                // Add student-specific fields if any
            });
        }
        // Check if user is a tutor
        else if (isRolePresent(roles, Role.ERole.ROLE_TUTOR.name())) {
            responseBuilder.userType("TUTOR");

            // Get tutor-specific details
            tutorRepository.findById(userId).ifPresent(tutor -> {
                responseBuilder.teachingRequirements(tutor.getTeachingRequirements());

                // Map educations to DTOs
                if (tutor.getEducations() != null && !tutor.getEducations().isEmpty()) {
                    List<EducationResponse> educationResponses = tutor.getEducations().stream()
                            .map(userMapper::educationToEducationResponse)
                            .collect(Collectors.toList());
                    responseBuilder.educations(educationResponses);
                }

                // Map experiences to DTOs
                if (tutor.getExperiences() != null && !tutor.getExperiences().isEmpty()) {
                    List<ExperienceResponse> experienceResponses = tutor.getExperiences().stream()
                            .map(userMapper::experienceToExperienceResponse)
                            .collect(Collectors.toList());
                    responseBuilder.experiences(experienceResponses);
                }

                // Set certificate URLs
                responseBuilder.certificateUrls(tutor.getCertificateUrls());
            });
        }
        // Check if user is an admin
        else if (isRolePresent(roles, Role.ERole.ROLE_ADMIN.name())) {
            responseBuilder.userType("ADMIN");
        }

        return responseBuilder.build();
    }

    private boolean isRolePresent(Set<String> roles, String roleName) {
        return roles.stream().anyMatch(role -> role.equals(roleName));
    }

    @Override
    @Transactional
    public UserResponse updateAvatar(Long userId, MultipartFile file) throws IOException {
        // Validate current user is updating their own avatar or is an admin
        validateUserAccess(userId);

        // Validate file is an image
        if (file.isEmpty()) {
            throw new BadRequestException("Avatar image cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Avatar must be an image file");
        }

        // Check file size (max 5MB for avatars)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Avatar image size should not exceed 5MB");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Upload avatar to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadImage(file);

        // Update user's avatar URL
        user.setAvatarUrl(uploadResult.get("secureUrl"));
        userRepository.save(user);

        // Return updated user info
        return getUserDetails(user);
    }

    @Override
    @Transactional
    public UserResponse updateStudentProfile(Long userId, ProfileUpdateRequest request) {
        // Validate current user is updating their own profile or is an admin
        validateUserAccess(userId);

        // Get student
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + userId));

        // Validate email uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(student.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            student.setEmail(request.getEmail());
        }

        // Validate phone number uniqueness if changed
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(student.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new BadRequestException("Phone number is already in use");
            }
            student.setPhoneNumber(request.getPhoneNumber());
        }

        // Update other fields
        if (request.getFullName() != null) {
            student.setFullName(request.getFullName());
        }

        // Save student
        Student updatedStudent = studentRepository.save(student);

        // Return updated user info
        return getUserDetails(updatedStudent);
    }

    @Override
    @Transactional
    public UserResponse updateTutorProfile(Long userId, TutorProfileUpdateRequest request) {
        // Validate current user is updating their own profile or is an admin
        validateUserAccess(userId);

        // Get tutor
        Tutor tutor = tutorRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + userId));

        // Validate email uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(tutor.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            tutor.setEmail(request.getEmail());
        }

        // Validate phone number uniqueness if changed
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(tutor.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new BadRequestException("Phone number is already in use");
            }
            tutor.setPhoneNumber(request.getPhoneNumber());
        }

        // Update other fields
        if (request.getFullName() != null) {
            tutor.setFullName(request.getFullName());
        }

        if (request.getTeachingRequirements() != null) {
            tutor.setTeachingRequirements(request.getTeachingRequirements());
        }

        // Update educations if provided
        if (request.getEducations() != null) {
            // Clear existing educations
            tutor.getEducations().clear();

            // Add new educations
            request.getEducations().forEach(educationRequest -> {
                Education education = userMapper.educationRequestToEducation(educationRequest);
                tutor.getEducations().add(education);
            });
        }

        // Update experiences if provided
        if (request.getExperiences() != null) {
            // Clear existing experiences
            tutor.getExperiences().clear();

            // Add new experiences
            request.getExperiences().forEach(experienceRequest -> {
                Experience experience = userMapper.experienceRequestToExperience(experienceRequest);
                tutor.getExperiences().add(experience);
            });
        }

        // Save tutor
        Tutor updatedTutor = tutorRepository.save(tutor);

        // Return updated user info
        return getUserDetails(updatedTutor);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        // Only admin can access this method
        if (!isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only administrators can access user details");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return getUserDetails(user);
    }

    @Override
    @Transactional
    public UserResponse setUserStatus(Long userId, boolean enabled) {
        // Only admin can access this method
        if (!isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only administrators can enable/disable users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setEnabled(enabled);
        userRepository.save(user);

        return getUserDetails(user);
    }

    @Override
    @Transactional
    public UserResponse blockUser(Long userId, boolean blocked) {
        // Only admin can access this method
        if (!isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only administrators can block/unblock users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setBlocked(blocked);
        userRepository.save(user);

        return getUserDetails(user);
    }

    // Helper methods

    private void validateUserAccess(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Allow if current user is updating their own profile or is an admin
        if (!userDetails.getId().equals(userId) && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("You don't have permission to update this user's profile");
        }
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    private UserResponse getUserDetails(User user) {
        // Convert user roles to strings
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        // Create base user response
        UserResponse.UserResponseBuilder responseBuilder = UserResponse.builder()
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

        // Check if user is a student
        if (isRolePresent(roles, Role.ERole.ROLE_STUDENT.name())) {
            responseBuilder.userType("STUDENT");
        }
        // Check if user is a tutor
        else if (isRolePresent(roles, Role.ERole.ROLE_TUTOR.name())) {
            responseBuilder.userType("TUTOR");

            // Get tutor-specific details
            tutorRepository.findById(user.getId()).ifPresent(tutor -> {
                responseBuilder.teachingRequirements(tutor.getTeachingRequirements());

                // Map educations to DTOs
                if (tutor.getEducations() != null && !tutor.getEducations().isEmpty()) {
                    List<EducationResponse> educationResponses = tutor.getEducations().stream()
                            .map(userMapper::educationToEducationResponse)
                            .collect(Collectors.toList());
                    responseBuilder.educations(educationResponses);
                }

                // Map experiences to DTOs
                if (tutor.getExperiences() != null && !tutor.getExperiences().isEmpty()) {
                    List<ExperienceResponse> experienceResponses = tutor.getExperiences().stream()
                            .map(userMapper::experienceToExperienceResponse)
                            .collect(Collectors.toList());
                    responseBuilder.experiences(experienceResponses);
                }

                // Set certificate URLs
                responseBuilder.certificateUrls(tutor.getCertificateUrls());
            });
        }
        // Check if user is an admin
        else if (isRolePresent(roles, Role.ERole.ROLE_ADMIN.name())) {
            responseBuilder.userType("ADMIN");
        }

        return responseBuilder.build();
    }
}