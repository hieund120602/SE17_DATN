package com.jplearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "speech_exercise_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechExerciseResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "target_text", nullable = false)
    private String targetText;

    @Column(name = "recognized_text")
    private String recognizedText;

    @Column(name = "student_audio_url")
    private String studentAudioUrl;

    @Column(name = "accuracy_score")
    private Double accuracyScore; // Từ 0.0 đến 100.0

    @Column(name = "confidence_score")
    private Double confidenceScore; // Từ 0.0 đến 1.0

    @Column(name = "pronunciation_feedback", columnDefinition = "TEXT")
    private String pronunciationFeedback;

    @Column(name = "is_passed")
    private Boolean isPassed;

    @Column(name = "attempt_number")
    private Integer attemptNumber = 1;

    @Column(name = "time_spent_seconds")
    private Long timeSpentSeconds;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}