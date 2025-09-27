package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedQuestionResponse {
    private String content;
    private String hint;
    private String correctAnswer;
    private String answerExplanation;
    private List<Map<String, Object>> options; // For multiple choice: {content: String, correct: Boolean}
}