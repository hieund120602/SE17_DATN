package com.jplearning.service;

import com.jplearning.dto.response.MessageResponse;

public interface LessonCompletionService {
    /**
     * Mark a lesson as completed for a student
     *
     * @param lessonId ID of the lesson
     * @param courseId ID of the course
     * @param studentId ID of the student
     * @return Message response
     */
    MessageResponse markLessonAsCompleted(Long lessonId, Long courseId, Long studentId);
}