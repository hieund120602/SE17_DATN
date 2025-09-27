package com.jplearning.controller;

import com.jplearning.dto.request.ExerciseGenerationRequest;
import com.jplearning.dto.request.ListeningExerciseRequest;
import com.jplearning.dto.response.GeneratedContentResponse;
import com.jplearning.dto.response.GeneratedExerciseResponse;
import com.jplearning.dto.response.GeneratedListeningExerciseResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.service.AiContentGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/ai-content")
@Tag(name = "AI Content Generation", description = "AI-powered content generation for Japanese learning")
@CrossOrigin(origins = "*")
public class AiContentController {

    @Autowired
    private AiContentGenerationService aiContentService;

    @PostMapping("/exercises")
    @Operation(
            summary = "Generate exercise",
            description = "Generate Japanese language exercise content using AI",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
    public ResponseEntity<GeneratedExerciseResponse> generateExercise(
            @Valid @RequestBody ExerciseGenerationRequest request) {
        try {
            return ResponseEntity.ok(aiContentService.generateExercise(request));
        } catch (IOException e) {
            throw new BadRequestException("Failed to generate exercise: " + e.getMessage());
        }
    }

    @PostMapping("/listening-exercises")
    @Operation(
            summary = "Generate listening exercise",
            description = "Generate Japanese listening exercise with audio using AI",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
    public ResponseEntity<GeneratedListeningExerciseResponse> generateListeningExercise(
            @Valid @RequestBody ListeningExerciseRequest request) {
        try {
            return ResponseEntity.ok(aiContentService.generateListeningExercise(request));
        } catch (IOException e) {
            throw new BadRequestException("Failed to generate listening exercise: " + e.getMessage());
        }
    }

    @GetMapping("/lesson-content")
    @Operation(
            summary = "Generate lesson content",
            description = "Generate Japanese lesson content using AI",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN') or hasRole('TUTOR')")
    public ResponseEntity<GeneratedContentResponse> generateLessonContent(
            @RequestParam String topic,
            @RequestParam String level) {
        try {
            return ResponseEntity.ok(aiContentService.generateLessonContent(topic, level));
        } catch (IOException e) {
            throw new BadRequestException("Failed to generate lesson content: " + e.getMessage());
        }
    }
}