package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSpeechConfigResponse {
    private List<String> supportedLanguages;
    private String defaultLanguage;
    private Integer maxRecordingTime; // seconds
    private String audioFormat;
    private Map<String, String> instructions;
    private Map<String, Object> apiSettings;
    private Map<String, Object> grammarRules;
    private List<Map<String, Object>> pronunciationPatterns;
    private Map<String, Object> errorMessages;
    private Boolean enableContinuous;
    private Boolean enableInterimResults;
    private Integer maxAlternatives;
    private Double confidenceThreshold;
    private Map<String, Object> japanesePhonetics;
} 