package com.jplearning.service;

import com.jplearning.dto.request.SpeechExerciseRequest;
import com.jplearning.dto.request.SpeechExerciseSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResponse;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.dto.response.SpeechExerciseStatsResponse;
import com.jplearning.entity.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SpeechExerciseService {
    /**
     * Create a new speech exercise
     */
    SpeechExerciseResponse createSpeechExercise(Long lessonId, SpeechExerciseRequest request, Long tutorId);

    /**
     * Get speech exercise by ID
     */
    SpeechExerciseResponse getSpeechExerciseById(Long exerciseId);

    /**
     * Get all speech exercises for a lesson
     */
    List<SpeechExerciseResponse> getSpeechExercisesByLesson(Long lessonId);

    /**
     * Submit speech exercise result
     */
    SpeechExerciseResultResponse submitSpeechExercise(SpeechExerciseSubmissionRequest request, Long studentId);

    /**
     * Submit speech exercise with audio file
     */
    SpeechExerciseResultResponse submitSpeechExerciseWithAudio(
            Long exerciseId,
            String recognizedText,
            MultipartFile audioFile,
            Double confidenceScore,
            Long timeSpentSeconds,
            Long studentId
    ) throws IOException;

    /**
     * Get student's results for an exercise
     */
    Page<SpeechExerciseResultResponse> getStudentExerciseResults(Long studentId, Long exerciseId, Pageable pageable);

    /**
     * Get all student's speech exercise results
     */
    Page<SpeechExerciseResultResponse> getAllStudentResults(Long studentId, Pageable pageable);

    /**
     * Get student's speech exercise statistics
     */
    SpeechExerciseStatsResponse getStudentStats(Long studentId);

    /**
     * Update speech exercise
     */
    SpeechExerciseResponse updateSpeechExercise(Long exerciseId, SpeechExerciseRequest request, Long tutorId);

    /**
     * Delete speech exercise
     */
    void deleteSpeechExercise(Long exerciseId, Long tutorId);

    /**
     * Calculate accuracy score between target and recognized text
     */
    double calculateAccuracyScore(String targetText, String recognizedText);

    /**
     * Generate pronunciation feedback
     */
    String generatePronunciationFeedback(String targetText, String recognizedText, double accuracyScore);

    /**
     * Generate pronunciation feedback with exercise type
     */
    String generatePronunciationFeedback(String targetText, String recognizedText, double accuracyScore, Exercise.ExerciseType exerciseType);
}