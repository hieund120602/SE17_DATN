package com.jplearning.controller;

import com.jplearning.service.TutorEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestEmailController {

    @Autowired
    private TutorEmailService tutorEmailService;

    @PostMapping("/send-tutor-welcome")
    public ResponseEntity<String> sendTutorWelcomeEmail(
            @RequestParam String email,
            @RequestParam String fullName
    ) {
        try {
            tutorEmailService.sendWelcomeEmail(email, fullName);
            return ResponseEntity.ok("Welcome email sent successfully to: " + email);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/send-tutor-status")
    public ResponseEntity<String> sendTutorStatusEmail(
            @RequestParam String email,
            @RequestParam String fullName,
            @RequestParam String status,
            @RequestParam(required = false) String reason
    ) {
        try {
            tutorEmailService.sendApplicationStatusEmail(email, fullName, status, reason);
            return ResponseEntity.ok("Status email sent successfully to: " + email);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }
}

