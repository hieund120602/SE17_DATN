package com.jplearning.config;

import com.jplearning.service.NewsletterService;
import com.jplearning.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ScheduledTasks {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NewsletterService newsletterService;

    /**
     * Clean up old read notifications every day at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldNotifications() {
        try {
            log.info("Starting cleanup of old notifications...");
            notificationService.cleanupOldNotifications();
            log.info("Cleanup of old notifications completed successfully");
        } catch (Exception e) {
            log.error("Error during notification cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up expired unverified newsletter subscriptions every day at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredNewsletterSubscriptions() {
        try {
            log.info("Starting cleanup of expired newsletter subscriptions...");
            newsletterService.cleanupExpiredSubscriptions();
            log.info("Cleanup of expired newsletter subscriptions completed successfully");
        } catch (Exception e) {
            log.error("Error during newsletter cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Log system statistics every day at midnight
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void logSystemStatistics() {
        try {
            log.info("Logging daily system statistics...");
            Long activeSubscribers = newsletterService.getActiveSubscriberCount();
            log.info("Active newsletter subscribers: {}", activeSubscribers);
            log.info("Daily system statistics logged successfully");
        } catch (Exception e) {
            log.error("Error during statistics logging: {}", e.getMessage(), e);
        }
    }
} 