package com.jplearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WebSpeechSubmissionRequest {
    @NotBlank(message = "Recognized text is required")
    private String recognizedText;

    private Double confidence;

    private Long duration; // in milliseconds

    private String language = "ja-JP";

    private Boolean isFinal = true;

    private String audioData; // Base64 encoded audio data (optional)

    private String sessionId; // For tracking session

    private Long startTime;

    private Long endTime;

    private String userAgent; // Browser information

    private String deviceType; // mobile, desktop, etc.
} 