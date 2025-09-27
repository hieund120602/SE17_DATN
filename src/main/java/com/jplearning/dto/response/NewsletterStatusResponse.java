package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterStatusResponse {

    private Boolean isSubscribed;
    private Boolean isVerified;
    private String status; // "SUBSCRIBED", "UNSUBSCRIBED", "PENDING_VERIFICATION"
    private String message;
} 