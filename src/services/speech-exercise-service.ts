import api from "@/lib/api";

// Types for Speech Exercise
export interface SpeechExercise {
  id: number;
  title: string;
  description: string;
  type: 'LISTENING' | 'SPEAKING' | 'SPEECH_RECOGNITION' | 'PRONUNCIATION';
  targetText: string;
  targetAudioUrl?: string;
  difficultyLevel: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  speechRecognitionLanguage: string;
  minimumAccuracyScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpeechExerciseResult {
  id: number;
  studentId: number;
  exerciseId: number;
  targetText: string;
  recognizedText: string;
  studentAudioUrl?: string;
  accuracyScore: number;
  confidenceScore: number;
  pronunciationFeedback?: string;
  isPass: boolean;
  attemptNumber: number;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface SpeechExerciseStats {
  totalAttempts: number;
  totalPassed: number;
  averageAccuracyScore: number;
  bestAccuracyScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  lastAttemptDate?: string;
}

export interface CreateSpeechExerciseRequest {
  title: string;
  description: string;
  type: 'LISTENING' | 'SPEAKING' | 'SPEECH_RECOGNITION' | 'PRONUNCIATION';
  targetText: string;
  targetAudioUrl?: string;
  difficultyLevel: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  speechRecognitionLanguage?: string;
  minimumAccuracyScore?: number;
}

export interface UpdateSpeechExerciseRequest {
  title?: string;
  description?: string;
  targetText?: string;
  targetAudioUrl?: string;
  difficultyLevel?: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  minimumAccuracyScore?: number;
}

export interface SubmitSpeechExerciseRequest {
  recognizedText: string;
  confidenceScore: number;
  timeSpentSeconds: number;
}

export interface SubmitSpeechExerciseWithAudioRequest extends SubmitSpeechExerciseRequest {
  audioFile: File;
}

export interface PaginationResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: any;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: any;
  empty: boolean;
}

const SpeechExerciseService = {
  // ====================
  // TUTOR APIs (Create and Manage Exercises)
  // ====================

  /**
   * Create a new speech exercise for a lesson
   * @param lessonId The lesson ID to add the exercise to
   * @param exerciseData The exercise data
   */
  createSpeechExercise: async (lessonId: number, exerciseData: CreateSpeechExerciseRequest): Promise<SpeechExercise> => {
    const response = await api.post<SpeechExercise>(`/speech-exercises/lessons/${lessonId}`, exerciseData);
    return response.data;
  },

  /**
   * Update an existing speech exercise
   * @param exerciseId The exercise ID to update
   * @param exerciseData The updated exercise data
   */
  updateSpeechExercise: async (exerciseId: number, exerciseData: UpdateSpeechExerciseRequest): Promise<SpeechExercise> => {
    const response = await api.put<SpeechExercise>(`/speech-exercises/${exerciseId}`, exerciseData);
    return response.data;
  },

  /**
   * Delete a speech exercise
   * @param exerciseId The exercise ID to delete
   */
  deleteSpeechExercise: async (exerciseId: number): Promise<void> => {
    await api.delete(`/speech-exercises/${exerciseId}`);
  },

  // ====================
  // STUDENT APIs (Take Exercises)
  // ====================

  /**
   * Get all speech exercises for a lesson
   * @param lessonId The lesson ID
   */
  getSpeechExercisesByLesson: async (lessonId: number): Promise<SpeechExercise[]> => {
    const response = await api.get<SpeechExercise[]>(`/speech-exercises/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Get details of a specific speech exercise
   * @param exerciseId The exercise ID
   */
  getSpeechExerciseById: async (exerciseId: number): Promise<SpeechExercise> => {
    const response = await api.get<SpeechExercise>(`/speech-exercises/${exerciseId}`);
    return response.data;
  },

  /**
   * Submit a speech exercise result (text only)
   * @param exerciseId The exercise ID
   * @param submission The submission data
   */
  submitSpeechExercise: async (exerciseId: number, submission: SubmitSpeechExerciseRequest): Promise<SpeechExerciseResult> => {
    // Include exerciseId in the submission object
    const requestWithId = {
      ...submission,
      exerciseId
    };
    const response = await api.post<SpeechExerciseResult>(`/speech-exercises/${exerciseId}/submit`, requestWithId);
    return response.data;
  },

  /**
   * Submit a speech exercise result with audio file
   * @param exerciseId The exercise ID
   * @param submission The submission data with audio
   */
  submitSpeechExerciseWithAudio: async (exerciseId: number, submission: SubmitSpeechExerciseWithAudioRequest): Promise<SpeechExerciseResult> => {
    const formData = new FormData();
    formData.append('recognizedText', submission.recognizedText);
    formData.append('confidenceScore', submission.confidenceScore.toString());
    formData.append('timeSpentSeconds', submission.timeSpentSeconds.toString());
    formData.append('audioFile', submission.audioFile);

    console.log(`🔍 Submitting audio file of type:`, submission.audioFile.type, 'size:', submission.audioFile.size);

    // Remove leading slash from URL and use correct Content-Type
    const response = await api.post<SpeechExerciseResult>(`speech-exercises/${exerciseId}/submit-with-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all results for a specific speech exercise
   * @param exerciseId The exercise ID
   * @param page Page number (default: 0)
   * @param size Page size (default: 10)
   */
  getSpeechExerciseResults: async (
    exerciseId: number,
    page = 0,
    size = 10
  ): Promise<PaginationResponse<SpeechExerciseResult>> => {
    const response = await api.get<PaginationResponse<SpeechExerciseResult>>(
      `/speech-exercises/${exerciseId}/results?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get all speech exercise results for the current student
   * @param page Page number (default: 0)
   * @param size Page size (default: 10)
   */
  getMyResults: async (page = 0, size = 10): Promise<PaginationResponse<SpeechExerciseResult>> => {
    const response = await api.get<PaginationResponse<SpeechExerciseResult>>(
      `/speech-exercises/my-results?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get speech exercise statistics for the current student
   */
  getMyStats: async (): Promise<SpeechExerciseStats> => {
    const response = await api.get<SpeechExerciseStats>('/speech-exercises/my-stats');
    return response.data;
  },

  // ====================
  // ADMIN APIs (View Student Progress)
  // ====================

  /**
   * Get speech exercise results for a specific student (admin only)
   * @param studentId The student ID
   * @param page Page number (default: 0)
   * @param size Page size (default: 10)
   */
  getStudentResults: async (
    studentId: number,
    page = 0,
    size = 10
  ): Promise<PaginationResponse<SpeechExerciseResult>> => {
    const response = await api.get<PaginationResponse<SpeechExerciseResult>>(
      `/speech-exercises/students/${studentId}/results?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get speech exercise statistics for a specific student (admin only)
   * @param studentId The student ID
   */
  getStudentStats: async (studentId: number): Promise<SpeechExerciseStats> => {
    const response = await api.get<SpeechExerciseStats>(`/speech-exercises/students/${studentId}/stats`);
    return response.data;
  },

  // ====================
  // UTILITY FUNCTIONS
  // ====================

  /**
   * Calculate text similarity between target and recognized text with enhanced Japanese support
   * @param target The target text
   * @param recognized The recognized text
   * @returns Similarity percentage (0-100)
   */
  calculateSimilarity: (target: string, recognized: string): number => {
    // Validate inputs
    if (!target || !recognized) return 0;

    // Normalize Japanese text
    const normalizeJapaneseText = (text: string): string => {
      return text
        .trim()
        .replace(/\s+/g, '') // Remove all whitespace
        .replace(/[。、！？]/g, '') // Remove Japanese punctuation
        .toLowerCase(); // Convert to lowercase
    };

    const normalizedTarget = normalizeJapaneseText(target);
    const normalizedRecognized = normalizeJapaneseText(recognized);

    if (normalizedTarget === normalizedRecognized) {
      return 100;
    }

    // Check if texts are in completely different languages
    const isJapanese = (text: string) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    const targetIsJapanese = isJapanese(normalizedTarget);
    const recognizedIsJapanese = isJapanese(normalizedRecognized);

    // Heavy penalty for different languages
    if (targetIsJapanese !== recognizedIsJapanese) {
      return Math.max(0, 30); // Maximum 30% for wrong language
    }

    // Levenshtein distance calculation
    const matrix = [];
    const targetLength = normalizedTarget.length;
    const recognizedLength = normalizedRecognized.length;

    for (let i = 0; i <= recognizedLength; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= targetLength; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= recognizedLength; i++) {
      for (let j = 1; j <= targetLength; j++) {
        if (normalizedRecognized[i - 1] === normalizedTarget[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    const maxLength = Math.max(targetLength, recognizedLength);
    const distance = matrix[recognizedLength][targetLength];

    if (maxLength === 0) return 100;

    // Convert to similarity percentage
    const similarity = Math.max(0, ((maxLength - distance) / maxLength) * 100);

    // Apply additional penalties for very different lengths
    const lengthDifference = Math.abs(targetLength - recognizedLength);
    const lengthPenalty = Math.min(20, lengthDifference * 2); // Max 20% penalty

    return Math.max(0, Math.round(similarity - lengthPenalty));
  },

  /**
   * Check if browser supports Speech Recognition
   */
  isSpeechRecognitionSupported: (): boolean => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  /**
   * Check if browser supports Speech Synthesis
   */
  isSpeechSynthesisSupported: (): boolean => {
    return 'speechSynthesis' in window;
  },

  /**
   * Get available speech synthesis voices for a specific language
   * @param languageCode The language code (e.g., 'ja-JP')
   */
  getVoicesForLanguage: (languageCode: string): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    return speechSynthesis.getVoices().filter(voice =>
      voice.lang.startsWith(languageCode.split('-')[0])
    );
  }
};

export default SpeechExerciseService;