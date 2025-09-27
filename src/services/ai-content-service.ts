import api from '@/lib/api';

export interface ExerciseGenerationRequest {
  topic: string;
  level: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  exerciseType: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'MATCHING' | 'LISTENING' | 'SPEAKING';
  questionCount: number;
  instructions?: string;
}

export interface ListeningExerciseRequest {
  topic: string;
  level: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  duration: number; // in seconds
  speakingSpeed: 'SLOW' | 'NORMAL' | 'FAST';
  includeScript: boolean;
  instructions?: string;
}

export interface GeneratedQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface GeneratedExerciseResponse {
  title: string;
  description: string;
  instructions: string;
  questions: GeneratedQuestion[];
  estimatedTime: number;
  difficulty: string;
}

export interface GeneratedListeningExerciseResponse {
  title: string;
  description: string;
  instructions: string;
  audioUrl: string;
  script?: string;
  questions: GeneratedQuestion[];
  duration: number;
  difficulty: string;
}

export interface GeneratedContentResponse {
  title: string;
  content: string;
  keyPoints: string[];
  vocabulary: {
    word: string;
    reading: string;
    meaning: string;
  }[];
  grammar: {
    pattern: string;
    explanation: string;
    examples: string[];
  }[];
  exercises: GeneratedQuestion[];
}

const AiContentService = {
  /**
   * Generate exercise content using AI
   * @param request Exercise generation request
   * @returns Generated exercise content
   */
  generateExercise: async (request: ExerciseGenerationRequest): Promise<GeneratedExerciseResponse> => {
    const response = await api.post<GeneratedExerciseResponse>('/ai-content/exercises', request);
    return response.data;
  },

  /**
   * Generate listening exercise with audio using AI
   * @param request Listening exercise generation request
   * @returns Generated listening exercise content
   */
  generateListeningExercise: async (request: ListeningExerciseRequest): Promise<GeneratedListeningExerciseResponse> => {
    const response = await api.post<GeneratedListeningExerciseResponse>('/ai-content/listening-exercises', request);
    return response.data;
  },

  /**
   * Generate lesson content using AI
   * @param topic Topic for the lesson
   * @param level Difficulty level
   * @returns Generated lesson content
   */
  generateLessonContent: async (topic: string, level: string): Promise<GeneratedContentResponse> => {
    const response = await api.get<GeneratedContentResponse>('/ai-content/lesson-content', {
      params: { topic, level }
    });
    return response.data;
  }
};

export default AiContentService; 