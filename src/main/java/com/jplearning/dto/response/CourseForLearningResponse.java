package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseForLearningResponse {
    private Long id;
    private String title;
    private String description;
    private Integer durationInMinutes;
    private String level; // Changed from Object to String
    private String courseOverview;
    private String courseContent;
    private String thumbnailUrl;
    private TutorBriefResponse tutor;
    private Integer countBuy;

    // Enrollment info
    private Long enrollmentId;
    private Integer progressPercentage;
    private Integer completedLessons;
    private Long lastAccessedLessonId;
    private boolean isCompleted;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    // Module and lesson details
    private List<ModuleForLearningResponse> modules;
}