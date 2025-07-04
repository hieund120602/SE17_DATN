package com.jplearning.service.impl;

import com.jplearning.dto.response.LessonResponse;
import com.jplearning.entity.Course;
import com.jplearning.entity.Lesson;
import com.jplearning.entity.Module;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.CourseMapper;
import com.jplearning.repository.LessonRepository;
import com.jplearning.repository.ModuleRepository;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class LessonServiceImpl implements LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private CourseMapper courseMapper;

    @Override
    @Transactional
    public LessonResponse uploadVideo(Long lessonId, MultipartFile file, Long tutorId) throws IOException {
        // Get lesson
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        // Get module and course
        Module module = lesson.getModule();
        Course course = module.getCourse();

        // Verify tutor owns this course
        if (!course.getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to upload video for this lesson");
        }

        // Check if course is editable
        if (course.getStatus() != Course.Status.DRAFT && course.getStatus() != Course.Status.REJECTED) {
            throw new BadRequestException("Cannot edit lessons of a course that is pending approval or approved");
        }

        // Validate file is a video
        validateVideoFile(file);

        // Upload video to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadVideo(file);

        // Update lesson video URL
        lesson.setVideoUrl(uploadResult.get("secureUrl"));
        Lesson updatedLesson = lessonRepository.save(lesson);

        return courseMapper.lessonToResponse(updatedLesson);
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        return courseMapper.lessonToResponse(lesson);
    }

    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new BadRequestException("File must be a video");
        }

        // Check file size (max 100MB for videos)
        if (file.getSize() > 100 * 1024 * 1024) {
            throw new BadRequestException("Video size should not exceed 100MB");
        }
    }
}