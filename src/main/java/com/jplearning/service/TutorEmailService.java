package com.jplearning.service;

public interface TutorEmailService {
    /**
     * Send welcome email to newly registered tutor
     * @param email tutor email address
     * @param fullName tutor full name
     */
    void sendWelcomeEmail(String email, String fullName);
    
    /**
     * Send application status update email
     * @param email tutor email address
     * @param fullName tutor full name
     * @param status application status (approved/rejected)
     * @param reason reason for rejection (if applicable)
     */
    void sendApplicationStatusEmail(String email, String fullName, String status, String reason);
}

