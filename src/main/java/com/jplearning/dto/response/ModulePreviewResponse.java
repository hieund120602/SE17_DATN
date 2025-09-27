package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
class ModulePreviewResponse {
    private Long id;
    private String title;
    private Integer durationInMinutes;
    private Integer position;
    private List<LessonPreviewResponse> lessons = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ModulePreviewResponse(ModuleResponse module, boolean showFullContent) {
        this.id = module.getId();
        this.title = module.getTitle();
        this.durationInMinutes = module.getDurationInMinutes();
        this.position = module.getPosition();
        this.createdAt = module.getCreatedAt();
        this.updatedAt = module.getUpdatedAt();

        if (module.getLessons() != null) {
            if (showFullContent) {
                // Hiển thị toàn bộ thông tin bài học
                this.lessons = module.getLessons().stream()
                        .map(lesson -> new LessonPreviewResponse(lesson, true))
                        .collect(Collectors.toList());
            } else {
                // Chỉ hiển thị thông tin cơ bản và bài đầu tiên
                if (!module.getLessons().isEmpty()) {
                    // Bài học đầu tiên hiển thị mô tả nhưng không hiển thị nội dung
                    LessonResponse firstLesson = module.getLessons().get(0);
                    this.lessons.add(new LessonPreviewResponse(firstLesson, false));

                    // Các bài học còn lại chỉ hiển thị tiêu đề
                    if (module.getLessons().size() > 1) {
                        for (int i = 1; i < module.getLessons().size(); i++) {
                            LessonResponse lesson = module.getLessons().get(i);
                            LessonPreviewResponse preview = new LessonPreviewResponse();
                            preview.setId(lesson.getId());
                            preview.setTitle(lesson.getTitle());
                            preview.setDurationInMinutes(lesson.getDurationInMinutes());
                            preview.setPosition(lesson.getPosition());
                            preview.setLocked(true);
                            this.lessons.add(preview);
                        }
                    }
                }
            }
        }
    }
}
