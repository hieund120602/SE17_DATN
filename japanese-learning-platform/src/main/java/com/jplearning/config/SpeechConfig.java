package com.jplearning.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "speech")
@Data
public class SpeechConfig {
    private String speechnoteApiKey;
    private String speechnoteEndpoint;
    private String geminiApiKey;
    private String geminiEndpoint;
}