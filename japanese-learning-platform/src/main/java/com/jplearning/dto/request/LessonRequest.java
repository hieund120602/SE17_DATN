package com.jplearning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class LessonRequest {
    @NotBlank(message = "Lesson title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    private String videoUrl;

    private Integer durationInMinutes;

    @Size(max = 10000, message = "Content must be less than 10000 characters")
    private String content;

    @NotNull(message = "Lesson position is required")
    private Integer position;

    @Valid
    private List<ResourceRequest> resources;

    @Valid
    private List<ExerciseRequest> exercises;
}