package com.jplearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UnblockUserRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
}
