import api from '../lib/api';

// Course For Learning Response Types
export interface CourseForLearningResponse {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  level: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  tutor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    bio?: string;
    averageRating?: number;
    totalReviews?: number;
  };
  lessons: LessonForLearning[];
  studentProgress: StudentProgress;
  enrollmentId: number;
  enrolledAt: string;
}

// Lesson For Learning Types
export interface LessonForLearning {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  orderIndex: number;
  exercises: ExerciseForLearning[];
  isCompleted: boolean;
  completedAt?: string;
}

// Exercise For Learning Types
export interface ExerciseForLearning {
  id: number;
  title: string;
  description: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'TRANSLATION' | 'LISTENING' | 'SPEAKING';
  questions: QuestionForLearning[];
  timeLimit?: number;
  passingScore: number;
  orderIndex: number;
}

// Question For Learning Types
export interface QuestionForLearning {
  id: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'TRANSLATION' | 'LISTENING' | 'SPEAKING';
  audioUrl?: string;
  imageUrl?: string;
  options: QuestionOptionForLearning[];
  orderIndex: number;
  points: number;
}

// Question Option For Learning Types
export interface QuestionOptionForLearning {
  id: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

// Student Progress Types
export interface StudentProgress {
  enrollmentId: number;
  courseId: number;
  studentId: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  currentLessonId?: number;
  lastAccessedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

// Message Response Interface
export interface MessageResponse {
  message: string;
  success?: boolean;
  timestamp?: string;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const LearningService = {
  /**
   * Get course for learning with student progress
   * @param courseId Course ID to get for learning
   * @returns Complete course information for learning
   */
  getCourseForLearning: async (courseId: number): Promise<CourseForLearningResponse> => {
    try {
      const response = await api.get<CourseForLearningResponse>(`/learning/courses/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Mark lesson as completed
   * @param lessonId Lesson ID to mark as completed
   * @param courseId Course ID that contains the lesson
   * @returns Success message
   */
  markLessonAsCompleted: async (lessonId: number, courseId: number): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>(
        `/learning/lessons/${lessonId}/complete?courseId=${courseId}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get student's current progress for a course
   * @param courseId Course ID to get progress for
   * @returns Student progress information
   */
  getStudentProgress: async (courseId: number): Promise<StudentProgress> => {
    try {
      // This endpoint might be part of enrollment service, but we'll include it here for convenience
      const response = await api.get<StudentProgress>(`/learning/courses/${courseId}/progress`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Update student's last accessed lesson
   * @param courseId Course ID
   * @param lessonId Lesson ID that was accessed
   * @returns Success message
   */
  updateLastAccessed: async (courseId: number, lessonId: number): Promise<MessageResponse> => {
    try {
      const response = await api.put<MessageResponse>(
        `/learning/courses/${courseId}/last-accessed`,
        { lessonId }
      );
      return response.data;
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

  return new Error(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
};

export default LearningService;