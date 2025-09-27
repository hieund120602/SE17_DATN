package com.jplearning.dto.response;

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
public class QuestionResponse {
    private Long id;
    private String content;
    private String hint;
    private String correctAnswer;
    private String answerExplanation;
    private Integer points;
    private List<OptionResponse> options;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}