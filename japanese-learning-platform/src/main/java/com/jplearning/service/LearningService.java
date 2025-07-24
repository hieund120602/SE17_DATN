package com.jplearning.service;

import com.jplearning.dto.response.CourseForLearningResponse;

public interface LearningService {
    /**
     * Get course details for learning, including student progress
     *
     * @param courseId Course ID
     * @param studentId Student ID
     * @return Course details with learning progress
     */
    CourseForLearningResponse getCourseForLearning(Long courseId, Long studentId);
}