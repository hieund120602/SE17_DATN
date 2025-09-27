package com.jplearning.service;

import com.jplearning.dto.request.NewsletterPreferencesRequest;
import com.jplearning.dto.request.NewsletterSubscriptionRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.NewsletterResponse;
import com.jplearning.dto.response.NewsletterStatusResponse;
import com.jplearning.entity.Newsletter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NewsletterService {

    /**
     * Subscribe to newsletter
     */
    MessageResponse subscribe(NewsletterSubscriptionRequest request);

    /**
     * Unsubscribe from newsletter
     */
    MessageResponse unsubscribe(String email);

    /**
     * Confirm email subscription
     */
    MessageResponse confirmSubscription(String token);

    /**
     * Update newsletter preferences
     */
    MessageResponse updatePreferences(NewsletterPreferencesRequest request);

    /**
     * Get subscription status by email
     */
    NewsletterStatusResponse getSubscriptionStatus(String email);

    /**
     * Get all active subscribers
     */
    List<NewsletterResponse> getActiveSubscribers();

    /**
     * Get subscribers by language
     */
    List<NewsletterResponse> getSubscribersByLanguage(String language);

    /**
     * Get subscribers with specific interest
     */
    List<NewsletterResponse> getSubscribersWithInterest(Newsletter.Interest interest);

    /**
     * Get newsletter subscriptions for admin (with pagination)
     */
    Page<NewsletterResponse> getAllSubscriptions(Pageable pageable);

    /**
     * Get subscription statistics
     */
    Long getActiveSubscriberCount();

    /**
     * Clean up expired unverified subscriptions
     */
    void cleanupExpiredSubscriptions();

    /**
     * Send verification email
     */
    void sendVerificationEmail(String email, String token);
} 