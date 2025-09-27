package com.jplearning.dto.request;

import com.jplearning.entity.Exercise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpeechExerciseRequest {
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
}
