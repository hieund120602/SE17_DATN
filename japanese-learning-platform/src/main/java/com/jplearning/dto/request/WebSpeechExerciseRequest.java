package com.jplearning.dto.request;

import com.jplearning.entity.Exercise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WebSpeechExerciseRequest {
    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Exercise type is required")
    private Exercise.ExerciseType type;

    @NotBlank(message = "Target text is required")
    private String targetText;

    private String targetAudioUrl;

    private Exercise.DifficultyLevel difficultyLevel = Exercise.DifficultyLevel.BEGINNER;

    private String speechRecognitionLanguage = "ja-JP";

    private Integer minimumAccuracyScore = 70;

    // Web Speech API specific settings
    private Boolean continuous = false;

    private Boolean interimResults = true;

    private Integer maxAlternatives = 1;

    private String serviceURI;

    private String grammar;

    // Exercise specific settings
    private Integer timeLimit = 60; // seconds

    private Integer maxAttempts = 3;

    private Boolean allowRetry = true;

    private String instructions;

    private String hints;
} 