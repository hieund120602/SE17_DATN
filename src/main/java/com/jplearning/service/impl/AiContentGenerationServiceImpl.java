package com.jplearning.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jplearning.config.SpeechConfig;
import com.jplearning.dto.request.ExerciseGenerationRequest;
import com.jplearning.dto.request.ListeningExerciseRequest;
import com.jplearning.dto.response.*;
import com.jplearning.entity.Exercise;
import com.jplearning.service.AiContentGenerationService;
import com.jplearning.service.CloudinaryService;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiContentGenerationServiceImpl implements AiContentGenerationService {
    private static final Logger logger = LoggerFactory.getLogger(AiContentGenerationServiceImpl.class);

    @Autowired
    private SpeechConfig speechConfig;

    @Autowired
    private CloudinaryService cloudinaryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public GeneratedExerciseResponse generateExercise(ExerciseGenerationRequest request) throws IOException {
        // Create prompt for Gemini based on exercise type
        String prompt;

        switch (request.getType()) {
            case MULTIPLE_CHOICE:
                prompt = createMultipleChoicePrompt(request);
                break;
            case FILL_IN_BLANK:
                prompt = createFillInBlankPrompt(request);
                break;
            case MATCHING:
                prompt = createMatchingPrompt(request);
                break;
            case WRITING:
                prompt = createWritingPrompt(request);
                break;
            default:
                prompt = createGenericExercisePrompt(request);
        }

        // Call Gemini API
        String geminiResponse = callGeminiApi(prompt);

        // Parse response to exercise format
        return parseExerciseResponse(geminiResponse, prompt, request.getType());
    }

    @Override
    public GeneratedListeningExerciseResponse generateListeningExercise(ListeningExerciseRequest request) throws IOException {
        // Create prompt for Gemini to generate listening exercise content
        String prompt = createListeningExercisePrompt(request);

        // Call Gemini API
        String geminiResponse = callGeminiApi(prompt);

        // Parse response and generate audio
        return parseListeningExerciseResponse(geminiResponse, prompt);
    }

    @Override
    public GeneratedContentResponse generateLessonContent(String topic, String level) throws IOException {
        // Create prompt for Gemini to generate lesson content
        String prompt = createLessonContentPrompt(topic, level);

        // Call Gemini API
        String geminiResponse = callGeminiApi(prompt);

        // Parse response to lesson content format
        return parseLessonContentResponse(geminiResponse, prompt);
    }

    // Helper methods for creating prompts

    private String createMultipleChoicePrompt(ExerciseGenerationRequest request) {
        return String.format(
                "Create a Japanese language multiple-choice exercise on the topic: %s, " +
                        "for %s level students. Generate %d questions. " +
                        "For each question, provide the question text in Japanese, hint, 4 options (with one correct answer), " +
                        "the correct answer, and an explanation of the answer. " +
                        "Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Exercise title\",\n" +
                        "  \"description\": \"Brief description of the exercise\",\n" +
                        "  \"questions\": [\n" +
                        "    {\n" +
                        "      \"content\": \"Question text in Japanese\",\n" +
                        "      \"hint\": \"Optional hint\",\n" +
                        "      \"options\": [\n" +
                        "        {\"content\": \"Option 1\", \"correct\": true},\n" +
                        "        {\"content\": \"Option 2\", \"correct\": false},\n" +
                        "        {\"content\": \"Option 3\", \"correct\": false},\n" +
                        "        {\"content\": \"Option 4\", \"correct\": false}\n" +
                        "      ],\n" +
                        "      \"correctAnswer\": \"The correct answer\",\n" +
                        "      \"answerExplanation\": \"Explanation of why this is correct\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}\n\n" +
                        "Additional instructions: %s",
                request.getTopic(),
                request.getLevel(),
                request.getQuestionCount(),
                request.getAdditionalInstructions() != null ? request.getAdditionalInstructions() : ""
        );
    }

    private String createFillInBlankPrompt(ExerciseGenerationRequest request) {
        return String.format(
                "Create a Japanese language fill-in-the-blank exercise on the topic: %s, " +
                        "for %s level students. Generate %d sentences with blanks. " +
                        "For each question, provide the sentence with a blank indicated by '____', " +
                        "the correct word to fill in the blank, and an explanation. " +
                        "Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Exercise title\",\n" +
                        "  \"description\": \"Brief description of the exercise\",\n" +
                        "  \"questions\": [\n" +
                        "    {\n" +
                        "      \"content\": \"Sentence with ____ blank in Japanese\",\n" +
                        "      \"hint\": \"Optional hint\",\n" +
                        "      \"correctAnswer\": \"Word that goes in the blank\",\n" +
                        "      \"answerExplanation\": \"Explanation of why this is correct\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}\n\n" +
                        "Additional instructions: %s",
                request.getTopic(),
                request.getLevel(),
                request.getQuestionCount(),
                request.getAdditionalInstructions() != null ? request.getAdditionalInstructions() : ""
        );
    }

    private String createMatchingPrompt(ExerciseGenerationRequest request) {
        return String.format(
                "Create a Japanese language matching exercise on the topic: %s, " +
                        "for %s level students. Generate %d pairs to match. " +
                        "Each pair should have a Japanese word/phrase and its English meaning. " +
                        "Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Exercise title\",\n" +
                        "  \"description\": \"Brief description of the exercise\",\n" +
                        "  \"questions\": [\n" +
                        "    {\n" +
                        "      \"content\": \"Japanese word/phrase\",\n" +
                        "      \"correctAnswer\": \"English meaning\",\n" +
                        "      \"hint\": \"Optional hint\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}\n\n" +
                        "Additional instructions: %s",
                request.getTopic(),
                request.getLevel(),
                request.getQuestionCount(),
                request.getAdditionalInstructions() != null ? request.getAdditionalInstructions() : ""
        );
    }

    private String createWritingPrompt(ExerciseGenerationRequest request) {
        return String.format(
                "Create a Japanese language writing exercise on the topic: %s, " +
                        "for %s level students. Generate %d writing prompts. " +
                        "For each prompt, provide the writing task in both Japanese and English, " +
                        "a hint or guideline for the student, and an example of a good response. " +
                        "Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Exercise title\",\n" +
                        "  \"description\": \"Brief description of the exercise\",\n" +
                        "  \"questions\": [\n" +
                        "    {\n" +
                        "      \"content\": \"Writing prompt in Japanese\",\n" +
                        "      \"hint\": \"Guidelines or hints for the student\",\n" +
                        "      \"correctAnswer\": \"Example of a good response\",\n" +
                        "      \"answerExplanation\": \"Explanation of the example\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}\n\n" +
                        "Additional instructions: %s",
                request.getTopic(),
                request.getLevel(),
                request.getQuestionCount(),
                request.getAdditionalInstructions() != null ? request.getAdditionalInstructions() : ""
        );
    }

    private String createGenericExercisePrompt(ExerciseGenerationRequest request) {
        return String.format(
                "Create a Japanese language exercise of type %s on the topic: %s, " +
                        "for %s level students. Generate %d questions. " +
                        "Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Exercise title\",\n" +
                        "  \"description\": \"Brief description of the exercise\",\n" +
                        "  \"questions\": [\n" +
                        "    {\n" +
                        "      \"content\": \"Question content in Japanese\",\n" +
                        "      \"hint\": \"Optional hint\",\n" +
                        "      \"correctAnswer\": \"The correct answer\",\n" +
                        "      \"answerExplanation\": \"Explanation of the answer\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}\n\n" +
                        "Additional instructions: %s",
                request.getType(),
                request.getTopic(),
                request.getLevel(),
                request.getQuestionCount(),
                request.getAdditionalInstructions() != null ? request.getAdditionalInstructions() : ""
        );
    }

    private String createListeningExercisePrompt(ListeningExerciseRequest request) {
        String audioTypeDescription;

        switch (request.getAudioType()) {
            case WORD_PRONUNCIATION:
                audioTypeDescription = "individual Japanese words with their pronunciation";
                break;
            case SENTENCE:
                audioTypeDescription = "complete Japanese sentences";
                break;
            case CONVERSATION:
                audioTypeDescription = "a natural Japanese conversation between two people";
                break;
            default:
                audioTypeDescription = "Japanese audio content";
        }

        return String.format(
                "Create a Japanese language listening exercise with %s on the topic: %s, " +
                        "for %s level students. Generate a script for the audio and %d comprehension questions. " +
                        "Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Exercise title\",\n" +
                        "  \"description\": \"Brief description of the exercise\",\n" +
                        "  \"japaneseScript\": \"The complete Japanese script for the audio\",\n" +
                        "  \"englishTranslation\": \"English translation of the script\",\n" +
                        "  \"questions\": [\n" +
                        "    {\n" +
                        "      \"content\": \"Question about the audio content\",\n" +
                        "      \"options\": [\n" +
                        "        {\"content\": \"Option 1\", \"correct\": true},\n" +
                        "        {\"content\": \"Option 2\", \"correct\": false},\n" +
                        "        {\"content\": \"Option 3\", \"correct\": false},\n" +
                        "        {\"content\": \"Option 4\", \"correct\": false}\n" +
                        "      ],\n" +
                        "      \"correctAnswer\": \"The correct answer\",\n" +
                        "      \"answerExplanation\": \"Explanation of the answer\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}\n\n" +
                        "Additional instructions: %s",
                audioTypeDescription,
                request.getTopic(),
                request.getLevel(),
                request.getQuestionCount(),
                request.getAdditionalInstructions() != null ? request.getAdditionalInstructions() : ""
        );
    }

    private String createLessonContentPrompt(String topic, String level) {
        return String.format(
                "Create a complete Japanese language lesson on the topic: %s, " +
                        "for %s level students. Include an overview, main content, vocabulary list, " +
                        "and grammar points. Format your response as JSON with the following structure:\n" +
                        "{\n" +
                        "  \"title\": \"Lesson title\",\n" +
                        "  \"overview\": \"Brief overview of the lesson\",\n" +
                        "  \"content\": \"Main lesson content with explanations\",\n" +
                        "  \"vocabulary\": [\n" +
                        "    {\n" +
                        "      \"japanese\": \"Japanese word\",\n" +
                        "      \"romaji\": \"Romaji pronunciation\",\n" +
                        "      \"english\": \"English meaning\",\n" +
                        "      \"example\": \"Example sentence using the word\"\n" +
                        "    }\n" +
                        "  ],\n" +
                        "  \"grammarPoints\": [\n" +
                        "    {\n" +
                        "      \"pattern\": \"Grammar pattern in Japanese\",\n" +
                        "      \"explanation\": \"Explanation of the grammar point\",\n" +
                        "      \"example\": \"Example sentence using the grammar\",\n" +
                        "      \"englishTranslation\": \"English translation of the example\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}",
                topic, level
        );
    }

    // Helper methods for API calls and parsing responses

    private String callGeminiApi(String prompt) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // Prepare request to Gemini API
            HttpPost httpPost = new HttpPost(speechConfig.getGeminiEndpoint() + ":generateContent");

            // Add API key as query parameter
            httpPost.setURI(java.net.URI.create(httpPost.getURI() + "?key=" + speechConfig.getGeminiApiKey()));

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();

            Map<String, Object> content = new HashMap<>();

            Map<String, Object> part = new HashMap<>();
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

            // Parse JSON response to extract the generated text
            JsonNode rootNode = objectMapper.readTree(responseString);

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

            return "Error: Unable to generate content";
        }
    }

    private GeneratedExerciseResponse parseExerciseResponse(String response, String prompt, Exercise.ExerciseType type) {
        try {
            // Extract JSON from response (in case there's additional text)
            String jsonStr = extractJsonFromResponse(response);

            // Parse JSON
            JsonNode rootNode = objectMapper.readTree(jsonStr);

            // Build response object
            GeneratedExerciseResponse.GeneratedExerciseResponseBuilder builder = GeneratedExerciseResponse.builder()
                    .title(rootNode.has("title") ? rootNode.get("title").asText() : "Exercise")
                    .description(rootNode.has("description") ? rootNode.get("description").asText() : "")
                    .type(type)
                    .promptUsed(prompt);

            // Parse questions
            List<GeneratedQuestionResponse> questions = new ArrayList<>();
            if (rootNode.has("questions") && rootNode.get("questions").isArray()) {
                JsonNode questionsNode = rootNode.get("questions");
                for (JsonNode questionNode : questionsNode) {
                    GeneratedQuestionResponse.GeneratedQuestionResponseBuilder questionBuilder =
                            GeneratedQuestionResponse.builder()
                                    .content(questionNode.has("content") ? questionNode.get("content").asText() : "")
                                    .hint(questionNode.has("hint") ? questionNode.get("hint").asText() : "")
                                    .correctAnswer(questionNode.has("correctAnswer") ?
                                            questionNode.get("correctAnswer").asText() : "")
                                    .answerExplanation(questionNode.has("answerExplanation") ?
                                            questionNode.get("answerExplanation").asText() : "");

                    // Parse options for multiple choice
                    if (questionNode.has("options") && questionNode.get("options").isArray()) {
                        List<Map<String, Object>> options = new ArrayList<>();
                        JsonNode optionsNode = questionNode.get("options");
                        for (JsonNode optionNode : optionsNode) {
                            Map<String, Object> option = new HashMap<>();
                            option.put("content", optionNode.has("content") ?
                                    optionNode.get("content").asText() : "");
                            option.put("correct", optionNode.has("correct") &&
                                    optionNode.get("correct").asBoolean());
                            options.add(option);
                        }
                        questionBuilder.options(options);
                    }

                    questions.add(questionBuilder.build());
                }
            }

            builder.questions(questions);

            return builder.build();
        } catch (Exception e) {
            logger.error("Error parsing exercise response", e);

            // Return a basic error response
            return GeneratedExerciseResponse.builder()
                    .title("Error generating exercise")
                    .description("There was an error generating the exercise content.")
                    .type(type)
                    .questions(new ArrayList<>())
                    .promptUsed(prompt)
                    .build();
        }
    }

    private GeneratedListeningExerciseResponse parseListeningExerciseResponse(String response, String prompt) throws IOException {
        try {
            // Extract JSON from response
            String jsonStr = extractJsonFromResponse(response);

            // Parse JSON
            JsonNode rootNode = objectMapper.readTree(jsonStr);

            // Get script for audio generation
            String japaneseScript = rootNode.has("japaneseScript") ?
                    rootNode.get("japaneseScript").asText() : "";

            // Generate audio using a text-to-speech service or API
            // For this example, we'll mock this by uploading a dummy file to Cloudinary
            String audioUrl = generateAudioForScript(japaneseScript);

            // Build response object
            GeneratedListeningExerciseResponse.GeneratedListeningExerciseResponseBuilder builder =
                    GeneratedListeningExerciseResponse.builder()
                            .title(rootNode.has("title") ? rootNode.get("title").asText() : "Listening Exercise")
                            .description(rootNode.has("description") ? rootNode.get("description").asText() : "")
                            .audioUrl(audioUrl)
                            .japaneseScript(japaneseScript)
                            .englishTranslation(rootNode.has("englishTranslation") ?
                                    rootNode.get("englishTranslation").asText() : "")
                            .promptUsed(prompt);

            // Parse questions
            List<GeneratedQuestionResponse> questions = new ArrayList<>();
            if (rootNode.has("questions") && rootNode.get("questions").isArray()) {
                JsonNode questionsNode = rootNode.get("questions");
                for (JsonNode questionNode : questionsNode) {
                    GeneratedQuestionResponse.GeneratedQuestionResponseBuilder questionBuilder =
                            GeneratedQuestionResponse.builder()
                                    .content(questionNode.has("content") ? questionNode.get("content").asText() : "")
                                    .correctAnswer(questionNode.has("correctAnswer") ?
                                            questionNode.get("correctAnswer").asText() : "")
                                    .answerExplanation(questionNode.has("answerExplanation") ?
                                            questionNode.get("answerExplanation").asText() : "");

                    // Parse options for multiple choice
                    if (questionNode.has("options") && questionNode.get("options").isArray()) {
                        List<Map<String, Object>> options = new ArrayList<>();
                        JsonNode optionsNode = questionNode.get("options");
                        for (JsonNode optionNode : optionsNode) {
                            Map<String, Object> option = new HashMap<>();
                            option.put("content", optionNode.has("content") ?
                                    optionNode.get("content").asText() : "");
                            option.put("correct", optionNode.has("correct") &&
                                    optionNode.get("correct").asBoolean());
                            options.add(option);
                        }
                        questionBuilder.options(options);
                    }

                    questions.add(questionBuilder.build());
                }
            }

            builder.questions(questions);

            return builder.build();
        } catch (Exception e) {
            logger.error("Error parsing listening exercise response", e);

            // Return a basic error response
            return GeneratedListeningExerciseResponse.builder()
                    .title("Error generating listening exercise")
                    .description("There was an error generating the listening exercise content.")
                    .audioUrl("")
                    .japaneseScript("")
                    .questions(new ArrayList<>())
                    .promptUsed(prompt)
                    .build();
        }
    }

    private GeneratedContentResponse parseLessonContentResponse(String response, String prompt) {
        try {
            // Extract JSON from response
            String jsonStr = extractJsonFromResponse(response);

            // Parse JSON
            JsonNode rootNode = objectMapper.readTree(jsonStr);

            // Build response object
            GeneratedContentResponse.GeneratedContentResponseBuilder builder =
                    GeneratedContentResponse.builder()
                            .title(rootNode.has("title") ? rootNode.get("title").asText() : "Japanese Lesson")
                            .overview(rootNode.has("overview") ? rootNode.get("overview").asText() : "")
                            .content(rootNode.has("content") ? rootNode.get("content").asText() : "")
                            .promptUsed(prompt);

            // Parse vocabulary
            List<VocabularyItem> vocabulary = new ArrayList<>();
            if (rootNode.has("vocabulary") && rootNode.get("vocabulary").isArray()) {
                JsonNode vocabularyNode = rootNode.get("vocabulary");
                for (JsonNode wordNode : vocabularyNode) {
                    VocabularyItem item = VocabularyItem.builder()
                            .japanese(wordNode.has("japanese") ? wordNode.get("japanese").asText() : "")
                            .romaji(wordNode.has("romaji") ? wordNode.get("romaji").asText() : "")
                            .english(wordNode.has("english") ? wordNode.get("english").asText() : "")
                            .example(wordNode.has("example") ? wordNode.get("example").asText() : "")
                            .build();
                    vocabulary.add(item);
                }
            }
            builder.vocabulary(vocabulary);

            // Parse grammar points
            List<GrammarPoint> grammarPoints = new ArrayList<>();
            if (rootNode.has("grammarPoints") && rootNode.get("grammarPoints").isArray()) {
                JsonNode grammarNode = rootNode.get("grammarPoints");
                for (JsonNode pointNode : grammarNode) {
                    GrammarPoint point = GrammarPoint.builder()
                            .pattern(pointNode.has("pattern") ? pointNode.get("pattern").asText() : "")
                            .explanation(pointNode.has("explanation") ? pointNode.get("explanation").asText() : "")
                            .example(pointNode.has("example") ? pointNode.get("example").asText() : "")
                            .englishTranslation(pointNode.has("englishTranslation") ?
                                    pointNode.get("englishTranslation").asText() : "")
                            .build();
                    grammarPoints.add(point);
                }
            }
            builder.grammarPoints(grammarPoints);

            return builder.build();
        } catch (Exception e) {
            logger.error("Error parsing lesson content response", e);

            // Return a basic error response
            return GeneratedContentResponse.builder()
                    .title("Error generating lesson content")
                    .overview("There was an error generating the lesson content.")
                    .content("")
                    .vocabulary(new ArrayList<>())
                    .grammarPoints(new ArrayList<>())
                    .promptUsed(prompt)
                    .build();
        }
    }

    // Helper utility methods

    private String extractJsonFromResponse(String response) {
        // Find the first occurrence of '{'
        int start = response.indexOf('{');
        if (start == -1) {
            return "{}"; // Return empty JSON if no JSON found
        }

        // Find the matching closing '}'
        int openBraces = 1;
        int end = start + 1;
        while (end < response.length() && openBraces > 0) {
            char c = response.charAt(end);
            if (c == '{') {
                openBraces++;
            } else if (c == '}') {
                openBraces--;
            }
            end++;
        }

        if (openBraces != 0) {
            return "{}"; // Invalid JSON, return empty
        }

        return response.substring(start, end);
    }

    private String generateAudioForScript(String japaneseScript) throws IOException {
        // In a real implementation, you would use a text-to-speech API here
        // For this example, we'll create a dummy file and upload it to Cloudinary

        // Create a mock audio file with the script as content
        byte[] audioBytes = japaneseScript.getBytes();
        MultipartFile audioFile = new MockMultipartFile(
                "audio.mp3",
                "audio.mp3",
                "audio/mpeg",
                audioBytes);

        // Upload to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadFile(audioFile);

        return uploadResult.get("secureUrl");
    }
}