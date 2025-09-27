package com.jplearning.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ListeningExerciseRequest {
    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Level is required")
    private String level;

    @Min(value = 1, message = "Question count must be at least 1")
    private int questionCount = 3;

    private String additionalInstructions;

    @NotNull(message = "Audio type is required")
    private AudioType audioType = AudioType.CONVERSATION;

    public enum AudioType {
        WORD_PRONUNCIATION, SENTENCE, CONVERSATION
    }
}