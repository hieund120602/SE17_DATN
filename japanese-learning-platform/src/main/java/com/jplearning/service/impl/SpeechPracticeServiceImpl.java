package com.jplearning.service.impl;

import com.jplearning.dto.request.SpeechPracticeRequest;
import com.jplearning.dto.response.SpeechPracticeResponse;
import com.jplearning.dto.response.StudentBriefResponse;
import com.jplearning.entity.*;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.*;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.SpeechPracticeService;
import com.jplearning.service.SpeechRecognitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SpeechPracticeServiceImpl implements SpeechPracticeService {

    @Autowired
    private SpeechPracticeRepository speechPracticeRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private SpeechRecognitionService speechRecognitionService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public SpeechPracticeResponse createPractice(Long studentId, Long lessonId, SpeechPracticeRequest request) {
        // Find student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Find lesson if provided
        Lesson lesson = null;
        if (lessonId != null) {
            lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));
        }

        // Create new speech practice
        SpeechPractice practice = SpeechPractice.builder()
                .targetText(request.getTargetText())
                .targetAudioUrl(request.getTargetAudioUrl())
                .type(request.getType())
                .student(student)
                .lesson(lesson)
                .build();

        // Save practice
        SpeechPractice savedPractice = speechPracticeRepository.save(practice);

        // Return response
        return mapToResponse(savedPractice);
    }

    @Override
    @Transactional
    public SpeechPracticeResponse submitPracticeAudio(Long practiceId, MultipartFile audioFile) throws IOException {
        // Find practice
        SpeechPractice practice = speechPracticeRepository.findById(practiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Speech practice not found with id: " + practiceId));

        // Validate audio file
        if (audioFile == null || audioFile.isEmpty()) {
            throw new BadRequestException("Audio file cannot be empty");
        }

        // Upload audio to Cloudinary for storage
        Map<String, String> uploadResult = cloudinaryService.uploadFile(audioFile);
        String audioUrl = uploadResult.get("secureUrl");

        // Update practice with audio URL
        practice.setStudentAudioUrl(audioUrl);

        // Note: Recognition will be done on frontend using Web Speech API
        // The recognized text will be sent separately via submitRecognitionResult

        // Save updated practice
        SpeechPractice updatedPractice = speechPracticeRepository.save(practice);

        // Return response
        return mapToResponse(updatedPractice);
    }

    /**
     * New method to submit recognition results from frontend
     */
    @Transactional
    public SpeechPracticeResponse submitRecognitionResult(Long practiceId, String recognizedText) throws IOException {
        // Find practice
        SpeechPractice practice = speechPracticeRepository.findById(practiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Speech practice not found with id: " + practiceId));

        // Validate recognized text
        if (recognizedText == null || recognizedText.trim().isEmpty()) {
            throw new BadRequestException("Recognized text cannot be empty");
        }

        // Calculate accuracy score
        double accuracyScore = speechRecognitionService.calculateAccuracyScore(
                practice.getTargetText(), recognizedText);

        // Generate pronunciation feedback
        String feedback = speechRecognitionService.generatePronunciationFeedback(
                practice.getTargetText(), recognizedText);

        // Update practice
        practice.setRecognizedText(recognizedText.trim());
        practice.setAccuracyScore(accuracyScore);
        practice.setPronunciationFeedback(feedback);

        // Save updated practice
        SpeechPractice updatedPractice = speechPracticeRepository.save(practice);

        // Return response
        return mapToResponse(updatedPractice);
    }

    @Override
    public SpeechPracticeResponse getPracticeById(Long practiceId) {
        SpeechPractice practice = speechPracticeRepository.findById(practiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Speech practice not found with id: " + practiceId));

        return mapToResponse(practice);
    }

    @Override
    public Page<SpeechPracticeResponse> getStudentPractices(Long studentId, Pageable pageable) {
        // Find student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Get practices
        Page<SpeechPractice> practices = speechPracticeRepository.findByStudent(student, pageable);

        // Map to responses
        return practices.map(this::mapToResponse);
    }

    @Override
    public List<SpeechPracticeResponse> getRecentPractices(Long studentId) {
        // Find student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Get recent practices
        List<SpeechPractice> practices = speechPracticeRepository.findTop10ByStudentOrderByCreatedAtDesc(student);

        // Map to responses
        return practices.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper method to map entity to response
    private SpeechPracticeResponse mapToResponse(SpeechPractice practice) {
        StudentBriefResponse studentResponse = null;
        if (practice.getStudent() != null) {
            studentResponse = StudentBriefResponse.builder()
                    .id(practice.getStudent().getId())
                    .fullName(practice.getStudent().getFullName())
                    .email(practice.getStudent().getEmail())
                    .avatarUrl(practice.getStudent().getAvatarUrl())
                    .build();
        }

        Long lessonId = practice.getLesson() != null ? practice.getLesson().getId() : null;

        return SpeechPracticeResponse.builder()
                .id(practice.getId())
                .targetText(practice.getTargetText())
                .targetAudioUrl(practice.getTargetAudioUrl())
                .studentAudioUrl(practice.getStudentAudioUrl())
                .recognizedText(practice.getRecognizedText())
                .accuracyScore(practice.getAccuracyScore())
                .pronunciationFeedback(practice.getPronunciationFeedback())
                .type(practice.getType())
                .student(studentResponse)
                .lessonId(lessonId)
                .createdAt(practice.getCreatedAt())
                .updatedAt(practice.getUpdatedAt())
                .isCompleted(practice.getRecognizedText() != null && !practice.getRecognizedText().isEmpty())
                .build();
    }
}