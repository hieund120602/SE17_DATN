package com.jplearning.controller;

import com.jplearning.dto.request.SpeechPracticeRequest;
import com.jplearning.dto.response.SpeechPracticeResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.SpeechPracticeService;
import com.jplearning.service.impl.SpeechPracticeServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/speech-practice")
@Tag(name = "Speech Practice", description = "Japanese speech practice API with Web Speech API support")
@CrossOrigin(origins = "*")
public class SpeechPracticeController {

    @Autowired
    private SpeechPracticeService speechPracticeService;

    @Autowired
    private SpeechPracticeServiceImpl speechPracticeServiceImpl;

    @PostMapping
    @Operation(
            summary = "Create new practice",
            description = "Create a new speech practice session",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechPracticeResponse> createPractice(
            @Valid @RequestBody SpeechPracticeRequest request,
            @RequestParam(required = false) Long lessonId) {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(speechPracticeService.createPractice(studentId, lessonId, request));
    }

    @PostMapping(value = "/{practiceId}/submit-audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Submit practice audio",
            description = "Submit audio recording for storage (recognition done on frontend)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechPracticeResponse> submitPracticeAudio(
            @PathVariable Long practiceId,
            @RequestParam("audio") MultipartFile audioFile) {
        try {
            return ResponseEntity.ok(speechPracticeService.submitPracticeAudio(practiceId, audioFile));
        } catch (IOException e) {
            throw new BadRequestException("Failed to process audio: " + e.getMessage());
        }
    }

    @PostMapping("/{practiceId}/submit-recognition")
    @Operation(
            summary = "Submit recognition result",
            description = "Submit speech recognition result from Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechPracticeResponse> submitRecognitionResult(
            @PathVariable Long practiceId,
            @RequestBody Map<String, String> request) {
        try {
            String recognizedText = request.get("recognizedText");
            if (recognizedText == null || recognizedText.trim().isEmpty()) {
                throw new BadRequestException("Recognized text is required");
            }

            return ResponseEntity.ok(speechPracticeServiceImpl.submitRecognitionResult(practiceId, recognizedText));
        } catch (IOException e) {
            throw new BadRequestException("Failed to process recognition result: " + e.getMessage());
        }
    }

    @PostMapping("/{practiceId}/submit-complete")
    @Operation(
            summary = "Submit complete practice",
            description = "Submit both audio and recognition result in one request",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechPracticeResponse> submitCompletePractice(
            @PathVariable Long practiceId,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam("recognizedText") String recognizedText) {
        try {
            // First submit the audio
            speechPracticeService.submitPracticeAudio(practiceId, audioFile);

            // Then submit the recognition result
            return ResponseEntity.ok(speechPracticeServiceImpl.submitRecognitionResult(practiceId, recognizedText));
        } catch (IOException e) {
            throw new BadRequestException("Failed to process complete practice: " + e.getMessage());
        }
    }

    @GetMapping("/{practiceId}")
    @Operation(
            summary = "Get practice details",
            description = "Get details of a specific practice session",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<SpeechPracticeResponse> getPracticeById(@PathVariable Long practiceId) {
        return ResponseEntity.ok(speechPracticeService.getPracticeById(practiceId));
    }

    @GetMapping("/student/{studentId}")
    @Operation(
            summary = "Get student practices",
            description = "Get all practice sessions for a student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<SpeechPracticeResponse>> getStudentPractices(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(speechPracticeService.getStudentPractices(studentId, pageable));
    }

    @GetMapping("/my-practices")
    @Operation(
            summary = "Get current user practices",
            description = "Get practice sessions for the current authenticated student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<SpeechPracticeResponse>> getMyPractices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Long studentId = getCurrentUserId();
        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(speechPracticeService.getStudentPractices(studentId, pageable));
    }

    @GetMapping("/my-recent-practices")
    @Operation(
            summary = "Get recent practices",
            description = "Get recent practice sessions for the current authenticated student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SpeechPracticeResponse>> getMyRecentPractices() {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(speechPracticeService.getRecentPractices(studentId));
    }

    @GetMapping("/web-speech-config")
    @Operation(
            summary = "Get Web Speech API configuration",
            description = "Get configuration for Web Speech API usage",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getWebSpeechConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("supportedLanguages", List.of("ja-JP", "en-US"));
        config.put("defaultLanguage", "ja-JP");
        config.put("maxRecordingTime", 30); // seconds
        config.put("audioFormat", "webm");
        config.put("continuous", false);
        config.put("interimResults", true);
        config.put("maxAlternatives", 1);
        config.put("instructions", Map.of(
                "en", "Click the microphone button to start recording. Speak clearly and at a normal pace.",
                "ja", "マイクボタンをクリックして録音を開始してください。はっきりと通常のペースで話してください。"
        ));
        return ResponseEntity.ok(config);
    }

    @PostMapping("/web-speech-submit")
    @Operation(
            summary = "Submit Web Speech API result",
            description = "Submit speech recognition result from Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitWebSpeechResult(
            @RequestBody Map<String, Object> request) {
        
        String targetText = (String) request.get("targetText");
        String recognizedText = (String) request.get("recognizedText");
        Double confidence = request.get("confidence") != null ? 
            Double.valueOf(request.get("confidence").toString()) : 0.0;
        
        if (targetText == null || recognizedText == null) {
            throw new BadRequestException("Target text and recognized text are required");
        }
        
        // Calculate simple accuracy
        double accuracy = calculateSimpleAccuracy(targetText, recognizedText);
        boolean passed = accuracy >= 70.0;
        
        Map<String, Object> result = new HashMap<>();
        result.put("accuracy", accuracy);
        result.put("confidence", confidence);
        result.put("passed", passed);
        result.put("feedback", generateFeedback(accuracy));
        result.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pronunciation-patterns")
    @Operation(
            summary = "Get Japanese pronunciation patterns",
            description = "Get common Japanese pronunciation patterns for practice",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getPronunciationPatterns() {
        List<Map<String, Object>> patterns = List.of(
            Map.of("japanese", "あ", "romaji", "a", "tip", "Open mouth wide, tongue low"),
            Map.of("japanese", "い", "romaji", "i", "tip", "Lips slightly spread, tongue high"),
            Map.of("japanese", "う", "romaji", "u", "tip", "Lips slightly rounded, tongue back"),
            Map.of("japanese", "え", "romaji", "e", "tip", "Mouth half-open, tongue mid"),
            Map.of("japanese", "お", "romaji", "o", "tip", "Lips rounded, tongue back"),
            Map.of("japanese", "こんにちは", "romaji", "konnichiwa", "tip", "Hello - stress on 'ni'"),
            Map.of("japanese", "ありがとう", "romaji", "arigatou", "tip", "Thank you - stress on 'ga'"),
            Map.of("japanese", "おはよう", "romaji", "ohayou", "tip", "Good morning - stress on 'ha'")
        );
        
        return ResponseEntity.ok(patterns);
    }

    // Helper methods for Web Speech API
    private double calculateSimpleAccuracy(String target, String recognized) {
        if (target == null || recognized == null) return 0.0;
        if (target.equals(recognized)) return 100.0;
        
        // Simple Levenshtein distance based accuracy
        int distance = levenshteinDistance(target.toLowerCase(), recognized.toLowerCase());
        int maxLength = Math.max(target.length(), recognized.length());
        if (maxLength == 0) return 100.0;
        
        return Math.max(0, (1.0 - (double) distance / maxLength) * 100);
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    int cost = (s1.charAt(i - 1) != s2.charAt(j - 1)) ? 1 : 0;
                    dp[i][j] = Math.min(
                            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                            dp[i - 1][j - 1] + cost
                    );
                }
            }
        }

        return dp[s1.length()][s2.length()];
    }

    private String generateFeedback(double accuracy) {
        if (accuracy >= 90) {
            return "Excellent pronunciation! Keep up the great work!";
        } else if (accuracy >= 80) {
            return "Very good pronunciation! Minor improvements needed.";
        } else if (accuracy >= 70) {
            return "Good pronunciation! Continue practicing for better results.";
        } else if (accuracy >= 60) {
            return "Fair pronunciation. Focus on clarity and pacing.";
        } else {
            return "Keep practicing! Try speaking more slowly and clearly.";
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}