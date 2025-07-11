package com.jplearning.dto.request;

import com.jplearning.entity.Exercise;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ExerciseRequest {
    @NotBlank(message = "Exercise title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @NotNull(message = "Exercise type is required")
    private Exercise.ExerciseType type;

    @Valid
    private List<QuestionRequest> questions;

    private String targetText;

    private String targetAudioUrl;

    private Exercise.DifficultyLevel difficultyLevel;

    private String speechRecognitionLanguage = "ja-JP";

    private Integer minimumAccuracyScore = 70;
}