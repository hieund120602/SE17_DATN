package com.jplearning.controller;

import com.jplearning.dto.request.SpeechExerciseRequest;
import com.jplearning.dto.request.SpeechExerciseSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResponse;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.dto.response.SpeechExerciseStatsResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.SpeechExerciseService;
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

@RestController
@RequestMapping("/speech-exercises")
@Tag(name = "Speech Exercise", description = "Speech exercise APIs for listening and speaking practice")
@CrossOrigin(origins = "*")
public class SpeechExerciseController {

    @Autowired
    private SpeechExerciseService speechExerciseService;

    @PostMapping("/lessons/{lessonId}")
    @Operation(
            summary = "Create speech exercise",
            description = "Create a new speech exercise for a lesson (tutor only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SpeechExerciseResponse> createSpeechExercise(
            @PathVariable Long lessonId,
            @Valid @RequestBody SpeechExerciseRequest request) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(speechExerciseService.createSpeechExercise(lessonId, request, tutorId));
    }

    @GetMapping("/{exerciseId}")
    @Operation(
            summary = "Get speech exercise",
            description = "Get speech exercise details by ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<SpeechExerciseResponse> getSpeechExercise(@PathVariable Long exerciseId) {
        return ResponseEntity.ok(speechExerciseService.getSpeechExerciseById(exerciseId));
    }

    @GetMapping("/lessons/{lessonId}")
    @Operation(
            summary = "Get speech exercises by lesson",
            description = "Get all speech exercises for a specific lesson",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<SpeechExerciseResponse>> getSpeechExercisesByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(speechExerciseService.getSpeechExercisesByLesson(lessonId));
    }

    @PostMapping("/{exerciseId}/submit")
    @Operation(
            summary = "Submit speech exercise",
            description = "Submit speech exercise result (student only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechExerciseResultResponse> submitSpeechExercise(
            @PathVariable Long exerciseId,
            @Valid @RequestBody SpeechExerciseSubmissionRequest request) {
        request.setExerciseId(exerciseId);
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(speechExerciseService.submitSpeechExercise(request, studentId));
    }

    @PostMapping(value = "/{exerciseId}/submit-with-audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Submit speech exercise with audio",
            description = "Submit speech exercise result with audio file (student only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechExerciseResultResponse> submitSpeechExerciseWithAudio(
            @PathVariable Long exerciseId,
            @RequestParam("recognizedText") String recognizedText,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestParam(value = "confidenceScore", required = false) Double confidenceScore,
            @RequestParam(value = "timeSpentSeconds", required = false) Long timeSpentSeconds) {
        try {
            Long studentId = getCurrentUserId();
            return ResponseEntity.ok(speechExerciseService.submitSpeechExerciseWithAudio(
                    exerciseId, recognizedText, audioFile, confidenceScore, timeSpentSeconds, studentId));
        } catch (IOException e) {
            throw new BadRequestException("Failed to process audio file: " + e.getMessage());
        }
    }

    @GetMapping("/{exerciseId}/results")
    @Operation(
            summary = "Get exercise results",
            description = "Get student's results for a specific exercise",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<SpeechExerciseResultResponse>> getExerciseResults(
            @PathVariable Long exerciseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long studentId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(speechExerciseService.getStudentExerciseResults(studentId, exerciseId, pageable));
    }

    @GetMapping("/my-results")
    @Operation(
            summary = "Get all my results",
            description = "Get all speech exercise results for current student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<SpeechExerciseResultResponse>> getMyResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long studentId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(speechExerciseService.getAllStudentResults(studentId, pageable));
    }

    @GetMapping("/my-stats")
    @Operation(
            summary = "Get my statistics",
            description = "Get speech exercise statistics for current student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SpeechExerciseStatsResponse> getMyStats() {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(speechExerciseService.getStudentStats(studentId));
    }

    @PutMapping("/{exerciseId}")
    @Operation(
            summary = "Update speech exercise",
            description = "Update speech exercise (tutor only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SpeechExerciseResponse> updateSpeechExercise(
            @PathVariable Long exerciseId,
            @Valid @RequestBody SpeechExerciseRequest request) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(speechExerciseService.updateSpeechExercise(exerciseId, request, tutorId));
    }

    @DeleteMapping("/{exerciseId}")
    @Operation(
            summary = "Delete speech exercise",
            description = "Delete speech exercise (tutor only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Void> deleteSpeechExercise(@PathVariable Long exerciseId) {
        Long tutorId = getCurrentUserId();
        speechExerciseService.deleteSpeechExercise(exerciseId, tutorId);
        return ResponseEntity.noContent().build();
    }

    // Admin endpoints
    @GetMapping("/students/{studentId}/results")
    @Operation(
            summary = "Get student results (Admin)",
            description = "Get all speech exercise results for a specific student (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SpeechExerciseResultResponse>> getStudentResults(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(speechExerciseService.getAllStudentResults(studentId, pageable));
    }

    @GetMapping("/students/{studentId}/stats")
    @Operation(
            summary = "Get student statistics (Admin)",
            description = "Get speech exercise statistics for a specific student (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpeechExerciseStatsResponse> getStudentStats(@PathVariable Long studentId) {
        return ResponseEntity.ok(speechExerciseService.getStudentStats(studentId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}