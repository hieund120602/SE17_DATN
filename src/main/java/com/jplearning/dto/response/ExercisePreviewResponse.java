package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
class ExercisePreviewResponse {
    private Long id;
    private String title;
    private String description;
    private String type;
    private List<QuestionPreviewResponse> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExercisePreviewResponse(ExerciseResponse exercise, boolean showAnswers) {
        this.id = exercise.getId();
        this.title = exercise.getTitle();
        this.description = exercise.getDescription();
        this.type = exercise.getType().toString();
        this.createdAt = exercise.getCreatedAt();
        this.updatedAt = exercise.getUpdatedAt();

        if (exercise.getQuestions() != null) {
            this.questions = exercise.getQuestions().stream()
                    .map(question -> new QuestionPreviewResponse(question, showAnswers))
                    .collect(Collectors.toList());
        }
    }
}
