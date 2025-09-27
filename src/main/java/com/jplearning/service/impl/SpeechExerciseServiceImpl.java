package com.jplearning.service.impl;

import com.jplearning.dto.request.SpeechExerciseRequest;
import com.jplearning.dto.request.SpeechExerciseSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResponse;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.dto.response.SpeechExerciseStatsResponse;
import com.jplearning.entity.*;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.*;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.SpeechExerciseService;
import com.jplearning.service.SpeechRecognitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SpeechExerciseServiceImpl implements SpeechExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private SpeechExerciseResultRepository speechExerciseResultRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private SpeechRecognitionService speechRecognitionService;

    @Override
    @Transactional
    public SpeechExerciseResponse createSpeechExercise(Long lessonId, SpeechExerciseRequest request, Long tutorId) {
        // Get lesson and verify ownership
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        // Verify tutor owns this lesson's course
        if (!lesson.getModule().getCourse().getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to create exercises for this lesson");
        }

        // Create exercise
        Exercise exercise = Exercise.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .lesson(lesson)
                .targetText(request.getTargetText())
                .targetAudioUrl(request.getTargetAudioUrl())
                .difficultyLevel(request.getDifficultyLevel())
                .speechRecognitionLanguage(request.getSpeechRecognitionLanguage())
                .minimumAccuracyScore(request.getMinimumAccuracyScore())
                .build();

        Exercise savedExercise = exerciseRepository.save(exercise);
        return mapToSpeechExerciseResponse(savedExercise);
    }

    @Override
    public SpeechExerciseResponse getSpeechExerciseById(Long exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exerciseId));

        return mapToSpeechExerciseResponse(exercise);
    }

    @Override
    public List<SpeechExerciseResponse> getSpeechExercisesByLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        return lesson.getExercises().stream()
                .filter(exercise -> exercise.getType() == Exercise.ExerciseType.SPEAKING ||
                        exercise.getType() == Exercise.ExerciseType.LISTENING ||
                        exercise.getType() == Exercise.ExerciseType.PRONUNCIATION)
                .map(this::mapToSpeechExerciseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SpeechExerciseResultResponse submitSpeechExercise(SpeechExerciseSubmissionRequest request, Long studentId) {
        // Get exercise and student
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + request.getExerciseId()));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Calculate accuracy score based on exercise type
        double accuracyScore;
        
        switch (exercise.getType()) {
            case LISTENING:
                // For listening exercises, check if the recognized text matches the target exactly
                accuracyScore = request.getRecognizedText().equals(exercise.getTargetText()) ? 100.0 : 0.0;
                break;
            case SPEAKING:
                // For speaking exercises, use speech recognition service for accuracy
                accuracyScore = calculateAccuracyScore(exercise.getTargetText(), request.getRecognizedText());
                break;
            case PRONUNCIATION:
                // For pronunciation exercises, use speech recognition with stricter criteria
                accuracyScore = calculateAccuracyScore(exercise.getTargetText(), request.getRecognizedText());
                // Add extra penalty for pronunciation exercises to make them stricter
                accuracyScore = Math.max(0, accuracyScore - 10);
                break;
            case SPEECH_RECOGNITION:
                // For speech recognition exercises, use standard accuracy calculation
                accuracyScore = calculateAccuracyScore(exercise.getTargetText(), request.getRecognizedText());
                break;
            default:
                // For other exercise types, use standard accuracy calculation
                accuracyScore = calculateAccuracyScore(exercise.getTargetText(), request.getRecognizedText());
        }

        // Generate feedback based on exercise type
        String feedback = generatePronunciationFeedback(
                exercise.getTargetText(),
                request.getRecognizedText(),
                accuracyScore,
                exercise.getType()
        );

        // Determine if passed
        boolean isPassed = accuracyScore >= exercise.getMinimumAccuracyScore();

        // Get attempt number
        int attemptNumber = getNextAttemptNumber(student, exercise);

        // Create result
        SpeechExerciseResult result = SpeechExerciseResult.builder()
                .student(student)
                .exercise(exercise)
                .targetText(exercise.getTargetText())
                .recognizedText(request.getRecognizedText())
                .studentAudioUrl(request.getStudentAudioUrl())
                .accuracyScore(accuracyScore)
                .confidenceScore(request.getConfidenceScore())
                .pronunciationFeedback(feedback)
                .isPassed(isPassed)
                .attemptNumber(attemptNumber)
                .timeSpentSeconds(request.getTimeSpentSeconds())
                .build();

        SpeechExerciseResult savedResult = speechExerciseResultRepository.save(result);
        return mapToResultResponse(savedResult);
    }

    @Override
    @Transactional
    public SpeechExerciseResultResponse submitSpeechExerciseWithAudio(
            Long exerciseId,
            String recognizedText,
            MultipartFile audioFile,
            Double confidenceScore,
            Long timeSpentSeconds,
            Long studentId) throws IOException {

        // Upload audio file
        String audioUrl = null;
        if (audioFile != null && !audioFile.isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFile(audioFile);
            audioUrl = uploadResult.get("secureUrl");
        }

        // Create submission request
        SpeechExerciseSubmissionRequest request = new SpeechExerciseSubmissionRequest();
        request.setExerciseId(exerciseId);
        request.setRecognizedText(recognizedText);
        request.setStudentAudioUrl(audioUrl);
        request.setConfidenceScore(confidenceScore);
        request.setTimeSpentSeconds(timeSpentSeconds);

        return submitSpeechExercise(request, studentId);
    }

    @Override
    public Page<SpeechExerciseResultResponse> getStudentExerciseResults(Long studentId, Long exerciseId, Pageable pageable) {
        Page<SpeechExerciseResult> results = speechExerciseResultRepository
                .findLatestAttemptsByStudentAndExercise(studentId, exerciseId, pageable);

        return results.map(this::mapToResultResponse);
    }

    @Override
    public Page<SpeechExerciseResultResponse> getAllStudentResults(Long studentId, Pageable pageable) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Page<SpeechExerciseResult> results = speechExerciseResultRepository.findByStudent(student, pageable);
        return results.map(this::mapToResultResponse);
    }

    @Override
    public SpeechExerciseStatsResponse getStudentStats(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Get all results for student
        Page<SpeechExerciseResult> allResults = speechExerciseResultRepository
                .findByStudent(student, PageRequest.of(0, Integer.MAX_VALUE));

        List<SpeechExerciseResult> results = allResults.getContent();

        // Calculate stats
        long totalAttempts = results.size();
        long totalPassed = results.stream().mapToLong(r -> r.getIsPassed() ? 1 : 0).sum();
        double averageAccuracyScore = results.stream()
                .mapToDouble(SpeechExerciseResult::getAccuracyScore)
                .average()
                .orElse(0.0);
        double passRate = totalAttempts > 0 ? (double) totalPassed / totalAttempts * 100 : 0.0;
        long totalTimeSpent = results.stream()
                .mapToLong(r -> r.getTimeSpentSeconds() != null ? r.getTimeSpentSeconds() : 0L)
                .sum();

        // Calculate streaks
        int[] streaks = calculateStreaks(results);

        return SpeechExerciseStatsResponse.builder()
                .totalAttempts(totalAttempts)
                .totalPassed(totalPassed)
                .averageAccuracyScore(averageAccuracyScore)
                .passRate(passRate)
                .totalTimeSpent(totalTimeSpent)
                .currentStreak(streaks[0])
                .longestStreak(streaks[1])
                .build();
    }

    @Override
    @Transactional
    public SpeechExerciseResponse updateSpeechExercise(Long exerciseId, SpeechExerciseRequest request, Long tutorId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exerciseId));

        // Verify tutor owns this exercise
        if (!exercise.getLesson().getModule().getCourse().getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to update this exercise");
        }

        // Update exercise
        exercise.setTitle(request.getTitle());
        exercise.setDescription(request.getDescription());
        exercise.setType(request.getType());
        exercise.setTargetText(request.getTargetText());
        exercise.setTargetAudioUrl(request.getTargetAudioUrl());
        exercise.setDifficultyLevel(request.getDifficultyLevel());
        exercise.setSpeechRecognitionLanguage(request.getSpeechRecognitionLanguage());
        exercise.setMinimumAccuracyScore(request.getMinimumAccuracyScore());

        Exercise updatedExercise = exerciseRepository.save(exercise);
        return mapToSpeechExerciseResponse(updatedExercise);
    }

    @Override
    @Transactional
    public void deleteSpeechExercise(Long exerciseId, Long tutorId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exerciseId));

        // Verify tutor owns this exercise
        if (!exercise.getLesson().getModule().getCourse().getTutor().getId().equals(tutorId)) {
            throw new AccessDeniedException("You don't have permission to delete this exercise");
        }

        exerciseRepository.delete(exercise);
    }

    @Override
    public double calculateAccuracyScore(String targetText, String recognizedText) {
        return speechRecognitionService.calculateAccuracyScore(targetText, recognizedText) * 100;
    }

    @Override
    public String generatePronunciationFeedback(String targetText, String recognizedText, double accuracyScore) {
        try {
            return speechRecognitionService.generatePronunciationFeedback(targetText, recognizedText);
        } catch (IOException e) {
            // Fallback to simple feedback
            return generateSimpleFeedback(accuracyScore);
        }
    }
    
    @Override
    public String generatePronunciationFeedback(String targetText, String recognizedText, double accuracyScore, Exercise.ExerciseType exerciseType) {
        StringBuilder feedback = new StringBuilder();
        
        // Add exercise type specific feedback
        switch (exerciseType) {
            case LISTENING:
                if (accuracyScore >= 90) {
                    feedback.append("Tuyệt vời! Bạn đã nghe và nhận diện chính xác. ");
                } else {
                    feedback.append("Bạn cần luyện nghe thêm. Hãy tập trung vào từng âm tiết. ");
                }
                break;
                
            case SPEAKING:
                if (accuracyScore >= 90) {
                    feedback.append("Phát âm của bạn rất tốt! Tiếp tục phát huy. ");
                } else if (accuracyScore >= 70) {
                    feedback.append("Phát âm khá tốt, nhưng cần cải thiện thêm về ngữ điệu. ");
                } else {
                    feedback.append("Bạn cần luyện tập phát âm thêm. Hãy chú ý đến từng âm tiết. ");
                }
                break;
                
            case PRONUNCIATION:
                if (accuracyScore >= 90) {
                    feedback.append("Xuất sắc! Phát âm của bạn rất chuẩn xác. ");
                } else if (accuracyScore >= 70) {
                    feedback.append("Phát âm tương đối tốt. Hãy chú ý hơn đến ngữ điệu và trọng âm. ");
                } else {
                    feedback.append("Phát âm cần cải thiện nhiều. Hãy luyện tập từng từ một cách chậm rãi. ");
                }
                break;
                
            case SPEECH_RECOGNITION:
                if (accuracyScore >= 90) {
                    feedback.append("Tuyệt vời! Bạn đã nhận diện và phát âm chính xác. ");
                } else if (accuracyScore >= 70) {
                    feedback.append("Khá tốt. Bạn đã nhận diện được phần lớn nội dung. ");
                } else {
                    feedback.append("Bạn cần luyện nghe và phát âm thêm. Hãy tập trung vào từng câu. ");
                }
                break;
                
            default:
                if (accuracyScore >= 90) {
                    feedback.append("Xuất sắc! ");
                } else if (accuracyScore >= 70) {
                    feedback.append("Khá tốt. Tiếp tục cố gắng. ");
                } else {
                    feedback.append("Cần cải thiện. Hãy luyện tập thêm. ");
                }
        }
        
        // Add general feedback based on score
        if (accuracyScore >= 95) {
            feedback.append("Bạn đã hoàn thành bài tập một cách xuất sắc!");
        } else if (accuracyScore >= 80) {
            feedback.append("Bạn đã hoàn thành bài tập tốt.");
        } else if (accuracyScore >= 60) {
            feedback.append("Bạn cần luyện tập thêm để cải thiện kỹ năng.");
        } else {
            feedback.append("Hãy tiếp tục luyện tập và không nản lòng.");
        }
        
        return feedback.toString();
    }
    
    private String generateSimpleFeedback(double accuracyScore) {
        if (accuracyScore >= 90) {
            return "Xuất sắc! Phát âm của bạn rất chính xác.";
        } else if (accuracyScore >= 80) {
            return "Tốt! Phát âm khá chính xác, tiếp tục luyện tập.";
        } else if (accuracyScore >= 70) {
            return "Khá tốt! Hãy chú ý đến cách phát âm một số âm.";
        } else if (accuracyScore >= 60) {
            return "Cần cải thiện. Hãy luyện tập thêm và nghe kỹ các âm tiếng Nhật.";
        } else {
            return "Cần luyện tập nhiều hơn. Hãy nghe và bắt chước phát âm từ từ.";
        }
    }

    // Helper methods
    private SpeechExerciseResponse mapToSpeechExerciseResponse(Exercise exercise) {
        return SpeechExerciseResponse.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .type(exercise.getType())
                .targetText(exercise.getTargetText())
                .targetAudioUrl(exercise.getTargetAudioUrl())
                .difficultyLevel(exercise.getDifficultyLevel())
                .speechRecognitionLanguage(exercise.getSpeechRecognitionLanguage())
                .minimumAccuracyScore(exercise.getMinimumAccuracyScore())
                .createdAt(exercise.getCreatedAt())
                .updatedAt(exercise.getUpdatedAt())
                .build();
    }

    private SpeechExerciseResultResponse mapToResultResponse(SpeechExerciseResult result) {
        return SpeechExerciseResultResponse.builder()
                .id(result.getId())
                .exerciseId(result.getExercise().getId())
                .targetText(result.getTargetText())
                .recognizedText(result.getRecognizedText())
                .studentAudioUrl(result.getStudentAudioUrl())
                .accuracyScore(result.getAccuracyScore())
                .confidenceScore(result.getConfidenceScore())
                .pronunciationFeedback(result.getPronunciationFeedback())
                .isPassed(result.getIsPassed())
                .attemptNumber(result.getAttemptNumber())
                .timeSpentSeconds(result.getTimeSpentSeconds())
                .createdAt(result.getCreatedAt())
                .exerciseTitle(result.getExercise().getTitle())
                .difficultyLevel(result.getExercise().getDifficultyLevel())
                .build();
    }

    private int getNextAttemptNumber(Student student, Exercise exercise) {
        List<SpeechExerciseResult> previousResults = speechExerciseResultRepository
                .findByStudentAndExercise(student, exercise);
        return previousResults.size() + 1;
    }

    private int[] calculateStreaks(List<SpeechExerciseResult> results) {
        int currentStreak = 0;
        int longestStreak = 0;
        int tempStreak = 0;

        // Sort by date descending to get recent results first
        results.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        for (SpeechExerciseResult result : results) {
            if (result.getIsPassed()) {
                tempStreak++;
                if (currentStreak == 0) {
                    currentStreak = tempStreak;
                }
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                if (currentStreak == tempStreak) {
                    currentStreak = 0;
                }
                tempStreak = 0;
            }
        }

        return new int[]{currentStreak, longestStreak};
    }
}