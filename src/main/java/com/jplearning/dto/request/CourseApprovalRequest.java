package com.jplearning.dto.request;

import com.jplearning.entity.Course;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseApprovalRequest {
    @NotNull(message = "Status is required")
    private Course.Status status;

    private String feedback;
}