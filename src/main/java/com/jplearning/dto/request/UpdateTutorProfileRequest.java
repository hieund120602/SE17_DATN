package com.jplearning.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateTutorProfileRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String teachingRequirements;
    private List<EducationRequest> educations;
    private List<ExperienceRequest> experiences;

    @Data
    public static class EducationRequest {
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private String startDate;
        private String endDate;
        private String description;
    }

    @Data
    public static class ExperienceRequest {
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private String description;
        private boolean current;
    }
}
