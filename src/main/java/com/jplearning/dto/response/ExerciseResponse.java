package com.jplearning.dto.response;

import com.jplearning.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseResponse {
    private Long id;
    private String title;
    private String description;
    private Exercise.ExerciseType type;
    private List<QuestionResponse> questions;
    
    // Speech exercise specific fields
    private String targetText;
    private String targetAudioUrl;
    private Exercise.DifficultyLevel difficultyLevel;
    private String speechRecognitionLanguage;
    private Integer minimumAccuracyScore;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}