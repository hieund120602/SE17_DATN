package com.jplearning.service;

import com.jplearning.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    /**
     * Create notification for a specific user
     * @param userId ID of the user to notify
     * @param title Notification title
     * @param message Notification message
     * @param type Notification type
     * @param actionUrl Optional action URL
     * @param actionText Optional action text
     */
    void createNotification(Long userId, String title, String message, 
                           com.jplearning.entity.Notification.NotificationType type, 
                           String actionUrl, String actionText);

    /**
     * Create notification for all tutors
     * @param title Notification title
     * @param message Notification message
     * @param type Notification type
     * @param actionUrl Optional action URL
     * @param actionText Optional action text
     */
    void createNotificationForAllTutors(String title, String message, 
                                       com.jplearning.entity.Notification.NotificationType type, 
                                       String actionUrl, String actionText);

    /**
     * Get notifications for a user
     * @param userId ID of the user
     * @param pageable Pagination information
     * @return Page of notification responses
     */
    Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);

    /**
     * Mark notification as read
     * @param notificationId ID of the notification
     * @param userId ID of the user
     */
    void markNotificationAsRead(Long notificationId, Long userId);

    /**
     * Mark all notifications as read for a user
     * @param userId ID of the user
     */
    void markAllNotificationsAsRead(Long userId);

    /**
     * Get unread notification count for a user
     * @param userId ID of the user
     * @return Count of unread notifications
     */
    long getUnreadNotificationCount(Long userId);

    /**
     * Clean up old read notifications (scheduled task)
     */
    void cleanupOldNotifications();
} 