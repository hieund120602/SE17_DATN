package com.jplearning.dto.request;

import com.jplearning.entity.SpeechPractice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpeechPracticeRequest {
    @NotBlank(message = "Target text is required")
    private String targetText;

    private String targetAudioUrl;

    @NotNull(message = "Practice type is required")
    private SpeechPractice.PracticeType type;
}