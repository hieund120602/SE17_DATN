package com.jplearning.dto.response;

import com.jplearning.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedExerciseResponse {
    private String title;
    private String description;
    private Exercise.ExerciseType type;
    private List<GeneratedQuestionResponse> questions;
    private String promptUsed;
}