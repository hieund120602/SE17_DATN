package com.jplearning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ModuleRequest {
    @NotBlank(message = "Module title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    private Integer durationInMinutes;

    @NotNull(message = "Module position is required")
    private Integer position;

    @Valid
    private List<LessonRequest> lessons;
}