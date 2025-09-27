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
class QuestionPreviewResponse {
    private Long id;
    private String content;
    private String hint;
    private String correctAnswer;
    private String answerExplanation;
    private Integer points;
    private List<OptionPreviewResponse> options;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public QuestionPreviewResponse(QuestionResponse question, boolean showAnswers) {
        this.id = question.getId();
        this.content = question.getContent();
        this.hint = question.getHint();
        this.points = question.getPoints();
        this.createdAt = question.getCreatedAt();
        this.updatedAt = question.getUpdatedAt();

        if (showAnswers) {
            // Hiển thị đáp án nếu học viên đã đăng ký
            this.correctAnswer = question.getCorrectAnswer();
            this.answerExplanation = question.getAnswerExplanation();

            if (question.getOptions() != null) {
                this.options = question.getOptions().stream()
                        .map(option -> new OptionPreviewResponse(option, true))
                        .collect(Collectors.toList());
            }
        } else {
            // Không hiển thị đáp án nếu học viên chưa đăng ký
            this.correctAnswer = null;
            this.answerExplanation = null;

            if (question.getOptions() != null) {
                this.options = question.getOptions().stream()
                        .map(option -> new OptionPreviewResponse(option, false))
                        .collect(Collectors.toList());
            }
        }
    }
}
