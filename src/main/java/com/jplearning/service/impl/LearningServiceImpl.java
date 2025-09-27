package com.jplearning.service.impl;

import com.jplearning.dto.response.*;
import com.jplearning.entity.*;
import com.jplearning.entity.Module;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.CourseRepository;
import com.jplearning.repository.EnrollmentRepository;
import com.jplearning.repository.LessonCompletionRepository;
import com.jplearning.repository.StudentRepository;
import com.jplearning.service.LearningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LearningServiceImpl implements LearningService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonCompletionRepository lessonCompletionRepository;

    @Override
    public CourseForLearningResponse getCourseForLearning(Long courseId, Long studentId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Check if course is approved
        if (course.getStatus() != Course.Status.APPROVED) {
            throw new BadRequestException("Course is not available for learning");
        }

        // Get student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Check if student is enrolled in this course
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new BadRequestException("Student is not enrolled in this course"));

        // Get completed lessons for this student in this course
        Set<Long> completedLessonIds = getCompletedLessonIds(student.getId(), course.getId());

        // Build response
        return buildCourseForLearningResponse(course, enrollment, completedLessonIds);
    }

    private Set<Long> getCompletedLessonIds(Long studentId, Long courseId) {
        // Get lesson completions for this student and course
        List<LessonCompletion> completions = lessonCompletionRepository.findByStudentIdAndCourseId(studentId, courseId);

        // Extract and return only the lesson IDs
        return completions.stream()
                .map(completion -> completion.getLesson().getId())
                .collect(Collectors.toSet());
    }

    private CourseForLearningResponse buildCourseForLearningResponse(
            Course course,
            Enrollment enrollment,
            Set<Long> completedLessonIds) {

        // Build modules with lessons
        List<ModuleForLearningResponse> modules = new ArrayList<>();

        // Process each module
        for (Module module : course.getModules()) {
            List<LessonForLearningResponse> lessonResponses = new ArrayList<>();

            // Process each lesson
            for (Lesson lesson : module.getLessons()) {
                boolean isLessonCompleted = completedLessonIds.contains(lesson.getId());

                List<ResourceResponse> resourceResponses = new ArrayList<>();
                if (lesson.getResources() != null && !lesson.getResources().isEmpty()) {
                    resourceResponses = lesson.getResources().stream()
                            .map(resource -> ResourceResponse.builder()
                                    .id(resource.getId())
                                    .title(resource.getTitle())
                                    .description(resource.getDescription())
                                    .fileUrl(resource.getFileUrl())
                                    .fileType(resource.getFileType())
                                    .createdAt(resource.getCreatedAt())
                                    .updatedAt(resource.getUpdatedAt())
                                    .build())
                            .collect(Collectors.toList());
                }

                // Map exercises for this lesson
                List<ExerciseResponse> exerciseResponses = new ArrayList<>();
                if (lesson.getExercises() != null && !lesson.getExercises().isEmpty()) {
                    exerciseResponses = lesson.getExercises().stream()
                            .map(exercise -> {
                                List<QuestionResponse> questionResponses = new ArrayList<>();
                                if (exercise.getQuestions() != null && !exercise.getQuestions().isEmpty()) {
                                    questionResponses = exercise.getQuestions().stream()
                                            .map(question -> {
                                                List<OptionResponse> optionResponses = new ArrayList<>();
                                                if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                                                    optionResponses = question.getOptions().stream()
                                                            .map(option -> OptionResponse.builder()
                                                                    .id(option.getId())
                                                                    .content(option.getContent())
                                                                    .correct(option.isCorrect())
                                                                    .createdAt(option.getCreatedAt())
                                                                    .updatedAt(option.getUpdatedAt())
                                                                    .build())
                                                            .collect(Collectors.toList());
                                                }

                                                return QuestionResponse.builder()
                                                        .id(question.getId())
                                                        .content(question.getContent())
                                                        .hint(question.getHint())
                                                        .correctAnswer(question.getCorrectAnswer())
                                                        .answerExplanation(question.getAnswerExplanation())
                                                        .points(question.getPoints())
                                                        .options(optionResponses)
                                                        .createdAt(question.getCreatedAt())
                                                        .updatedAt(question.getUpdatedAt())
                                                        .build();
                                            })
                                            .collect(Collectors.toList());
                                }

                                return ExerciseResponse.builder()
                                        .id(exercise.getId())
                                        .title(exercise.getTitle())
                                        .description(exercise.getDescription())
                                        .type(exercise.getType())
                                        .questions(questionResponses)
                                        // Speech exercise specific fields
                                        .targetText(exercise.getTargetText())
                                        .targetAudioUrl(exercise.getTargetAudioUrl())
                                        .difficultyLevel(exercise.getDifficultyLevel())
                                        .speechRecognitionLanguage(exercise.getSpeechRecognitionLanguage())
                                        .minimumAccuracyScore(exercise.getMinimumAccuracyScore())
                                        .createdAt(exercise.getCreatedAt())
                                        .updatedAt(exercise.getUpdatedAt())
                                        .build();
                            })
                            .collect(Collectors.toList());
                }

                LessonForLearningResponse lessonResponse = LessonForLearningResponse.builder()
                        .id(lesson.getId())
                        .title(lesson.getTitle())
                        .description(lesson.getDescription())
                        .videoUrl(lesson.getVideoUrl())
                        .durationInMinutes(lesson.getDurationInMinutes())
                        .position(lesson.getPosition())
                        .isCompleted(isLessonCompleted)
                        .completedAt(isLessonCompleted ? getCompletionDate(lesson.getId(), enrollment.getStudent().getId()) : null)
                        .resources(resourceResponses)
                        .exercises(exerciseResponses)
                        .build();

                lessonResponses.add(lessonResponse);
            }

            // Sort lessons by position
            lessonResponses.sort(Comparator.comparing(LessonForLearningResponse::getPosition));

            ModuleForLearningResponse moduleResponse = ModuleForLearningResponse.builder()
                    .id(module.getId())
                    .title(module.getTitle())
                    .durationInMinutes(module.getDurationInMinutes())
                    .position(module.getPosition())
                    .lessons(lessonResponses)
                    .build();

            modules.add(moduleResponse);
        }

        // Sort modules by position
        modules.sort(Comparator.comparing(ModuleForLearningResponse::getPosition));

        // Build tutor response
        TutorBriefResponse tutorResponse = TutorBriefResponse.builder()
                .id(course.getTutor().getId())
                .fullName(course.getTutor().getFullName())
                .avatarUrl(course.getTutor().getAvatarUrl())
                .teachingRequirements(course.getTutor().getTeachingRequirements())
                .build();

        // Get level name
        String levelName = course.getLevel().getName();

        // Build main response
        return CourseForLearningResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .durationInMinutes(course.getDurationInMinutes())
                .level(levelName)
                .courseOverview(course.getCourseOverview())
                .courseContent(course.getCourseContent())
                .thumbnailUrl(course.getThumbnailUrl())
                .countBuy(course.getCountBuy()) // Added countBuy field
                .tutor(tutorResponse)
                .enrollmentId(enrollment.getId())
                .progressPercentage(enrollment.getProgressPercentage())
                .completedLessons(enrollment.getCompletedLessons())
                .lastAccessedLessonId(enrollment.getLastAccessedLessonId())
                .isCompleted(enrollment.isCompleted())
                .enrolledAt(enrollment.getCreatedAt())
                .completedAt(enrollment.getCompletedAt())
                .modules(modules)
                .build();
    }

    private LocalDateTime getCompletionDate(Long lessonId, Long studentId) {
        // Get completion date from LessonCompletion entity
        return lessonCompletionRepository.findByLessonIdAndStudentId(lessonId, studentId)
                .map(LessonCompletion::getCompletedAt)
                .orElse(null);
    }
}