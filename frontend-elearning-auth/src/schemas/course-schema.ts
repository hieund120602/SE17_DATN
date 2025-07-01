import { z } from 'zod';

// Question option schema
export const questionOptionSchema = z.object({
  content: z.string().min(1, 'Nội dung lựa chọn là bắt buộc'),
  correct: z.boolean().default(false),
});

// Question schema
export const questionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi là bắt buộc'),
  hint: z.string().optional(),
  correctAnswer: z.string().optional(),
  answerExplanation: z.string().min(1, 'Giải thích đáp án là bắt buộc'),
  points: z.number().min(1, 'Điểm số phải lớn hơn 0').default(1),
  options: z.array(questionOptionSchema).min(2, 'Phải có ít nhất 2 lựa chọn'),
});

// Exercise schema
export const exerciseSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài tập là bắt buộc'),
  description: z.string().min(1, 'Mô tả bài tập là bắt buộc'),
  type: z.enum(['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING']),
  questions: z.array(questionSchema).min(1, 'Phải có ít nhất 1 câu hỏi'),
});

// Resource schema
export const resourceSchema = z.object({
  title: z.string().min(1, 'Tiêu đề tài liệu là bắt buộc'),
  description: z.string().min(1, 'Mô tả tài liệu là bắt buộc'),
  fileUrl: z.string().min(1, 'URL tài liệu là bắt buộc'),
  fileType: z.string().min(1, 'Loại tài liệu là bắt buộc'),
});

// Lesson schema
export const lessonSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài học là bắt buộc'),
  description: z.string().min(1, 'Mô tả bài học là bắt buộc'),
  videoUrl: z.string().min(1, 'Video bài học là bắt buộc'),
  durationInMinutes: z.number().min(1, 'Thời lượng phải lớn hơn 0'),
  content: z.string().min(1, 'Nội dung bài học là bắt buộc'),
  position: z.number().min(0),
  resources: z.array(resourceSchema),
  exercises: z.array(exerciseSchema),
});

// Module schema
export const moduleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề module là bắt buộc'),
  durationInMinutes: z.number().optional(),
  position: z.number().min(0),
  lessons: z.array(lessonSchema).min(1, 'Module phải có ít nhất một bài học'),
});

// Course form schema
export const courseFormSchema = z.object({
  title: z.string().min(3, 'Tiêu đề khóa học phải có ít nhất 3 kí tự'),
  description: z.string().min(10, 'Mô tả khóa học phải có ít nhất 10 kí tự'),
  levelId: z.number({
    required_error: 'Vui lòng chọn cấp độ khóa học',
    invalid_type_error: 'Cấp độ khóa học là bắt buộc',
  }),
  courseOverview: z.string().min(10, 'Tổng quan khóa học phải có ít nhất 10 kí tự'),
  courseContent: z.string().min(10, 'Nội dung khóa học phải có ít nhất 10 kí tự'),
  price: z.number().min(0, 'Giá khóa học không được âm'),
  thumbnailUrl: z.string().min(1, 'Hình thu nhỏ khóa học là bắt buộc'),
  includesDescription: z.string().min(10, 'Mô tả nội dung bao gồm phải có ít nhất 10 kí tự'),
  modules: z.array(moduleSchema).min(1, 'Khóa học phải có ít nhất một module'),
});

// Inferred types from zod schemas
export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type CourseFormValues = z.infer<typeof courseFormSchema>;

// Types for the Level entity
export interface Level {
  id: number;
  name: string;
  description?: string;
}

// Type for Create Course Mutation response
export interface CreateCourseResponse {
  id: number;
  title: string;
  description: string;
  levelId: number;
  level?: Level;
  courseOverview: string;
  courseContent: string;
  price: number;
  thumbnailUrl: string;
  includesDescription: string;
  modules: Module[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}