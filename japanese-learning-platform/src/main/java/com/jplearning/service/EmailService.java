package com.jplearning.service;

public interface EmailService {
    /**
     * Send an email
     * @param to recipient email address
     * @param subject email subject
     * @param text email body
     */
    void sendEmail(String to, String subject, String text);

    /**
     * Send a password reset email
     * @param to recipient email address
     * @param token reset token
     */
    void sendPasswordResetEmail(String to, String token);

    /**
     * Send an email verification email
     * @param to recipient email address
     * @param token verification token
     */
    void sendVerificationEmail(String to, String token);
}