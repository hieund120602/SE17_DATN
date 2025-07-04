package com.jplearning.service.impl;

import com.jplearning.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}", to, e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Japanese Learning Platform - Password Reset";
        String text = "Hello,\n\n"
                + "You have requested to reset your password. Please click the link below to set a new password:\n\n"
                + resetUrl + "\n\n"
                + "This link will expire in 1 hour.\n\n"
                + "If you did not request a password reset, please ignore this email.\n\n"
                + "Best regards,\n"
                + "Japanese Learning Platform Team";

        sendEmail(to, subject, text);
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Japanese Learning Platform - Email Verification";
        String text = "Hello,\n\n"
                + "Thank you for registering with Japanese Learning Platform. Please click the link below to verify your email address:\n\n"
                + verificationUrl + "\n\n"
                + "This link will expire in 24 hours.\n\n"
                + "If you did not register an account, please ignore this email.\n\n"
                + "Best regards,\n"
                + "Japanese Learning Platform Team";

        sendEmail(to, subject, text);
    }
}