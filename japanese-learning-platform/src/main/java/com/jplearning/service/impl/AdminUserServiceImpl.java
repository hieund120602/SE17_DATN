package com.jplearning.service.impl;

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
import com.jplearning.service.AdminUserService;
import com.jplearning.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EmailService emailService;

    @Override
    public Page<UserResponse> getAllStudents(Pageable pageable) {
        Page<Student> students = studentRepository.findAll(pageable);
        return students.map(this::mapStudentToResponse);
    }

    @Override
    public Page<UserResponse> getAllTutors(Pageable pageable) {
        Page<Tutor> tutors = tutorRepository.findAll(pageable);
        return tutors.map(this::mapTutorToResponse);
    }

    @Override
    public Page<UserResponse> getPendingTutors(Pageable pageable) {
        // Get tutors that are not enabled (pending approval) and not blocked
        Page<Tutor> pendingTutors = tutorRepository.findByEnabledAndBlocked(false, false, pageable);
        return pendingTutors.map(this::mapTutorToResponse);
    }

    @Override
    @Transactional
    public UserResponse approveTutor(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + tutorId));

        // Check if already enabled
        if (tutor.isEnabled()) {
            throw new BadRequestException("Tutor is already approved");
        }

        // Enable tutor account (only sets enabled=true, doesn't change blocked status)
        tutor.setEnabled(true);
        Tutor updatedTutor = tutorRepository.save(tutor);

        // Send notification email
        emailService.sendEmail(
                tutor.getEmail(),
                "Your Tutor Account Has Been Approved",
                "Congratulations! Your tutor account on Japanese Learning Platform has been approved. " +
                        "You can now log in and start creating courses."
        );

        return mapTutorToResponse(updatedTutor);
    }

    @Override
    @Transactional
    public UserResponse rejectTutor(Long tutorId, String reason) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + tutorId));

        // We don't actually delete the account, but keep it disabled and mark it as blocked
        tutor.setEnabled(false);
        tutor.setBlocked(true);
        Tutor updatedTutor = tutorRepository.save(tutor);

        // Send rejection email
        String rejectionMessage = "We're sorry, but your tutor application has been rejected.";
        if (reason != null && !reason.isEmpty()) {
            rejectionMessage += " Reason: " + reason;
        }

        emailService.sendEmail(
                tutor.getEmail(),
                "Your Tutor Application Status",
                rejectionMessage
        );

        return mapTutorToResponse(updatedTutor);
    }

    @Override
    public Page<UserResponse> searchUsers(String query, Pageable pageable) {
        // Search by email or name, case-insensitive
        Page<User> users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                query, query, pageable);

        return users.map(user -> {
            if (isStudent(user)) {
                Student student = studentRepository.findById(user.getId()).orElse(null);
                if (student != null) {
                    return mapStudentToResponse(student);
                }
            } else if (isTutor(user)) {
                Tutor tutor = tutorRepository.findById(user.getId()).orElse(null);
                if (tutor != null) {
                    return mapTutorToResponse(tutor);
                }
            }

            // Fallback to basic user info
            return mapUserToBasicResponse(user);
        });
    }

    @Override
    @Transactional
    public UserResponse setUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update enabled status
        user.setEnabled(enabled);
        User updatedUser = userRepository.save(user);

        // Send notification email
        String subject = enabled ? "Your Account Has Been Activated" : "Your Account Has Been Deactivated";
        String message = enabled
                ? "Your account on Japanese Learning Platform has been activated. You can now log in."
                : "Your account on Japanese Learning Platform has been deactivated. Please contact administrator for more information.";

        emailService.sendEmail(user.getEmail(), subject, message);

        return mapUserToResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse setUserBlockStatus(Long userId, boolean blocked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update blocked status
        user.setBlocked(blocked);
        User updatedUser = userRepository.save(user);

        // Send notification email
        String subject = blocked ? "Your Account Has Been Blocked" : "Your Account Has Been Unblocked";
        String message = blocked
                ? "Your account on Japanese Learning Platform has been blocked. Please contact administrator for more information."
                : "Your account on Japanese Learning Platform has been unblocked. You can now log in.";

        emailService.sendEmail(user.getEmail(), subject, message);

        return mapUserToResponse(updatedUser);
    }

    // Helper methods

    private boolean isStudent(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.ERole.ROLE_STUDENT);
    }

    private boolean isTutor(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.ERole.ROLE_TUTOR);
    }

    private UserResponse mapStudentToResponse(Student student) {
        // Convert user roles to strings
        Set<String> roles = student.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .phoneNumber(student.getPhoneNumber())
                .avatarUrl(student.getAvatarUrl())
                .roles(roles)
                .userType("STUDENT")
                .enabled(student.isEnabled())
                .blocked(student.isBlocked())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    private UserResponse mapTutorToResponse(Tutor tutor) {
        // Convert user roles to strings
        Set<String> roles = tutor.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        // Map educations
        List<EducationResponse> educationResponses = null;
        if (tutor.getEducations() != null && !tutor.getEducations().isEmpty()) {
            educationResponses = tutor.getEducations().stream()
                    .map(userMapper::educationToEducationResponse)
                    .collect(Collectors.toList());
        }

        // Map experiences
        List<ExperienceResponse> experienceResponses = null;
        if (tutor.getExperiences() != null && !tutor.getExperiences().isEmpty()) {
            experienceResponses = tutor.getExperiences().stream()
                    .map(userMapper::experienceToExperienceResponse)
                    .collect(Collectors.toList());
        }

        return UserResponse.builder()
                .id(tutor.getId())
                .fullName(tutor.getFullName())
                .email(tutor.getEmail())
                .phoneNumber(tutor.getPhoneNumber())
                .avatarUrl(tutor.getAvatarUrl())
                .roles(roles)
                .userType("TUTOR")
                .enabled(tutor.isEnabled())
                .blocked(tutor.isBlocked())
                .teachingRequirements(tutor.getTeachingRequirements())
                .educations(educationResponses)
                .experiences(experienceResponses)
                .certificateUrls(tutor.getCertificateUrls())
                .createdAt(tutor.getCreatedAt())
                .updatedAt(tutor.getUpdatedAt())
                .build();
    }

    private UserResponse mapUserToBasicResponse(User user) {
        // Convert user roles to strings
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        // Determine user type
        String userType = "GUEST";
        if (roles.contains(Role.ERole.ROLE_ADMIN.name())) {
            userType = "ADMIN";
        } else if (roles.contains(Role.ERole.ROLE_TUTOR.name())) {
            userType = "TUTOR";
        } else if (roles.contains(Role.ERole.ROLE_STUDENT.name())) {
            userType = "STUDENT";
        }

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .userType(userType)
                .enabled(user.isEnabled())
                .blocked(user.isBlocked())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private UserResponse mapUserToResponse(User user) {
        if (isStudent(user)) {
            Student student = studentRepository.findById(user.getId()).orElse(null);
            if (student != null) {
                return mapStudentToResponse(student);
            }
        } else if (isTutor(user)) {
            Tutor tutor = tutorRepository.findById(user.getId()).orElse(null);
            if (tutor != null) {
                return mapTutorToResponse(tutor);
            }
        }

        return mapUserToBasicResponse(user);
    }
}