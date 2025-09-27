package com.jplearning.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jplearning.config.SpeechConfig;
import com.jplearning.service.SpeechRecognitionService;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class SpeechRecognitionServiceImpl implements SpeechRecognitionService {
    private static final Logger logger = LoggerFactory.getLogger(SpeechRecognitionServiceImpl.class);

    @Autowired
    private SpeechConfig speechConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String recognizeSpeech(MultipartFile audioFile, String language) throws IOException {
        // Since we're using Web Speech API on frontend, this method will receive
        // the recognized text directly from the frontend
        // For now, return a mock response indicating that recognition should be done on frontend
        logger.info("Speech recognition request received for language: {}", language);

        // This is a placeholder - actual recognition will be done on frontend
        return "Recognition should be done using Web Speech API on frontend";
    }

    @Override
    public double calculateAccuracyScore(String targetText, String recognizedText) {
        if (targetText == null || recognizedText == null || 
            targetText.trim().isEmpty() || recognizedText.trim().isEmpty()) {
            return 0.0;
        }

        // Normalize text: remove spaces, convert to lowercase for comparison
        String normalizedTarget = normalizeJapaneseText(targetText);
        String normalizedRecognized = normalizeJapaneseText(recognizedText);

        // Exact match gets 100%
        if (normalizedTarget.equals(normalizedRecognized)) {
            return 1.0;
        }

        // Check if texts are in completely different languages
        boolean targetIsJapanese = isJapaneseText(normalizedTarget);
        boolean recognizedIsJapanese = isJapaneseText(normalizedRecognized);
        
        // Heavy penalty for different languages
        if (targetIsJapanese != recognizedIsJapanese) {
            return Math.max(0.0, 0.3); // Maximum 30% for wrong language
        }

        // Calculate Levenshtein distance
        int distance = levenshteinDistance(normalizedTarget, normalizedRecognized);

        // Convert to accuracy score (0.0 to 1.0)
        int maxLength = Math.max(normalizedTarget.length(), normalizedRecognized.length());
        if (maxLength == 0) {
            return 1.0; // Both strings are empty
        }

        double accuracy = 1.0 - ((double) distance / maxLength);
        
        // Apply additional penalties for very different lengths
        int lengthDifference = Math.abs(normalizedTarget.length() - normalizedRecognized.length());
        double lengthPenalty = Math.min(0.2, lengthDifference * 0.02); // Max 20% penalty
        
        return Math.max(0.0, accuracy - lengthPenalty); // Ensure non-negative
    }

    @Override
    public String generatePronunciationFeedback(String targetText, String recognizedText) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // Prepare request to Gemini API
            HttpPost httpPost = new HttpPost(speechConfig.getGeminiEndpoint() + ":generateContent");

            // Add API key as query parameter
            httpPost.setURI(java.net.URI.create(httpPost.getURI() + "?key=" + speechConfig.getGeminiApiKey()));

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();

            Map<String, Object> content = new HashMap<>();

            Map<String, Object> part = new HashMap<>();
            String prompt = String.format(
                    "You are a Japanese language tutor evaluating a student's pronunciation. " +
                            "Compare the target Japanese text with what was recognized from their speech. " +
                            "Give specific feedback on pronunciation errors, and suggest improvements. " +
                            "Be concise but helpful, with up to 3 points of feedback. " +
                            "If the texts are similar, provide encouraging feedback and minor improvement suggestions.\n\n" +
                            "Target text: \"%s\"\n" +
                            "Recognized speech: \"%s\"\n\n" +
                            "Feedback in English:",
                    targetText, recognizedText
            );
            part.put("text", prompt);

            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});

            // Set JSON entity
            StringEntity entity = new StringEntity(objectMapper.writeValueAsString(requestBody),
                    ContentType.APPLICATION_JSON);
            httpPost.setEntity(entity);

            // Execute request
            CloseableHttpResponse response = httpClient.execute(httpPost);

            // Process response
            String responseString = EntityUtils.toString(response.getEntity());

            // Parse JSON response
            JsonNode rootNode = objectMapper.readTree(responseString);

            // Extract generated text
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray() &&
                    rootNode.get("candidates").size() > 0) {

                JsonNode firstCandidate = rootNode.get("candidates").get(0);
                if (firstCandidate.has("content") &&
                        firstCandidate.get("content").has("parts") &&
                        firstCandidate.get("content").get("parts").isArray() &&
                        firstCandidate.get("content").get("parts").size() > 0) {

                    JsonNode firstPart = firstCandidate.get("content").get("parts").get(0);
                    if (firstPart.has("text")) {
                        return firstPart.get("text").asText();
                    }
                }
            }

            return generateDefaultFeedback(targetText, recognizedText);
        } catch (Exception e) {
            logger.error("Error generating pronunciation feedback: {}", e.getMessage());
            return generateDefaultFeedback(targetText, recognizedText);
        }
    }

    /**
     * Normalize Japanese text for comparison
     */
    private String normalizeJapaneseText(String text) {
        if (text == null) return "";

        return text
                .replaceAll("\\s+", "") // Remove all whitespace
                .toLowerCase() // Convert to lowercase
                .replaceAll("[。、！？]", "") // Remove Japanese punctuation
                .trim();
    }

    /**
     * Check if text contains Japanese characters
     */
    private boolean isJapaneseText(String text) {
        if (text == null || text.isEmpty()) return false;
        
        // Check for Hiragana, Katakana, and Kanji characters
        return text.matches(".*[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF].*");
    }

    /**
     * Generate default feedback when AI service is unavailable
     */
    private String generateDefaultFeedback(String targetText, String recognizedText) {
        double accuracy = calculateAccuracyScore(targetText, recognizedText);

        if (accuracy >= 0.9) {
            return "Excellent pronunciation! Your speech recognition accuracy is very high. Keep practicing to maintain this level.";
        } else if (accuracy >= 0.7) {
            return "Good pronunciation! There are some minor differences. Try speaking more clearly and at a moderate pace.";
        } else if (accuracy >= 0.5) {
            return "Fair pronunciation. Focus on pronouncing each syllable clearly. Consider listening to native speakers and practicing the sounds that are different.";
        } else {
            return "Keep practicing! Try speaking more slowly and clearly. Focus on individual words first, then combine them into sentences.";
        }
    }

    // Helper method to calculate Levenshtein distance
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    int cost = (s1.charAt(i - 1) != s2.charAt(j - 1)) ? 1 : 0;
                    dp[i][j] = Math.min(
                            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                            dp[i - 1][j - 1] + cost
                    );
                }
            }
        }

        return dp[s1.length()][s2.length()];
    }
}