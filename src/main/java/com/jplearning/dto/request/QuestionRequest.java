package com.jplearning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank(message = "Question content is required")
    private String content;

    private String hint;

    private String correctAnswer;

    private String answerExplanation;

    @NotNull(message = "Points value is required")
    @Positive(message = "Points must be a positive value")
    private Integer points;

    @Valid
    private List<OptionRequest> options;
}