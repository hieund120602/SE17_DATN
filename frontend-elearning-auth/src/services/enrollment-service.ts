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

export interface Enrollment {
  id: number;
  student: Student;
  course: Course;
  progressPercentage: number;
  completedLessons: number;
  lastAccessedLessonId?: number | null;
  finalScore?: number | null;
  pricePaid: number;
  certificateId?: number | null;
  certificateUrl?: string | null;
  expiryDate: string;
  comboId?: number | null;
  voucherCode?: string;
  enrolledAt: string;
  completedAt?: string | null;
  completed: boolean;
}

const EnrollmentService = {
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get<Enrollment[]>('/enrollments/my-enrollments');
    return response.data;
  }
};

export default EnrollmentService;
