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
class LessonPreviewResponse {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private Integer durationInMinutes;
    private String content;
    private Integer position;
    private List<ResourceResponse> resources;
    private List<ExercisePreviewResponse> exercises;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean locked = false;

    public LessonPreviewResponse(LessonResponse lesson, boolean showFullContent) {
        this.id = lesson.getId();
        this.title = lesson.getTitle();
        this.durationInMinutes = lesson.getDurationInMinutes();
        this.position = lesson.getPosition();
        this.createdAt = lesson.getCreatedAt();
        this.updatedAt = lesson.getUpdatedAt();

        if (showFullContent) {
            // Hiển thị toàn bộ thông tin bài học
            this.description = lesson.getDescription();
            this.videoUrl = lesson.getVideoUrl();
            this.content = lesson.getContent();
            this.resources = lesson.getResources();
            this.locked = false;

            // Hiển thị bài tập với đáp án
            if (lesson.getExercises() != null) {
                this.exercises = lesson.getExercises().stream()
                        .map(exercise -> new ExercisePreviewResponse(exercise, true))
                        .collect(Collectors.toList());
            }
        } else {
            // Chỉ hiển thị mô tả, không hiển thị nội dung đầy đủ
            this.description = lesson.getDescription();
            this.content = null; // Không hiển thị nội dung chi tiết
            this.videoUrl = null; // Không hiển thị video
            this.resources = null; // Không hiển thị tài liệu
            this.locked = false; // Bài đầu tiên không khóa

            // Hiển thị bài tập nhưng không có đáp án
            if (lesson.getExercises() != null) {
                this.exercises = lesson.getExercises().stream()
                        .map(exercise -> new ExercisePreviewResponse(exercise, false))
                        .collect(Collectors.toList());
            }
        }
    }
}
