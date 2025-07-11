package com.jplearning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CourseRequest {
    @NotBlank(message = "Course title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must be less than 5000 characters")
    private String description;

//    private Integer durationInMinutes;

    @NotNull(message = "Level ID is required")
    private Long levelId;

    @Size(max = 5000, message = "Course overview must be less than 5000 characters")
    private String courseOverview;

    @Size(max = 5000, message = "Course content must be less than 5000 characters")
    private String courseContent;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be greater than or equal to 0")
    private BigDecimal price;

    private String thumbnailUrl;

    private String includesDescription;

    @Valid
    private List<ModuleRequest> modules;
}