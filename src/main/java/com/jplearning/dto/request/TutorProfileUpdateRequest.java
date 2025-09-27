package com.jplearning.dto.request;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class TutorProfileUpdateRequest extends ProfileUpdateRequest {
    private String teachingRequirements;

    @Valid
    private List<EducationRequest> educations;

    @Valid
    private List<ExperienceRequest> experiences;
}
