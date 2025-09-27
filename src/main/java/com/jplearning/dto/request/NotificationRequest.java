package com.jplearning.dto.request;

import com.jplearning.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NotificationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    @NotNull(message = "Notification type is required")
    private Notification.NotificationType type;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String actionUrl;

    @Size(max = 100, message = "Action text must not exceed 100 characters")
    private String actionText;
} 