package com.jplearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LevelRequest {
    @NotBlank(message = "Level name is required")
    @Size(min = 2, max = 50, message = "Level name must be between 2 and 50 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;
}