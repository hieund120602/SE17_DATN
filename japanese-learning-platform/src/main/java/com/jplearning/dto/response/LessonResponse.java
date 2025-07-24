package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LessonResponse {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private Integer durationInMinutes;
    private String content;
    private Integer position;
    private List<ResourceResponse> resources;
    private List<ExerciseResponse> exercises;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}