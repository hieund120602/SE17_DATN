package com.jplearning.dto.response;

import com.jplearning.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechExerciseResultResponse {
    private Long id;
    private Long exerciseId;
    private String targetText;
    private String recognizedText;
    private String studentAudioUrl;
    private Double accuracyScore;
    private Double confidenceScore;
    private String pronunciationFeedback;
    private Boolean isPassed;
    private Integer attemptNumber;
    private Long timeSpentSeconds;
    private LocalDateTime createdAt;

    // Exercise info
    private String exerciseTitle;
    private Exercise.DifficultyLevel difficultyLevel;
}