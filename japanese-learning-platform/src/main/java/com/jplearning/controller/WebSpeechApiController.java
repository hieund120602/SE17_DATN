package com.jplearning.controller;

import com.jplearning.dto.request.WebSpeechExerciseRequest;
import com.jplearning.dto.request.WebSpeechSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResponse;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.dto.response.WebSpeechConfigResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.WebSpeechApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/web-speech-api")
@Tag(name = "Web Speech API", description = "Web Speech API integration for Japanese learning")
@CrossOrigin(origins = "*")
public class WebSpeechApiController {

    @Autowired
    private WebSpeechApiService webSpeechApiService;

    @GetMapping("/config")
    @Operation(
            summary = "Get Web Speech API configuration",
            description = "Get configuration settings for Web Speech API usage"
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<WebSpeechConfigResponse> getWebSpeechConfig() {
        return ResponseEntity.ok(webSpeechApiService.getWebSpeechConfig());
    }

    @PostMapping("/exercises/{exerciseId}/submit-web-speech")
    @Operation(
            summary = "Submit Web Speech API result"
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechExerciseResultResponse> submitWebSpeechResult(
            @PathVariable Long exerciseId,
            @Valid @RequestBody WebSpeechSubmissionRequest request) {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(webSpeechApiService.submitWebSpeechResult(exerciseId, request, studentId));
    }

    @PostMapping("/exercises/{exerciseId}/start-session")
    @Operation(
            summary = "Start speech exercise session",
            description = "Initialize a new speech exercise session with Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> startExerciseSession(
            @PathVariable Long exerciseId) {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(webSpeechApiService.startExerciseSession(exerciseId, studentId));
    }

    @PostMapping(value = "/exercises/{exerciseId}/submit-with-blob", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Submit with audio blob",
            description = "Submit speech exercise with audio blob from Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechExerciseResultResponse> submitWithAudioBlob(
            @PathVariable Long exerciseId,
            @RequestParam("audioBlob") MultipartFile audioBlob,
            @RequestParam("recognizedText") String recognizedText,
            @RequestParam(value = "confidence", required = false, defaultValue = "0.0") Double confidence,
            @RequestParam(value = "duration", required = false, defaultValue = "0") Long duration) {
        try {
            Long studentId = getCurrentUserId();
            return ResponseEntity.ok(webSpeechApiService.submitWithAudioBlob(
                    exerciseId, audioBlob, recognizedText, confidence, duration, studentId));
        } catch (IOException e) {
            throw new BadRequestException("Failed to process audio blob: " + e.getMessage());
        }
    }

    @PostMapping("/create-listening-exercise")
    @Operation(
            summary = "Create listening exercise with Web Speech",
            description = "Create a new listening exercise integrated with Web Speech API (tutor only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SpeechExerciseResponse> createListeningExercise(
            @Valid @RequestBody WebSpeechExerciseRequest request) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(webSpeechApiService.createListeningExercise(request, tutorId));
    }

    @PostMapping("/create-speaking-exercise")
    @Operation(
            summary = "Create speaking exercise with Web Speech",
            description = "Create a new speaking exercise integrated with Web Speech API (tutor only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SpeechExerciseResponse> createSpeakingExercise(
            @Valid @RequestBody WebSpeechExerciseRequest request) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(webSpeechApiService.createSpeakingExercise(request, tutorId));
    }

    @GetMapping("/pronunciation-patterns")
    @Operation(
            summary = "Get pronunciation patterns",
            description = "Get common Japanese pronunciation patterns for Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPronunciationPatterns() {
        return ResponseEntity.ok(webSpeechApiService.getPronunciationPatterns());
    }

    @PostMapping("/validate-pronunciation")
    @Operation(
            summary = "Validate pronunciation",
            description = "Validate pronunciation against target text using Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> validatePronunciation(
            @RequestBody Map<String, String> request) {
        String targetText = request.get("targetText");
        String recognizedText = request.get("recognizedText");
        
        if (targetText == null || recognizedText == null) {
            throw new BadRequestException("Target text and recognized text are required");
        }
        
        return ResponseEntity.ok(webSpeechApiService.validatePronunciation(targetText, recognizedText));
    }

    @GetMapping("/supported-languages")
    @Operation(
            summary = "Get supported languages",
            description = "Get list of supported languages for Web Speech API",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getSupportedLanguages() {
        return ResponseEntity.ok(webSpeechApiService.getSupportedLanguages());
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
} 