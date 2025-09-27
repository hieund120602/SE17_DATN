package com.jplearning.dto.response;

import com.jplearning.entity.Course;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class CourseDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Integer durationInMinutes;
    private LevelResponse level;
    private Integer lessonCount;
    private String courseOverview;
    private String courseContent;
    private BigDecimal price;
    private String thumbnailUrl;
    private String includesDescription;
    private TutorBriefResponse tutor;
    private Course.Status status;
    private Integer countBuy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ModulePreviewResponse> modules = new ArrayList<>();
    private boolean enrolled;

    public CourseDetailResponse(CourseResponse course, boolean isEnrolled) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.durationInMinutes = course.getDurationInMinutes();
        this.level = course.getLevel();
        this.lessonCount = course.getLessonCount();
        this.courseOverview = course.getCourseOverview();
        this.courseContent = course.getCourseContent();
        this.price = course.getPrice();
        this.thumbnailUrl = course.getThumbnailUrl();
        this.includesDescription = course.getIncludesDescription();
        this.tutor = course.getTutor();
        this.status = course.getStatus();
        this.countBuy = course.getCountBuy();
        this.createdAt = course.getCreatedAt();
        this.updatedAt = course.getUpdatedAt();
        this.enrolled = isEnrolled;

        // Xử lý module dựa trên trạng thái đăng ký
        if (course.getModules() != null) {
            if (isEnrolled) {
                // If enrolled, show full module content
                this.modules = course.getModules().stream()
                        .map(module -> new ModulePreviewResponse(module, true))
                        .collect(Collectors.toList());
            } else {
                // If not enrolled, show preview only
                this.modules = course.getModules().stream()
                        .map(module -> new ModulePreviewResponse(module, false))
                        .collect(Collectors.toList());
            }
        }
    }
}