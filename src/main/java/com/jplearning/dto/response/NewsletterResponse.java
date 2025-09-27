package com.jplearning.dto.response;

import com.jplearning.entity.Newsletter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterResponse {

    private Long id;
    private String email;
    private String fullName;
    private Boolean isActive;
    private Boolean isVerified;
    private String preferredLanguage;
    private Set<Newsletter.Interest> interests;
    private LocalDateTime subscribedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime unsubscribedAt;
} 