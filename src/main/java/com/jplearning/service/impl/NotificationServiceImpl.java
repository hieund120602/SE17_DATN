package com.jplearning.service.impl;

import com.jplearning.dto.response.NotificationResponse;
import com.jplearning.entity.Notification;
import com.jplearning.entity.Tutor;
import com.jplearning.entity.User;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.NotificationRepository;
import com.jplearning.repository.TutorRepository;
import com.jplearning.repository.UserRepository;
import com.jplearning.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Override
    @Transactional
    public void createNotification(Long userId, String title, String message, 
                                  Notification.NotificationType type, 
                                  String actionUrl, String actionText) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(user)
                .isRead(false)
                .actionUrl(actionUrl)
                .actionText(actionText)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void createNotificationForAllTutors(String title, String message, 
                                              Notification.NotificationType type, 
                                              String actionUrl, String actionText) {
        System.out.println("=== DEBUG: createNotificationForAllTutors ===");
        System.out.println("Title: " + title);
        System.out.println("Message: " + message);
        System.out.println("Type: " + type);
        
        // Get all enabled tutors
        List<Tutor> tutors = tutorRepository.findByEnabledAndBlocked(true, false, Pageable.unpaged()).getContent();
        System.out.println("Found " + tutors.size() + " enabled tutors");
        
        for (Tutor tutor : tutors) {
            System.out.println("Creating notification for tutor: " + tutor.getFullName() + " (ID: " + tutor.getId() + ")");
            createNotification(tutor.getId(), title, message, type, actionUrl, actionText);
        }
        
        System.out.println("=== END DEBUG ===");
    }

    @Override
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::mapToNotificationResponse);
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        // Verify notification belongs to user
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllNotificationsAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    @Override
    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .actionUrl(notification.getActionUrl())
                .actionText(notification.getActionText())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }

    @Override
    @Transactional
    public void cleanupOldNotifications() {
        // Delete notifications older than 30 days that are already read
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteOldReadNotifications(cutoffDate);
    }
} 