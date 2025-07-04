package com.jplearning.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface SpeechRecognitionService {
    /**
     * Recognize speech from audio file using SpeechNote API
     *
     * @param audioFile Audio file containing speech
     * @param language Language code (default: "ja-JP" for Japanese)
     * @return Recognized text
     * @throws IOException If an I/O error occurs
     */
    String recognizeSpeech(MultipartFile audioFile, String language) throws IOException;

    /**
     * Calculate accuracy score between target text and recognized text
     *
     * @param targetText Target Japanese text
     * @param recognizedText Recognized Japanese text
     * @return Accuracy score between 0.0 and 1.0
     */
    double calculateAccuracyScore(String targetText, String recognizedText);

    /**
     * Generate pronunciation feedback using Gemini AI
     *
     * @param targetText Target Japanese text
     * @param recognizedText Recognized Japanese text
     * @return AI feedback on pronunciation
     * @throws IOException If an I/O error occurs
     */
    String generatePronunciationFeedback(String targetText, String recognizedText) throws IOException;
}