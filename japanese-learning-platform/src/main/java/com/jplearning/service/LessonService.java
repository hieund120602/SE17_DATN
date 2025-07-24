package com.jplearning.service;

import com.jplearning.dto.response.LessonResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface LessonService {
    /**
     * Upload video for a lesson
     *
     * @param lessonId Lesson ID
     * @param file Video file
     * @param tutorId ID of the tutor uploading the video
     * @return Updated lesson response
     * @throws IOException If an I/O error occurs
     */
    LessonResponse uploadVideo(Long lessonId, MultipartFile file, Long tutorId) throws IOException;

    /**
     * Get a lesson by ID
     *
     * @param lessonId Lesson ID
     * @return Lesson response
     */
    LessonResponse getLessonById(Long lessonId);
}