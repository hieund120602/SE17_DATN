package com.jplearning.dto.response;

import com.jplearning.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class AiGenerationResponses {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedExerciseResponse {
        private String title;
        private String description;
        private Exercise.ExerciseType type;
        private List<GeneratedQuestionResponse> questions;
        private String promptUsed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedQuestionResponse {
        private String content;
        private String hint;
        private String correctAnswer;
        private String answerExplanation;
        private List<Map<String, Object>> options; // For multiple choice: {content: String, correct: Boolean}
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedListeningExerciseResponse {
        private String title;
        private String description;
        private String audioUrl;
        private String japaneseScript;
        private String englishTranslation;
        private List<GeneratedQuestionResponse> questions;
        private String promptUsed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedContentResponse {
        private String title;
        private String overview;
        private String content;
        private List<VocabularyItem> vocabulary;
        private List<GrammarPoint> grammarPoints;
        private String promptUsed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VocabularyItem {
        private String japanese;
        private String romaji;
        private String english;
        private String example;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrammarPoint {
        private String pattern;
        private String explanation;
        private String example;
        private String englishTranslation;
    }
}