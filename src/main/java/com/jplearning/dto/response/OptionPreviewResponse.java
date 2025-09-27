package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
class OptionPreviewResponse {
    private Long id;
    private String content;
    private Boolean correct;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OptionPreviewResponse(OptionResponse option, boolean showCorrect) {
        this.id = option.getId();
        this.content = option.getContent();
        this.createdAt = option.getCreatedAt();
        this.updatedAt = option.getUpdatedAt();

        // Chỉ hiển thị đáp án đúng nếu học viên đã đăng ký
        this.correct = showCorrect ? option.isCorrect() : null;
    }
}
