package com.jplearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlockUserRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    private String reason;
}

