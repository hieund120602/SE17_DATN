package com.jplearning.dto.response;

import com.jplearning.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
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
    private List<ModuleResponse> modules;

    @Builder.Default
    private boolean enrolled = false;
}