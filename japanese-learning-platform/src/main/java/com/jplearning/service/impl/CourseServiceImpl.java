package com.jplearning.service.impl;

import com.jplearning.dto.request.*;
import com.jplearning.dto.response.CourseResponse;
import com.jplearning.dto.response.LevelResponse;
import com.jplearning.entity.*;
import com.jplearning.entity.Module;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.CourseMapper;
import com.jplearning.repository.*;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.CourseService;
import com.jplearning.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private LevelRepository levelRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    private Integer calculateCourseDuration(Course course) {
        int totalDuration = 0;

        for (Module module : course.getModules()) {
            // First reset module duration
            int moduleDuration = 0;

            // Calculate module duration from its lessons
            for (Lesson lesson : module.getLessons()) {
                if (lesson.getDurationInMinutes() != null) {
                    moduleDuration += lesson.getDurationInMinutes();
                }
            }

            // Update module duration
            module.setDurationInMinutes(moduleDuration);

            // Add to course total
            totalDuration += moduleDuration;
        }

        return totalDuration;
    }

    @Transactional
    public void updateCourseMetadata(Course course) {
        // Calculate and set total duration
        Integer totalDuration = calculateCourseDuration(course);
        course.setDurationInMinutes(totalDuration);

        // Calculate and set lesson count
        int lessonCount = 0;
        for (Module module : course.getModules()) {
            lessonCount += module.getLessons().size();
        }
        course.setLessonCount(lessonCount);
    }


    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request, Long tutorId) {
        // Get tutor
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + tutorId));

        Level level = levelRepository.findById(request.getLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + request.getLevelId()));

        // Map request to entity
        Course course = courseMapper.requestToCourse(request);
        course.setTutor(tutor);
        course.setLevel(level);
        course.setStatus(Course.Status.DRAFT);

        // Initialize modules list if it's null
        if (course.getModules() == null) {
            course.setModules(new ArrayList<>());
        }

        // Process modules if provided
        if (request.getModules() != null && !request.getModules().isEmpty()) {
            saveModules(request.getModules(), course);
        }

        // After saving all modules and lessons, update course metadata
        updateCourseMetadata(course);

        // Save course
        Course savedCourse = courseRepository.save(course);

        // Calculate and update lesson count
        updateLessonCount(savedCourse);

        // Return response
        return courseMapper.courseToResponse(savedCourse);
    }


    @Override
    public List<CourseResponse> getTopCoursesByPurchaseCount() {
        // Get top 10 courses by purchase count (countBuy) with APPROVED status
        List<Course> topCourses = courseRepository.findTop10ByStatusOrderByCountBuyDescCreatedAtDesc(Course.Status.APPROVED);

        // Map to responses
        return topCourses.stream()
                .map(courseMapper::courseToResponse)
                .collect(Collectors.toList());
    }

    private void buildCourseObjectGraph(List<ModuleRequest> moduleRequests, Course course) {
        int modulePosition = 1;
        for (ModuleRequest moduleRequest : moduleRequests) {
            // Create module
            Module module = courseMapper.requestToModule(moduleRequest);
            module.setPosition(modulePosition++);
            module.setCourse(course);
            course.getModules().add(module);

            // Process lessons if provided
            if (moduleRequest.getLessons() != null && !moduleRequest.getLessons().isEmpty()) {
                int lessonPosition = 1;
                for (LessonRequest lessonRequest : moduleRequest.getLessons()) {
                    Lesson lesson = courseMapper.requestToLesson(lessonRequest);
                    lesson.setPosition(lessonPosition++);
                    lesson.setModule(module);
                    module.getLessons().add(lesson);

                    // Process resources if provided
                    if (lessonRequest.getResources() != null) {
                        for (ResourceRequest resourceRequest : lessonRequest.getResources()) {
                            Resource resource = courseMapper.requestToResource(resourceRequest);
                            resource.setLesson(lesson);
                            lesson.getResources().add(resource);
                        }
                    }

                    // Process exercises if provided
                    if (lessonRequest.getExercises() != null) {
                        for (ExerciseRequest exerciseRequest : lessonRequest.getExercises()) {
                            Exercise exercise = courseMapper.requestToExercise(exerciseRequest);
                            exercise.setLesson(lesson);
                            lesson.getExercises().add(exercise);

                            // Process questions if provided
                            if (exerciseRequest.getQuestions() != null) {
                                for (QuestionRequest questionRequest : exerciseRequest.getQuestions()) {
                                    Question question = courseMapper.requestToQuestion(questionRequest);
                                    question.setExercise(exercise);
                                    exercise.getQuestions().add(question);

                                    // Process options if provided
                                    if (questionRequest.getOptions() != null) {
                                        for (OptionRequest optionRequest : questionRequest.getOptions()) {
                                            Option option = courseMapper.requestToOption(optionRequest);
                                            option.setQuestion(question);
                                            question.getOptions().add(option);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    @Override
    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        return courseMapper.courseToResponse(course);
    }

    @Override
    public CourseResponse getCourseWithEnrollmentStatus(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Convert to response
        CourseResponse response = courseMapper.courseToResponse(course);

        // Check if student is enrolled in this course
        if (studentId != null) {
            boolean isEnrolled = enrollmentService.isStudentEnrolledInCourse(studentId, courseId);
            response.setEnrolled(isEnrolled);
        }

        return response;
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request, Long tutorId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Verify tutor owns this course
        if (!course.getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to update this course");
        }

        // Check if course is editable
        if (course.getStatus() != Course.Status.DRAFT && course.getStatus() != Course.Status.REJECTED) {
            throw new BadRequestException("Cannot edit a course that is pending approval or approved");
        }

        // Update level if it's changed
        if (!course.getLevel().getId().equals(request.getLevelId())) {
            Level level = levelRepository.findById(request.getLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + request.getLevelId()));
            course.setLevel(level);
        }

        // Update course with request data
        courseMapper.updateCourseFromRequest(request, course);

        // Clear and recreate modules if provided
        if (request.getModules() != null) {
            // Remove old modules
            for (Module module : new ArrayList<>(course.getModules())) {
                course.getModules().remove(module);
                moduleRepository.delete(module);
            }

            // Add new modules
            saveModules(request.getModules(), course);
        }

        // Update lesson count
        updateLessonCount(course);

        // After updating all modules and lessons, update course metadata
        updateCourseMetadata(course);

        // Save updated course
        Course updatedCourse = courseRepository.save(course);

        return courseMapper.courseToResponse(updatedCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId, Long tutorId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Verify tutor owns this course
        if (tutorId != null) {
            // Verify tutor owns this course
            if (!course.getTutor().getId().equals(tutorId)) {
                throw new AccessDeniedException("You don't have permission to delete this course");
            }
        }

        // Check if course is deletable
        if (tutorId != null &&
                course.getStatus() != Course.Status.DRAFT &&
                course.getStatus() != Course.Status.REJECTED) {
            throw new BadRequestException("Cannot delete a course that is pending approval or approved");
        }

        // Delete course
        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public CourseResponse submitCourseForApproval(Long courseId, Long tutorId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Verify tutor owns this course
        if (!course.getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to submit this course");
        }

        // Check if course is in draft or rejected state
        if (course.getStatus() != Course.Status.DRAFT && course.getStatus() != Course.Status.REJECTED) {
            throw new BadRequestException("Course is already submitted or approved");
        }

        // Validate course has required elements
        validateCourseForSubmission(course);

        // Update status
        course.setStatus(Course.Status.PENDING_APPROVAL);
        Course updatedCourse = courseRepository.save(course);

        return courseMapper.courseToResponse(updatedCourse);
    }

    @Override
    @Transactional
    public CourseResponse approveCourse(Long courseId, CourseApprovalRequest request) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Check if course is in pending approval state
        if (course.getStatus() != Course.Status.PENDING_APPROVAL) {
            throw new BadRequestException("Course is not in pending approval state");
        }

        // Update status based on request
        course.setStatus(request.getStatus());
        Course updatedCourse = courseRepository.save(course);

        return courseMapper.courseToResponse(updatedCourse);
    }

    @Override
    public Page<CourseResponse> getCoursesByTutor(Long tutorId, Pageable pageable) {
        // Get tutor
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + tutorId));

        Page<Course> courses = courseRepository.findByTutor(tutor, pageable);
        return courses.map(courseMapper::courseToResponse);
    }

    @Override
    public Page<CourseResponse> getCoursesPendingApproval(Pageable pageable) {
        Page<Course> courses = courseRepository.findByStatus(Course.Status.PENDING_APPROVAL, pageable);
        return courses.map(courseMapper::courseToResponse);
    }

    @Override
    public Page<CourseResponse> getApprovedCourses(Pageable pageable) {
        Page<Course> courses = courseRepository.findByStatus(Course.Status.APPROVED, pageable);
        return courses.map(courseMapper::courseToResponse);
    }

    @Override
    public Page<CourseResponse> getApprovedCoursesWithEnrollmentStatus(Pageable pageable, Long studentId) {
        Page<Course> courses = courseRepository.findByStatus(Course.Status.APPROVED, pageable);

        return courses.map(course -> {
            CourseResponse response = courseMapper.courseToResponse(course);

            // Check enrollment status if student ID is provided
            if (studentId != null) {
                boolean isEnrolled = enrollmentService.isStudentEnrolledInCourse(studentId, course.getId());
                response.setEnrolled(isEnrolled);
            }

            return response;
        });
    }

    private CourseResponse checkEnrollmentStatus(CourseResponse courseResponse, Long studentId) {
        if (studentId != null) {
            boolean isEnrolled = enrollmentService.isStudentEnrolledInCourse(studentId, courseResponse.getId());
            courseResponse.setEnrolled(isEnrolled);
        }
        return courseResponse;
    }

    @Override
    public Page<CourseResponse> searchCoursesByTitle(String title, Pageable pageable) {
        Page<Course> courses = courseRepository.findByTitleContainingIgnoreCaseAndStatus(
                title, Course.Status.APPROVED, pageable);
        return courses.map(courseMapper::courseToResponse);
    }

    @Override
    public Page<CourseResponse> searchCoursesByTitleWithEnrollmentStatus(String title, Pageable pageable, Long studentId) {
        Page<Course> courses = courseRepository.findByTitleContainingIgnoreCaseAndStatus(
                title, Course.Status.APPROVED, pageable);

        return courses.map(course -> {
            CourseResponse response = courseMapper.courseToResponse(course);

            // Check enrollment status if student ID is provided
            if (studentId != null) {
                boolean isEnrolled = enrollmentService.isStudentEnrolledInCourse(studentId, course.getId());
                response.setEnrolled(isEnrolled);
            }

            return response;
        });
    }

    @Override
    @Transactional
    public CourseResponse uploadThumbnail(Long courseId, MultipartFile file, Long tutorId) throws IOException {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Verify tutor owns this course
        if (!course.getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to update this course");
        }

        // Check if course is editable
        if (course.getStatus() != Course.Status.DRAFT && course.getStatus() != Course.Status.REJECTED) {
            throw new BadRequestException("Cannot edit a course that is pending approval or approved");
        }

        // Validate file is an image
        validateImageFile(file);

        // Upload image to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadImage(file);

        // Update course thumbnail URL
        course.setThumbnailUrl(uploadResult.get("secureUrl"));
        Course updatedCourse = courseRepository.save(course);

        return courseMapper.courseToResponse(updatedCourse);
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }

        // Check file size (max 2MB for thumbnails)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("Image size should not exceed 2MB");
        }
    }
    
    /**
     * Check if exercise type is a speech exercise
     */
    private boolean isSpeechExercise(Exercise.ExerciseType type) {
        return type == Exercise.ExerciseType.LISTENING ||
               type == Exercise.ExerciseType.SPEAKING ||
               type == Exercise.ExerciseType.SPEECH_RECOGNITION ||
               type == Exercise.ExerciseType.PRONUNCIATION;
    }

    // Helper methods

    private void saveModules(List<ModuleRequest> moduleRequests, Course course) {
        int position = 1;
        for (ModuleRequest moduleRequest : moduleRequests) {
            // Set position to ensure order
            moduleRequest.setPosition(position++);

            // Create module
            Module module = courseMapper.requestToModule(moduleRequest);
            module.setCourse(course);

            // Add to course's modules list
            course.getModules().add(module);

            // Initialize the lessons list if needed
            if (module.getLessons() == null) {
                module.setLessons(new ArrayList<>());
            }

            // Process lessons if provided
            if (moduleRequest.getLessons() != null && !moduleRequest.getLessons().isEmpty()) {
                saveLessons(moduleRequest.getLessons(), module);
            }

            // Calculate module duration based on its lessons
            int moduleDuration = 0;
            for (Lesson lesson : module.getLessons()) {
                if (lesson.getDurationInMinutes() != null) {
                    moduleDuration += lesson.getDurationInMinutes();
                }
            }
            module.setDurationInMinutes(moduleDuration);
        }
    }


    private void saveLessons(List<LessonRequest> lessonRequests, Module module) {
        int position = 1;
        for (LessonRequest lessonRequest : lessonRequests) {

            if (lessonRequest.getPosition() == null) {
                // Tìm vị trí lớn nhất hiện tại và tăng lên 1
                int maxPosition = module.getLessons().stream()
                        .mapToInt(Lesson::getPosition)
                        .max()
                        .orElse(0);
                lessonRequest.setPosition(maxPosition + 1);
            }

            // Set position to ensure order
//            lessonRequest.setPosition(position++);

            // Create lesson
            Lesson lesson = courseMapper.requestToLesson(lessonRequest);
            lesson.setModule(module);

            // Add to module's lessons list
            module.getLessons().add(lesson);

            // Initialize collections if needed
            if (lesson.getResources() == null) {
                lesson.setResources(new ArrayList<>());
            }
            if (lesson.getExercises() == null) {
                lesson.setExercises(new ArrayList<>());
            }

            // Process resources if provided
            if (lessonRequest.getResources() != null && !lessonRequest.getResources().isEmpty()) {
                for (ResourceRequest resourceRequest : lessonRequest.getResources()) {
                    Resource resource = courseMapper.requestToResource(resourceRequest);
                    resource.setLesson(lesson);
                    lesson.getResources().add(resource);
                }
            }

            // Process exercises if provided
            if (lessonRequest.getExercises() != null && !lessonRequest.getExercises().isEmpty()) {
                for (ExerciseRequest exerciseRequest : lessonRequest.getExercises()) {
                    Exercise exercise = courseMapper.requestToExercise(exerciseRequest);
                    exercise.setLesson(lesson);
                    
                    // Handle speech exercise fields
                    if (isSpeechExercise(exerciseRequest.getType())) {
                        exercise.setTargetText(exerciseRequest.getTargetText());
                        exercise.setTargetAudioUrl(exerciseRequest.getTargetAudioUrl());
                        exercise.setDifficultyLevel(exerciseRequest.getDifficultyLevel());
                        exercise.setSpeechRecognitionLanguage(exerciseRequest.getSpeechRecognitionLanguage());
                        exercise.setMinimumAccuracyScore(exerciseRequest.getMinimumAccuracyScore());
                    }
                    
                    lesson.getExercises().add(exercise);

                    // Initialize questions list if needed
                    if (exercise.getQuestions() == null) {
                        exercise.setQuestions(new ArrayList<>());
                    }

                    // Process questions if provided (only for traditional exercises)
                    if (!isSpeechExercise(exerciseRequest.getType()) && 
                        exerciseRequest.getQuestions() != null && !exerciseRequest.getQuestions().isEmpty()) {
                        for (QuestionRequest questionRequest : exerciseRequest.getQuestions()) {
                            Question question = courseMapper.requestToQuestion(questionRequest);
                            question.setExercise(exercise);
                            exercise.getQuestions().add(question);

                            // Initialize options list if needed
                            if (question.getOptions() == null) {
                                question.setOptions(new ArrayList<>());
                            }

                            // Process options if provided
                            if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                                for (OptionRequest optionRequest : questionRequest.getOptions()) {
                                    Option option = courseMapper.requestToOption(optionRequest);
                                    option.setQuestion(question);
                                    question.getOptions().add(option);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private void saveResources(List<ResourceRequest> resourceRequests, Lesson lesson) {
        for (ResourceRequest resourceRequest : resourceRequests) {
            Resource resource = courseMapper.requestToResource(resourceRequest);
            resource.setLesson(lesson);
            resourceRepository.save(resource);
        }
    }

    private void saveExercises(List<ExerciseRequest> exerciseRequests, Lesson lesson) {
        for (ExerciseRequest exerciseRequest : exerciseRequests) {
            Exercise exercise = courseMapper.requestToExercise(exerciseRequest);
            exercise.setLesson(lesson);
            Exercise savedExercise = exerciseRepository.save(exercise);

            // Process questions if provided
            if (exerciseRequest.getQuestions() != null && !exerciseRequest.getQuestions().isEmpty()) {
                saveQuestions(exerciseRequest.getQuestions(), savedExercise);
            }
        }
    }

    private void saveQuestions(List<QuestionRequest> questionRequests, Exercise exercise) {
        for (QuestionRequest questionRequest : questionRequests) {
            Question question = courseMapper.requestToQuestion(questionRequest);
            question.setExercise(exercise);
            Question savedQuestion = questionRepository.save(question);

            // Process options if provided (for multiple choice)
            if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                saveOptions(questionRequest.getOptions(), savedQuestion);
            }
        }
    }

    private void saveOptions(List<OptionRequest> optionRequests, Question question) {
        for (OptionRequest optionRequest : optionRequests) {
            Option option = courseMapper.requestToOption(optionRequest);
            option.setQuestion(question);
            optionRepository.save(option);
        }
    }

    private void updateLessonCount(Course course) {
        int lessonCount = 0;
        for (Module module : course.getModules()) {
            lessonCount += module.getLessons().size();
        }
        course.setLessonCount(lessonCount);
        courseRepository.save(course);
    }

    private void validateCourseForSubmission(Course course) {
        List<String> errors = new ArrayList<>();

        // Check required course fields
        if (course.getTitle() == null || course.getTitle().trim().isEmpty()) {
            errors.add("Course title is required");
        }

        if (course.getDescription() == null || course.getDescription().trim().isEmpty()) {
            errors.add("Course description is required");
        }

        if (course.getLevel() == null) {
            errors.add("Course level is required");
        }

        if (course.getPrice() == null) {
            errors.add("Course price is required");
        }

        // Check if course has modules
        if (course.getModules() == null || course.getModules().isEmpty()) {
            errors.add("Course must have at least one module");
        } else {
            // Check if modules have lessons
            boolean hasLessons = false;
            for (Module module : course.getModules()) {
                if (module.getLessons() != null && !module.getLessons().isEmpty()) {
                    hasLessons = true;
                    break;
                }
            }
            if (!hasLessons) {
                errors.add("Course must have at least one lesson");
            }
        }

        if (!errors.isEmpty()) {
            throw new BadRequestException("Cannot submit course: " + String.join(", ", errors));
        }
    }

    @Override
    @Transactional
    public CourseResponse withdrawCourse(Long courseId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Validate current status
        if (course.getStatus() != Course.Status.APPROVED && course.getStatus() != Course.Status.PENDING_APPROVAL) {
            throw new BadRequestException("Course is not in a state that can be withdrawn. Current status: " + course.getStatus());
        }

        // Change status to DRAFT
        course.setStatus(Course.Status.DRAFT);

        // Save updated course
        Course updatedCourse = courseRepository.save(course);

        // Return response
        return courseMapper.courseToResponse(updatedCourse);
    }
}