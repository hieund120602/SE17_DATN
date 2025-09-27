package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedListeningExerciseResponse {
    private String title;
    private String description;
    private String audioUrl;
    private String japaneseScript;
    private String englishTranslation;
    private List<GeneratedQuestionResponse> questions;
    private String promptUsed;
}