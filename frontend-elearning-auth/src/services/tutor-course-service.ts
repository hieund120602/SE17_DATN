import api from '@/lib/api';
import { Course, PaginationResponse } from '@/services/course-service';

// Types needed for course creation/update
export interface CourseCreateUpdateRequest {
  title: string;
  description: string;
  levelId: number;
  courseOverview: string;
  courseContent: string;
  price: number;
  thumbnailUrl: string;
  includesDescription: string;
  modules: ModuleRequest[];
}

export interface ModuleRequest {
  title: string;
  durationInMinutes: number;
  position: number;
  lessons: LessonRequest[];
}

export interface LessonRequest {
  title: string;
  description: string;
  videoUrl: string;
  durationInMinutes: number;
  content: string;
  position: number;
  resources: ResourceRequest[];
  exercises: ExerciseRequest[];
}

export interface ResourceRequest {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
}

export interface ExerciseRequest {
  title: string;
  description: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'MATCHING';
  questions: QuestionRequest[];
}

export interface QuestionRequest {
  content: string;
  hint: string;
  correctAnswer: string;
  answerExplanation: string;
  points: number;
  options: QuestionOptionRequest[];
}

export interface QuestionOptionRequest {
  content: string;
  correct: boolean;
}

/**
 * Service for managing courses as a tutor
 */
const TutorCourseService = {
  /**
   * Get all courses created by the authenticated tutor
   * @param page Page number, starting from 0
   * @param size Number of items per page
   * @param sortBy Field to sort by
   * @param direction Sort direction (asc or desc)
   */
  getAllCourses: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Course>> => {
    const response = await api.get<PaginationResponse<Course>>(
      `/tutor/courses?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  /**
   * Get details of a specific course by ID
   * @param courseId ID of the course
   */
  getCourseById: async (courseId: number): Promise<Course> => {
    const response = await api.get<Course>(`/tutor/courses/${courseId}`);
    return response.data;
  },

  /**
   * Create a new course as a tutor
   * @param courseData Course data to create
   */
  createCourse: async (courseData: CourseCreateUpdateRequest): Promise<Course> => {
    const response = await api.post<Course>('/tutor/courses', courseData);
    return response.data;
  },

  /**
   * Update an existing course
   * @param courseId ID of the course
   * @param courseData Updated course data
   */
  updateCourse: async (courseId: number, courseData: CourseCreateUpdateRequest): Promise<Course> => {
    const response = await api.put<Course>(`/tutor/courses/${courseId}`, courseData);
    return response.data;
  },

  /**
   * Delete a course
   * @param courseId ID of the course
   */
  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete(`/tutor/courses/${courseId}`);
  },

  /**
   * Submit a course for admin approval
   * @param courseId ID of the course
   */
  submitCourseForApproval: async (courseId: number): Promise<Course> => {
    const response = await api.post<Course>(`/tutor/courses/${courseId}/submit`);
    return response.data;
  }
};

export default TutorCourseService;