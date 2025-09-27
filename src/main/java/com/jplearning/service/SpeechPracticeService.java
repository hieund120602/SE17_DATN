package com.jplearning.service;

import com.jplearning.dto.request.SpeechPracticeRequest;
import com.jplearning.dto.response.SpeechPracticeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SpeechPracticeService {
    /**
     * Create a new speech practice entry
     *
     * @param studentId ID of the student
     * @param lessonId ID of the lesson (optional)
     * @param request Practice details
     * @return Created practice response
     */
    SpeechPracticeResponse createPractice(Long studentId, Long lessonId, SpeechPracticeRequest request);

    /**
     * Submit speech practice audio for evaluation
     *
     * @param practiceId ID of the practice
     * @param audioFile Audio file with student's speech
     * @return Updated practice response with evaluation results
     * @throws IOException If an I/O error occurs
     */
    SpeechPracticeResponse submitPracticeAudio(Long practiceId, MultipartFile audioFile) throws IOException;

    /**
     * Get a speech practice by ID
     *
     * @param practiceId ID of the practice
     * @return Practice response
     */
    SpeechPracticeResponse getPracticeById(Long practiceId);

    /**
     * Get all speech practices for a student
     *
     * @param studentId ID of the student
     * @param pageable Pagination information
     * @return Page of practice responses
     */
    Page<SpeechPracticeResponse> getStudentPractices(Long studentId, Pageable pageable);

    /**
     * Get recent speech practices for a student
     *
     * @param studentId ID of the student
     * @return List of recent practice responses
     */
    List<SpeechPracticeResponse> getRecentPractices(Long studentId);
}