package com.jplearning.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TutorResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatarUrl;
    private String teachingRequirements;
    private boolean enabled;
    private boolean blocked;
    private List<EducationResponse> educations;
    private List<ExperienceResponse> experiences;
    private List<String> certificates; // Thêm certificates
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class EducationResponse {
        private Long id;
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private String startDate;
        private String endDate;
        private String description;
    }

    @Data
    public static class ExperienceResponse {
        private Long id;
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private String description;
        private boolean current;
    }
}
