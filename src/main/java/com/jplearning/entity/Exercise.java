package com.jplearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    // Thêm fields cho speech exercises
    @Column(name = "target_text")
    private String targetText; // Văn bản mục tiêu cho bài tập nói

    @Column(name = "target_audio_url")
    private String targetAudioUrl; // URL audio mẫu

    @Column(name = "difficulty_level")
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;

    @Column(name = "speech_recognition_language")
    private String speechRecognitionLanguage = "ja-JP"; // Ngôn ngữ nhận dạng

    @Column(name = "minimum_accuracy_score")
    private Integer minimumAccuracyScore = 70; // Điểm tối thiểu để pass

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ExerciseType {
        MULTIPLE_CHOICE,      // Trắc nghiệm
        FILL_IN_BLANK,       // Điền vào chỗ trống
        LISTENING,           // Bài tập nghe
        SPEAKING,            // Bài tập nói
        WRITING,             // Bài tập viết
        MATCHING,            // Nối từ
        SPEECH_RECOGNITION,  // Nhận dạng giọng nói
        PRONUNCIATION       // Luyện phát âm
    }

    public enum DifficultyLevel {
        BEGINNER,    // Sơ cấp
        ELEMENTARY,  // Cơ bản
        INTERMEDIATE, // Trung cấp
        ADVANCED,    // Nâng cao
        EXPERT      // Chuyên gia
    }
}