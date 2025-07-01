import api from '@/lib/api';

export interface Level {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TutorInfo {
  id: number;
  fullName: string;
  avatarUrl: string;
  teachingRequirements: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: number;
  content: string;
  correct: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  content: string;
  hint: string;
  correctAnswer: string;
  answerExplanation: string;
  points: number;
  options: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'MATCHING';
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  durationInMinutes: number;
  content: string;
  position: number;
  resources: Resource[];
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
  locked: boolean
}

export interface Module {
  id: number;
  title: string;
  durationInMinutes: number;
  position: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  durationInMinutes: number;
  level: Level;
  lessonCount: number;
  courseOverview: string;
  courseContent: string;
  price: number;
  thumbnailUrl: string;
  includesDescription: string;
  tutor: TutorInfo;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  modules: Module[];
  enrolled: boolean;
  countBuy: number
}

export interface CourseApproval {
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
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

// New interface for learning progress
export interface StudentProgress {
  completedLessons: number[];
  completedExercises: number[];
  lastAccessedLessonId: number;
  overallProgress: number; // percentage completion
}

// Extended course interface with student progress
export interface LearningCourse extends Course {
  progress: StudentProgress;
}

const CourseService = {
  /**
   * Lấy danh sách tất cả khóa học (chỉ admin)
   * @param page Số trang, bắt đầu từ 0
   * @param size Số lượng trên mỗi trang
   * @param sortBy Trường để sắp xếp
   * @param direction Hướng sắp xếp (asc hoặc desc)
   */
  getAllCourses: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Course>> => {
    const response = await api.get<PaginationResponse<Course>>(
      `/admin/courses?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  getPublicCourses: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Course>> => {
    const response = await api.get<PaginationResponse<Course>>(
      `/courses?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  getCoursePublicId: async (courseId: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${courseId}`);
    return response.data;
  },

  /**
   * Lấy danh sách khóa học đang chờ phê duyệt
   * @param page Số trang, bắt đầu từ 0
   * @param size Số lượng trên mỗi trang
   * @param sortBy Trường để sắp xếp
   * @param direction Hướng sắp xếp (asc hoặc desc)
   */
  getPendingCourses: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Course>> => {
    const response = await api.get<PaginationResponse<Course>>(
      `/admin/courses/pending?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết khóa học theo ID
   * @param courseId ID của khóa học
   */
  getCourseById: async (courseId: number): Promise<Course> => {
    const response = await api.get<Course>(`/admin/courses/${courseId}`);
    return response.data;
  },

  /**
   * Phê duyệt hoặc từ chối khóa học
   * @param courseId ID của khóa học
   * @param approvalData Dữ liệu phê duyệt
   */
  approveCourse: async (courseId: number, status: 'APPROVED'): Promise<Course> => {
    const response = await api.put<Course>(`/admin/courses/${courseId}/approval`, {
      status
    });
    return response.data;
  },

  withdrawCourse: async (courseId: number, status: 'DRAFT'): Promise<Course> => {
    const response = await api.put<Course>(`/admin/courses/${courseId}/withdraw`, {
      status
    });
    return response.data;
  },


  /**
   * Từ chối khóa học
   * @param courseId ID của khóa học
   * @param feedback Phản hồi từ chối
   */
  rejectCourse: async (courseId: number, feedback: string): Promise<Course> => {
    const response = await api.put<Course>(`/admin/courses/${courseId}/approval`, {
      status: 'REJECTED',
      feedback
    });
    return response.data;
  },

  /**
   * Xóa khóa học
   * @param courseId ID của khóa học
   */
  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete(`/admin/courses/${courseId}`);
  },

  /**
   * Lấy khóa học cho việc học tập kèm theo tiến độ của học viên
   * @param courseId ID của khóa học
   * @returns Thông tin khóa học đầy đủ với tiến độ học tập của học viên
   */
  getCourseForLearning: async (courseId: number): Promise<LearningCourse> => {
    const response = await api.get<LearningCourse>(`/learning/courses/${courseId}`);
    return response.data;
  },

  /**
   * Đánh dấu bài học đã hoàn thành cho học viên hiện tại
   * @param lessonId ID của bài học cần đánh dấu hoàn thành
   * @param courseId ID của khóa học chứa bài học
   * @returns Thông tin tiến độ học tập đã cập nhật
   */
  markLessonAsCompleted: async (lessonId: number, courseId: number): Promise<StudentProgress> => {
    const response = await api.post<StudentProgress>(
      `/learning/lessons/${lessonId}/complete?courseId=${courseId}`
    );
    return response.data;
  }
};

export default CourseService;