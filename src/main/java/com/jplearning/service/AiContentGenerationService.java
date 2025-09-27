package com.jplearning.service;

import com.jplearning.dto.request.ExerciseGenerationRequest;
import com.jplearning.dto.request.ListeningExerciseRequest;
import com.jplearning.dto.response.GeneratedContentResponse;
import com.jplearning.dto.response.GeneratedExerciseResponse;
import com.jplearning.dto.response.GeneratedListeningExerciseResponse;

import java.io.IOException;

public interface AiContentGenerationService {
    /**
     * Generate exercise content using Gemini AI
     *
     * @param request Exercise generation parameters
     * @return Generated exercise content
     * @throws IOException If an I/O error occurs
     */
    GeneratedExerciseResponse generateExercise(ExerciseGenerationRequest request) throws IOException;

    /**
     * Generate listening exercise with audio
     *
     * @param request Listening exercise parameters
     * @return Generated listening exercise with audio URL
     * @throws IOException If an I/O error occurs
     */
    GeneratedListeningExerciseResponse generateListeningExercise(ListeningExerciseRequest request) throws IOException;

    /**
     * Generate lesson content based on topic or level
     *
     * @param topic Japanese language topic
     * @param level Difficulty level
     * @return Generated lesson content
     * @throws IOException If an I/O error occurs
     */
    GeneratedContentResponse generateLessonContent(String topic, String level) throws IOException;
}