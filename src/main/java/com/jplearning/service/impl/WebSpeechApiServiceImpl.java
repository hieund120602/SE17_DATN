package com.jplearning.service.impl;

import com.jplearning.dto.request.SpeechExerciseRequest;
import com.jplearning.dto.request.SpeechExerciseSubmissionRequest;
import com.jplearning.dto.request.WebSpeechExerciseRequest;
import com.jplearning.dto.request.WebSpeechSubmissionRequest;
import com.jplearning.dto.response.SpeechExerciseResponse;
import com.jplearning.dto.response.SpeechExerciseResultResponse;
import com.jplearning.dto.response.WebSpeechConfigResponse;
import com.jplearning.entity.Exercise;
import com.jplearning.entity.Student;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.ExerciseRepository;
import com.jplearning.repository.StudentRepository;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.SpeechExerciseService;
import com.jplearning.service.SpeechRecognitionService;
import com.jplearning.service.WebSpeechApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service 
public class WebSpeechApiServiceImpl implements WebSpeechApiService {
    private static final Logger logger = LoggerFactory.getLogger(WebSpeechApiServiceImpl.class);

    @Autowired
    private SpeechExerciseService speechExerciseService;

    @Autowired
    private SpeechRecognitionService speechRecognitionService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public WebSpeechConfigResponse getWebSpeechConfig() {
        return WebSpeechConfigResponse.builder()
                .supportedLanguages(Arrays.asList("ja-JP", "en-US"))
                .defaultLanguage("ja-JP")
                .maxRecordingTime(60)
                .audioFormat("webm")
                .instructions(createInstructions())
                .apiSettings(createApiSettings())
                .grammarRules(createGrammarRules())
                .pronunciationPatterns(getPronunciationPatterns())
                .errorMessages(createErrorMessages())
                .enableContinuous(false)
                .enableInterimResults(true)
                .maxAlternatives(1)
                .confidenceThreshold(0.7)
                .japanesePhonetics(createJapanesePhonetics())
                .build();
    }

    @Override
    public Map<String, Object> startExerciseSession(Long exerciseId, Long studentId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exerciseId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Map<String, Object> session = new HashMap<>();
        session.put("sessionId", UUID.randomUUID().toString());
        session.put("exerciseId", exerciseId);
        session.put("studentId", studentId);
        session.put("exerciseTitle", exercise.getTitle());
        session.put("targetText", exercise.getTargetText());
        session.put("targetAudioUrl", exercise.getTargetAudioUrl());
        session.put("language", exercise.getSpeechRecognitionLanguage());
        session.put("minimumAccuracy", exercise.getMinimumAccuracyScore());
        session.put("difficulty", exercise.getDifficultyLevel());
        session.put("startTime", System.currentTimeMillis());
        session.put("maxAttempts", 3);
        session.put("timeLimit", 60);

        logger.info("Started speech exercise session for student {} and exercise {}", studentId, exerciseId);
        return session;
    }

    @Override
    @Transactional
    public SpeechExerciseResultResponse submitWebSpeechResult(Long exerciseId, WebSpeechSubmissionRequest request, Long studentId) {
        logger.info("Submitting Web Speech result for exercise {} by student {}", exerciseId, studentId);

        try {
            SpeechExerciseSubmissionRequest submissionRequest = new SpeechExerciseSubmissionRequest();
            submissionRequest.setExerciseId(exerciseId);
            submissionRequest.setRecognizedText(request.getRecognizedText());
            submissionRequest.setConfidenceScore(request.getConfidence());
            submissionRequest.setTimeSpentSeconds(request.getDuration() != null ? request.getDuration() / 1000 : null);

            SpeechExerciseResultResponse result = speechExerciseService.submitSpeechExercise(submissionRequest, studentId);
            logger.info("Successfully submitted Web Speech result with ID: {}", result.getId());
            return result;

        } catch (Exception e) {
            logger.error("Error submitting Web Speech result for exercise {} by student {}: {}", 
                        exerciseId, studentId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public SpeechExerciseResultResponse submitWithAudioBlob(Long exerciseId, MultipartFile audioBlob, 
                                                           String recognizedText, Double confidence, 
                                                           Long duration, Long studentId) throws IOException {
        logger.info("Submitting audio blob for exercise {} by student {}", exerciseId, studentId);

        return speechExerciseService.submitSpeechExerciseWithAudio(
                exerciseId, recognizedText, audioBlob, confidence, duration, studentId);
    }

    @Override
    @Transactional
    public SpeechExerciseResponse createListeningExercise(WebSpeechExerciseRequest request, Long tutorId) {
        logger.info("Creating listening exercise for lesson {} by tutor {}", request.getLessonId(), tutorId);

        SpeechExerciseRequest exerciseRequest = convertToSpeechExerciseRequest(request);
        exerciseRequest.setType(Exercise.ExerciseType.LISTENING);

        return speechExerciseService.createSpeechExercise(request.getLessonId(), exerciseRequest, tutorId);
    }

    @Override
    @Transactional
    public SpeechExerciseResponse createSpeakingExercise(WebSpeechExerciseRequest request, Long tutorId) {
        logger.info("Creating speaking exercise for lesson {} by tutor {}", request.getLessonId(), tutorId);

        SpeechExerciseRequest exerciseRequest = convertToSpeechExerciseRequest(request);
        exerciseRequest.setType(Exercise.ExerciseType.SPEAKING);

        return speechExerciseService.createSpeechExercise(request.getLessonId(), exerciseRequest, tutorId);
    }

    @Override
    public List<Map<String, Object>> getPronunciationPatterns() {
        List<Map<String, Object>> patterns = new ArrayList<>();
        
        patterns.add(createPattern("あ", "a", "Open mouth wide, tongue low"));
        patterns.add(createPattern("い", "i", "Lips slightly spread, tongue high"));
        patterns.add(createPattern("う", "u", "Lips slightly rounded, tongue back"));
        patterns.add(createPattern("え", "e", "Mouth half-open, tongue mid"));
        patterns.add(createPattern("お", "o", "Lips rounded, tongue back"));
        
        patterns.add(createPattern("こんにちは", "konnichiwa", "Hello - stress on 'ni'"));
        patterns.add(createPattern("ありがとう", "arigatou", "Thank you - stress on 'ga'"));
        patterns.add(createPattern("おはよう", "ohayou", "Good morning - stress on 'ha'"));
        
        return patterns;
    }

    @Override
    public Map<String, Object> validatePronunciation(String targetText, String recognizedText) {
        logger.info("Validating pronunciation: target='{}', recognized='{}'", targetText, recognizedText);

        double accuracy = speechRecognitionService.calculateAccuracyScore(targetText, recognizedText) * 100;
        
        Map<String, Object> result = new HashMap<>();
        result.put("accuracy", accuracy);
        result.put("passed", accuracy >= 70.0);
        result.put("feedback", generateFeedback(accuracy));
        result.put("suggestions", generateSuggestions(targetText, recognizedText, accuracy));
        
        return result;
    }

    @Override
    public List<Map<String, Object>> getSupportedLanguages() {
        List<Map<String, Object>> languages = new ArrayList<>();
        
        Map<String, Object> japanese = new HashMap<>();
        japanese.put("code", "ja-JP");
        japanese.put("name", "Japanese");
        japanese.put("nativeName", "日本語");
        japanese.put("primary", true);
        
        Map<String, Object> english = new HashMap<>();
        english.put("code", "en-US");
        english.put("name", "English");
        english.put("nativeName", "English");
        english.put("primary", false);
        
        languages.add(japanese);
        languages.add(english);
        
        return languages;
    }

    private Map<String, String> createInstructions() {
        Map<String, String> instructions = new HashMap<>();
        instructions.put("en", "Click the microphone button to start recording. Speak clearly and at a normal pace.");
        instructions.put("ja", "マイクボタンをクリックして録音を開始してください。はっきりと通常のペースで話してください。");
        return instructions;
    }

    private Map<String, Object> createApiSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("continuous", false);
        settings.put("interimResults", true);
        settings.put("maxAlternatives", 1);
        settings.put("lang", "ja-JP");
        return settings;
    }

    private Map<String, Object> createGrammarRules() {
        Map<String, Object> grammar = new HashMap<>();
        grammar.put("hiragana", "あいうえお かきくけこ さしすせそ たちつてと なにぬねの はひふへほ まみむめも やゆよ らりるれろ わをん");
        grammar.put("katakana", "アイウエオ カキクケコ サシスセソ タチツテト ナニヌネノ ハヒフヘホ マミムメモ ヤユヨ ラリルレロ ワヲン");
        grammar.put("common_words", Arrays.asList("こんにちは", "ありがとう", "すみません", "はじめまして"));
        return grammar;
    }

    private Map<String, Object> createErrorMessages() {
        Map<String, Object> errors = new HashMap<>();
        errors.put("not_supported", "Web Speech API is not supported in this browser");
        errors.put("no_speech", "No speech was detected");
        errors.put("aborted", "Speech recognition was aborted");
        errors.put("audio_capture", "Audio capture failed");
        errors.put("network", "Network error occurred");
        return errors;
    }

    private Map<String, Object> createJapanesePhonetics() {
        Map<String, Object> phonetics = new HashMap<>();
        phonetics.put("vowels", Arrays.asList("あ", "い", "う", "え", "お"));
        phonetics.put("consonants", Arrays.asList("か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"));
        phonetics.put("long_vowels", "ー");
        phonetics.put("small_tsu", "っ");
        return phonetics;
    }

    private Map<String, Object> createPattern(String japanese, String romaji, String tip) {
        Map<String, Object> pattern = new HashMap<>();
        pattern.put("japanese", japanese);
        pattern.put("romaji", romaji);
        pattern.put("tip", tip);
        return pattern;
    }

    private SpeechExerciseRequest convertToSpeechExerciseRequest(WebSpeechExerciseRequest webRequest) {
        SpeechExerciseRequest request = new SpeechExerciseRequest();
        request.setTitle(webRequest.getTitle());
        request.setDescription(webRequest.getDescription());
        request.setType(webRequest.getType());
        request.setTargetText(webRequest.getTargetText());
        request.setTargetAudioUrl(webRequest.getTargetAudioUrl());
        request.setDifficultyLevel(webRequest.getDifficultyLevel());
        request.setSpeechRecognitionLanguage(webRequest.getSpeechRecognitionLanguage());
        request.setMinimumAccuracyScore(webRequest.getMinimumAccuracyScore());
        return request;
    }

    private String generateFeedback(double accuracy) {
        if (accuracy >= 90) {
            return "Excellent pronunciation! Keep up the great work!";
        } else if (accuracy >= 80) {
            return "Very good pronunciation! Minor improvements needed.";
        } else if (accuracy >= 70) {
            return "Good pronunciation! Continue practicing for better results.";
        } else if (accuracy >= 60) {
            return "Fair pronunciation. Focus on clarity and pacing.";
        } else {
            return "Keep practicing! Try speaking more slowly and clearly.";
        }
    }

    private List<String> generateSuggestions(String targetText, String recognizedText, double accuracy) {
        List<String> suggestions = new ArrayList<>();
        
        if (accuracy < 70) {
            suggestions.add("Try speaking more slowly");
            suggestions.add("Pronounce each syllable clearly");
            suggestions.add("Practice with the audio sample first");
        } else if (accuracy < 85) {
            suggestions.add("Focus on vowel sounds");
            suggestions.add("Pay attention to pitch accent");
        } else {
            suggestions.add("Excellent work! Try more challenging exercises");
        }
        
        return suggestions;
    }
}