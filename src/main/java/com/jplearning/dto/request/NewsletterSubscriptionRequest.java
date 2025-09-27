package com.jplearning.dto.request;

import com.jplearning.entity.Newsletter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class NewsletterSubscriptionRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Size(max = 5, message = "Preferred language must not exceed 5 characters")
    private String preferredLanguage = "vi";

    private Set<Newsletter.Interest> interests;
} 