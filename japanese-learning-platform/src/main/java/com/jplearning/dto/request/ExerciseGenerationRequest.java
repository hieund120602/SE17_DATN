package com.jplearning.dto.request;

import com.jplearning.entity.Exercise;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExerciseGenerationRequest {
    @NotNull(message = "Exercise type is required")
    private Exercise.ExerciseType type;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Level is required")
    private String level;

    @Min(value = 1, message = "Question count must be at least 1")
    private int questionCount = 5;

    private String additionalInstructions;
}