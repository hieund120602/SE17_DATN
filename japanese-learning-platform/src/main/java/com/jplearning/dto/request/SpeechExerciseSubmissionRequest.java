package com.jplearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpeechExerciseSubmissionRequest {
    @NotNull(message = "Exercise ID is required")
    private Long exerciseId;

    private String recognizedText;

    private String studentAudioUrl;

    private Double confidenceScore;

    private Long timeSpentSeconds;
}