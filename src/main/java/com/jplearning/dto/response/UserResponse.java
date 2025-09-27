package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatarUrl;
    private Set<String> roles;
    private String userType; // "STUDENT", "TUTOR", or "ADMIN"
    private boolean enabled;
    private boolean blocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for tutors
    private String teachingRequirements;
    private Object educations; // Will be a list if the user is a tutor
    private Object experiences; // Will be a list if the user is a tutor
    private Object certificateUrls; // Will be a list if the user is a tutor
}