package com.jplearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "speech_practices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechPractice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String targetText;

    @Column(name = "target_audio_url")
    private String targetAudioUrl;

    @Column(name = "student_audio_url")
    private String studentAudioUrl;

    @Column(name = "recognized_text")
    private String recognizedText;

    @Column(name = "accuracy_score")
    private Double accuracyScore;

    @Column(name = "pronunciation_feedback", columnDefinition = "TEXT")
    private String pronunciationFeedback;

    @Enumerated(EnumType.STRING)
    private PracticeType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PracticeType {
        VOCABULARY, SENTENCE, CONVERSATION
    }
}