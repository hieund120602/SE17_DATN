package com.jplearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExperienceRequest {
    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Position is required")
    private String position;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean isCurrent;

    private String description;
}