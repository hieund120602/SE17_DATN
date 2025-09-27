package com.jplearning.service.impl;

import com.jplearning.dto.response.MessageResponse;
import com.jplearning.entity.*;
import com.jplearning.entity.Module;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.*;
import com.jplearning.service.LessonCompletionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class LessonCompletionServiceImpl implements LessonCompletionService {

    @Autowired
    private LessonCompletionRepository lessonCompletionRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Override
    @Transactional
    public MessageResponse markLessonAsCompleted(Long lessonId, Long courseId, Long studentId) {
        // Check if lesson exists
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        // Check if course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Check if lesson belongs to course (without loading the entire course tree)
        Module module = lesson.getModule();
        if (module == null || !courseId.equals(module.getCourse().getId())) {
            throw new BadRequestException("Lesson does not belong to the specified course");
        }

        // Check if student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Check if student is enrolled in course
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new BadRequestException("Student is not enrolled in this course"));

        // Check if lesson is already completed
        if (lessonCompletionRepository.findByLessonIdAndStudentId(lessonId, studentId).isPresent()) {
            return new MessageResponse("Lesson already marked as completed");
        }

        // Create lesson completion record
        LessonCompletion completion = LessonCompletion.builder()
                .lesson(lesson)
                .course(course)
                .student(student)
                .completedAt(LocalDateTime.now())
                .build();

        lessonCompletionRepository.save(completion);

        // Update enrollment progress
        updateEnrollmentProgress(enrollment, course);

        return new MessageResponse("Lesson marked as completed");
    }

    private void updateEnrollmentProgress(Enrollment enrollment, Course course) {
        // Count total lessons (without loading the full course tree)
        int totalLessons = countTotalLessons(course.getId());

        // Get completed lesson count
        Long completedLessons = lessonCompletionRepository.countByStudentIdAndCourseId(
                enrollment.getStudent().getId(), course.getId());

        // Calculate progress percentage
        int progressPercentage = totalLessons > 0 ?
                (int) ((completedLessons * 100) / totalLessons) : 0;

        // Update enrollment
        enrollment.setCompletedLessons(completedLessons.intValue());
        enrollment.setProgressPercentage(progressPercentage);

        // Check if course is completed
        if (progressPercentage >= 100) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
        }

        enrollmentRepository.save(enrollment);
    }

    private int countTotalLessons(Long courseId) {
        // Get all modules for this course
        List<Module> modules = moduleRepository.findByCourseId(courseId);

        // Count all lessons
        int totalLessons = 0;
        for (Module module : modules) {
            totalLessons += lessonRepository.countByModuleId(module.getId());
        }

        return totalLessons;
    }
}