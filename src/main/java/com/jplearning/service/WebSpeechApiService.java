package com.jplearning.service;

import com.jplearning.dto.request.WebSpeechExerciseRequest;
import com.jplearning.dto.request.WebSpeechSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResponse;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.dto.response.WebSpeechConfigResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface WebSpeechApiService {
    
    /**
     * Get Web Speech API configuration
     */
    WebSpeechConfigResponse getWebSpeechConfig();

    /**
     * Start a speech exercise session
     */
    Map<String, Object> startExerciseSession(Long exerciseId, Long studentId);

    /**
     * Submit Web Speech API result
     */
    SpeechExerciseResultResponse submitWebSpeechResult(Long exerciseId, WebSpeechSubmissionRequest request, Long studentId);

    /**
     * Submit with audio blob
     */
    SpeechExerciseResultResponse submitWithAudioBlob(Long exerciseId, MultipartFile audioBlob, 
                                                    String recognizedText, Double confidence, 
                                                    Long duration, Long studentId) throws IOException;

    /**
     * Create listening exercise with Web Speech API
     */
    SpeechExerciseResponse createListeningExercise(WebSpeechExerciseRequest request, Long tutorId);

    /**
     * Create speaking exercise with Web Speech API
     */
    SpeechExerciseResponse createSpeakingExercise(WebSpeechExerciseRequest request, Long tutorId);

    /**
     * Get pronunciation patterns
     */
    List<Map<String, Object>> getPronunciationPatterns();

    /**
     * Validate pronunciation
     */
    Map<String, Object> validatePronunciation(String targetText, String recognizedText);

    /**
     * Get supported languages
     */
    List<Map<String, Object>> getSupportedLanguages();
} 