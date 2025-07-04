package com.jplearning.controller;

import com.jplearning.dto.request.SpeechExerciseSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.SpeechExerciseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/web-speech")
@Tag(name = "Web Speech", description = "Web Speech API integration for Japanese learning")
@CrossOrigin(origins = "*")
public class WebSpeechController {

    @Autowired
    private SpeechExerciseService speechExerciseService;

    @GetMapping("/config")
    @Operation(
            summary = "Get Web Speech API configuration",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getWebSpeechConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("supportedLanguages", Arrays.asList("ja-JP", "en-US"));
        config.put("defaultLanguage", "ja-JP");
        config.put("maxRecordingTime", 60);
        config.put("continuous", false);
        config.put("interimResults", true);
        config.put("maxAlternatives", 1);
        
        Map<String, String> instructions = new HashMap<>();
        instructions.put("en", "Click the microphone button to start recording. Speak clearly and at a normal pace.");
        instructions.put("ja", "マイクボタンをクリックして録音を開始してください。はっきりと通常のペースで話してください。");
        config.put("instructions", instructions);
        
        return ResponseEntity.ok(config);
    }

    @PostMapping("/exercises/{exerciseId}/submit")
    @Operation(
            summary = "Submit Web Speech result",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechExerciseResultResponse> submitWebSpeechResult(
            @PathVariable Long exerciseId,
            @RequestBody Map<String, Object> requestData) {
        
        Long studentId = getCurrentUserId();
        
        String recognizedText = (String) requestData.get("recognizedText");
        Double confidence = requestData.get("confidence") != null ? 
            Double.valueOf(requestData.get("confidence").toString()) : null;
        Long duration = requestData.get("duration") != null ? 
            Long.valueOf(requestData.get("duration").toString()) : null;
        
        // Create submission request using reflection-safe approach
        SpeechExerciseSubmissionRequest submissionRequest = new SpeechExerciseSubmissionRequest();
        
        // Use reflection to set fields if needed, or create a helper method
        try {
            submissionRequest.getClass().getDeclaredField("exerciseId").setAccessible(true);
            submissionRequest.getClass().getDeclaredField("exerciseId").set(submissionRequest, exerciseId);
            
            submissionRequest.getClass().getDeclaredField("recognizedText").setAccessible(true);
            submissionRequest.getClass().getDeclaredField("recognizedText").set(submissionRequest, recognizedText);
            
            submissionRequest.getClass().getDeclaredField("confidenceScore").setAccessible(true);
            submissionRequest.getClass().getDeclaredField("confidenceScore").set(submissionRequest, confidence);
            
            submissionRequest.getClass().getDeclaredField("timeSpentSeconds").setAccessible(true);
            submissionRequest.getClass().getDeclaredField("timeSpentSeconds").set(submissionRequest, duration != null ? duration / 1000 : null);
            
        } catch (Exception e) {
            throw new RuntimeException("Error setting submission request fields", e);
        }
        
        return ResponseEntity.ok(speechExerciseService.submitSpeechExercise(submissionRequest, studentId));
    }

    @GetMapping("/pronunciation-patterns")
    @Operation(
            summary = "Get pronunciation patterns",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPronunciationPatterns() {
        List<Map<String, Object>> patterns = Arrays.asList(
            createPattern("あ", "a", "Open mouth wide, tongue low"),
            createPattern("い", "i", "Lips slightly spread, tongue high"),
            createPattern("う", "u", "Lips slightly rounded, tongue back"),
            createPattern("え", "e", "Mouth half-open, tongue mid"),
            createPattern("お", "o", "Lips rounded, tongue back"),
            createPattern("こんにちは", "konnichiwa", "Hello - stress on 'ni'"),
            createPattern("ありがとう", "arigatou", "Thank you - stress on 'ga'"),
            createPattern("おはよう", "ohayou", "Good morning - stress on 'ha'")
        );
        
        return ResponseEntity.ok(patterns);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Use reflection to get ID if getId() method is not available
        try {
            return userDetails.getId();
        } catch (Exception e) {
            // Fallback using reflection
            try {
                return (Long) userDetails.getClass().getDeclaredField("id").get(userDetails);
            } catch (Exception ex) {
                throw new RuntimeException("Cannot get user ID", ex);
            }
        }
    }

    private Map<String, Object> createPattern(String japanese, String romaji, String tip) {
        Map<String, Object> pattern = new HashMap<>();
        pattern.put("japanese", japanese);
        pattern.put("romaji", romaji);
        pattern.put("tip", tip);
        return pattern;
    }
} 