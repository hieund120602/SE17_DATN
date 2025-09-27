import api from '../lib/api';

// Lesson Response Interface
export interface LessonResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  orderIndex: number;
  courseId: number;
  courseName: string;
  exercises: ExerciseResponse[];
  resources: ResourceResponse[];
  createdAt: string;
  updatedAt: string;
  // For learning context
  isCompleted?: boolean;
  completedAt?: string;
  canAccess?: boolean;
}

// Exercise Response Interface
export interface ExerciseResponse {
  id: number;
  title: string;
  description: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'TRANSLATION' | 'LISTENING' | 'SPEAKING';
  questions: QuestionResponse[];
  timeLimit?: number;
  passingScore: number;
  orderIndex: number;
  lessonId: number;
}

// Question Response Interface
export interface QuestionResponse {
  id: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'TRANSLATION' | 'LISTENING' | 'SPEAKING';
  audioUrl?: string;
  imageUrl?: string;
  options: QuestionOptionResponse[];
  orderIndex: number;
  points: number;
  exerciseId: number;
}

// Question Option Response Interface
export interface QuestionOptionResponse {
  id: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
  questionId: number;
}

// Resource Response Interface
export interface ResourceResponse {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  mimeType?: string;
  description?: string;
  lessonId?: number;
  createdAt: string;
  updatedAt: string;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const LessonService = {
  /**
   * Get lesson details by ID
   * @param lessonId Lesson ID to get details for
   * @returns Complete lesson information
   */
  getLessonById: async (lessonId: number): Promise<LessonResponse> => {
    try {
      const response = await api.get<LessonResponse>(`/lessons/${lessonId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Upload video for a lesson (Tutor only)
   * @param lessonId Lesson ID to upload video for
   * @param file Video file to upload
   * @returns Updated lesson response with video URL
   */
  uploadLessonVideo: async (lessonId: number, file: File): Promise<LessonResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<LessonResponse>(
        `/lessons/${lessonId}/video`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get lesson video stream URL
   * @param lessonId Lesson ID to get video for
   * @returns Video stream URL or signed URL
   */
  getLessonVideoUrl: async (lessonId: number): Promise<string> => {
    try {
      const lesson = await LessonService.getLessonById(lessonId);

      if (!lesson.videoUrl) {
        throw new Error('Bài học này chưa có video.');
      }

      return lesson.videoUrl;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get lesson resources
   * @param lessonId Lesson ID to get resources for
   * @returns List of lesson resources
   */
  getLessonResources: async (lessonId: number): Promise<ResourceResponse[]> => {
    try {
      const lesson = await LessonService.getLessonById(lessonId);
      return lesson.resources || [];
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get lesson exercises
   * @param lessonId Lesson ID to get exercises for
   * @returns List of lesson exercises
   */
  getLessonExercises: async (lessonId: number): Promise<ExerciseResponse[]> => {
    try {
      const lesson = await LessonService.getLessonById(lessonId);
      return lesson.exercises || [];
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Check if lesson video is accessible
   * @param lessonId Lesson ID to check access for
   * @returns Boolean indicating if video is accessible
   */
  checkVideoAccess: async (lessonId: number): Promise<boolean> => {
    try {
      const lesson = await LessonService.getLessonById(lessonId);
      return lesson.canAccess !== false && !!lesson.videoUrl;
    } catch (error: any) {
      return false;
    }
  },

  /**
   * Get lesson duration in a formatted string
   * @param lessonId Lesson ID to get duration for
   * @returns Formatted duration string (e.g., "15 phút")
   */
  getLessonDuration: async (lessonId: number): Promise<string> => {
    try {
      const lesson = await LessonService.getLessonById(lessonId);
      const duration = lesson.duration;

      if (duration < 60) {
        return `${duration} phút`;
      } else {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        if (minutes === 0) {
          return `${hours} giờ`;
        } else {
          return `${hours} giờ ${minutes} phút`;
        }
      }
    } catch (error: any) {
      throw handleApiError(error);
    }
  }
};

const handleApiError = (error: any): Error => {
  if (error.response && error.response.data) {
    const errorData = error.response.data as ApiError;

    if (errorData.message) {
      return new Error(errorData.message);
    }
  }

  // Handle specific lesson access errors
  if (error.response?.status === 403) {
    return new Error('Bạn không có quyền truy cập bài học này.');
  }

  if (error.response?.status === 404) {
    return new Error('Không tìm thấy bài học.');
  }

  return new Error(error.message || 'Đã xảy ra lỗi khi tải bài học. Vui lòng thử lại sau.');
};

export default LessonService;