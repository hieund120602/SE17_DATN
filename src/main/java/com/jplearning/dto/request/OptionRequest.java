package com.jplearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OptionRequest {
    @NotBlank(message = "Option content is required")
    private String content;

    @NotNull(message = "Option correctness status is required")
    private Boolean correct;
}