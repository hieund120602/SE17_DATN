// Export all services from a central location for easier imports

// Core services
export { default as CourseService } from './course-service';
export { default as UserService } from './user-service';
export { default as EnrollmentService } from './enrollment-service';
export { default as PaymentService } from './payment-service';
export { default as DiscussionService } from './discussion-service';
export { default as NotificationService } from './notification-service';

// AI and Content services
export { default as AiContentService } from './ai-content-service';
export { default as SpeechExerciseService } from './speech-exercise-service';

// File and Upload services
export { default as FileUploadService } from './file-upload-service';

// Newsletter and Marketing services
export { default as NewsletterService } from './newsletter-service';

// Management and Admin services
export { default as ComboService } from './combo-service';
export { default as VoucherService } from './voucher-service';
export { default as LevelsService } from './levels-service';
export { default as TutorCourseService } from './tutor-course-service';
export { default as ProfileService } from './profile-service';

// New services added
export { default as StatisticsService } from './statistics-service';
export { default as UserManagementService } from './user-management-service';
export { default as LearningService } from './learning-service';
export { default as TutorService } from './tutor-service';
export { default as AdminUserService } from './admin-user-service';
export { default as DocumentService } from './document-service';
export { default as LessonService } from './lesson-service';

// Auth service (from lib)
export { default as AuthService } from '../lib/auth-service';

// Export commonly used types
export type {
  // Statistics types
  DashboardStatisticsResponse,
  PaymentStatisticsResponse,
  PaymentHistoryResponse
} from './statistics-service';

export type {
  // User Management types
  UserResponse,
  MessageResponse
} from './user-management-service';

export type {
  // Learning types
  CourseForLearningResponse,
  StudentProgress,
  LessonForLearning
} from './learning-service';

export type {
  // Document types
  ResourceResponse,
  DocumentAccessResponse
} from './document-service';

export type {
  // Lesson types
  LessonResponse,
  ExerciseResponse,
  QuestionResponse
} from './lesson-service';

export type {
  // Pagination type
  PaginationResponse
} from './admin-user-service';