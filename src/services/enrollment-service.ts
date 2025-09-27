import api from '@/lib/api';

export interface Student {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Tutor {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
  teachingRequirements?: string;
}

export interface CourseLevel {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: number;
  title: string;
  durationInMinutes: number;
  position: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  durationInMinutes: number;
  level: CourseLevel;
  lessonCount: number;
  courseOverview: string;
  price: number;
  thumbnailUrl: string;
  includesDescription?: string;
  tutor: Tutor;
  status: string;
  createdAt: string;
  updatedAt: string;
  modules: CourseModule[];
  enrolled: boolean;
}

export interface EnrollmentResponse {
  id: number;
  student: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  course: {
    id: number;
    title: string;
    thumbnailUrl?: string;
  };
  progressPercentage: number;
  completedLessons: number;
  isCompleted: boolean;
  enrolledAt: string;
  completedAt?: string;
}

const EnrollmentService = {
  /**
   * Get all enrollments for current user
   */
  getMyEnrollments: async (): Promise<EnrollmentResponse[]> => {
    const response = await api.get<EnrollmentResponse[]>('/enrollments/my-enrollments');
    return response.data;
  },

  /**
   * Check if user is enrolled in a specific combo
   */
  checkComboEnrollment: async (comboId: number): Promise<boolean> => {
    const response = await api.get<boolean>(`/enrollments/check-combo/${comboId}`);
    return response.data;
  },

  /**
   * Check if user is enrolled in a specific course
   */
  checkCourseEnrollment: async (courseId: number): Promise<boolean> => {
    const response = await api.get<boolean>(`/enrollments/check-course/${courseId}`);
    return response.data;
  },
};

export default EnrollmentService;
