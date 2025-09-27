package com.jplearning.dto.response;

import com.jplearning.entity.SpeechPractice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechPracticeResponse {
    private Long id;
    private String targetText;
    private String targetAudioUrl;
    private String studentAudioUrl;
    private String recognizedText;
    private Double accuracyScore;
    private String pronunciationFeedback;
    private SpeechPractice.PracticeType type;
    private StudentBriefResponse student;
    private Long lessonId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isCompleted;
}