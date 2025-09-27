// File: src/schemas/course-schema.ts
// PATCH: Cập nhật để hỗ trợ Speech Exercise

import { z } from 'zod';

// Question option schema (không thay đổi)
export const questionOptionSchema = z.object({
  content: z.string().min(1, 'Nội dung lựa chọn là bắt buộc'),
  correct: z.boolean().default(false),
});

// Question schema (không thay đổi)
export const questionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi là bắt buộc'),
  hint: z.string().optional(),
  correctAnswer: z.string().optional(),
  answerExplanation: z.string().min(1, 'Giải thích đáp án là bắt buộc'),
  points: z.number().min(1, 'Điểm số phải lớn hơn 0').default(1),
  options: z.array(questionOptionSchema).min(2, 'Phải có ít nhất 2 lựa chọn'),
});

// CẬP NHẬT: Exercise schema - thêm hỗ trợ Speech Exercise
export const exerciseSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài tập là bắt buộc'),
  description: z.string().min(1, 'Mô tả bài tập là bắt buộc'),

  // THÊM: Các loại bài tập Speech
  type: z.enum([
    'MULTIPLE_CHOICE',
    'FILL_IN_THE_BLANK',
    'MATCHING',
    // Speech exercise types
    'LISTENING',
    'SPEAKING',
    'SPEECH_RECOGNITION',
    'PRONUNCIATION'
  ]),

  // Traditional exercise fields (optional cho Speech exercises)
  questions: z.array(questionSchema).optional(),

  // THÊM: Speech exercise specific fields
  targetText: z.string().optional(),
  targetAudioUrl: z.string().url().optional().or(z.literal('')),
  difficultyLevel: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional().default('BEGINNER'),
  speechRecognitionLanguage: z.string().optional().default('ja-JP'),
  minimumAccuracyScore: z.number().min(0).max(100).optional().default(70),
}).superRefine((data, ctx) => {
  // Validation logic based on exercise type
  const speechTypes = ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'];
  const traditionalTypes = ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING'];

  if (speechTypes.includes(data.type)) {
    // Speech exercises must have targetText
    if (!data.targetText || data.targetText.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bài tập Speech cần có nội dung mục tiêu",
        path: ["targetText"]
      });
    }
  } else if (traditionalTypes.includes(data.type)) {
    // Traditional exercises must have questions with valid content
    if (!data.questions || data.questions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bài tập truyền thống cần có ít nhất một câu hỏi",
        path: ["questions"]
      });
    } else {
      // Check if all questions have valid content
      data.questions.forEach((question, index) => {
        if (!question.content || question.content.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nội dung câu hỏi là bắt buộc",
            path: ["questions", index, "content"]
          });
        }
        if (!question.answerExplanation || question.answerExplanation.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Giải thích đáp án là bắt buộc",
            path: ["questions", index, "answerExplanation"]
          });
        }
      });
    }
  }
});

// Resource schema (không thay đổi)
export const resourceSchema = z.object({
  title: z.string().min(1, 'Tiêu đề tài liệu là bắt buộc'),
  description: z.string().min(1, 'Mô tả tài liệu là bắt buộc'),
  fileUrl: z.string().min(1, 'URL tài liệu là bắt buộc'),
  fileType: z.string().min(1, 'Loại tài liệu là bắt buộc'),
});

// Lesson schema (không thay đổi)
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

// Module schema (không thay đổi)
export const moduleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề module là bắt buộc'),
  durationInMinutes: z.number().optional(),
  position: z.number().min(0),
  lessons: z.array(lessonSchema).min(1, 'Module phải có ít nhất một bài học'),
});

// Course form schema (không thay đổi)
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

// Types for the Level entity (không thay đổi)
export interface Level {
  id: number;
  name: string;
  description?: string;
}

// THÊM: Extended exercise type with speech exercise properties
export interface SpeechExercise extends Exercise {
  targetText: string;
  targetAudioUrl?: string;
  difficultyLevel: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  speechRecognitionLanguage: string;
  minimumAccuracyScore: number;
}

// Type for Create Course Mutation response (không thay đổi)
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

// THÊM: Update schemas with optional ID fields
export const updateQuestionOptionSchema = z.object({
  content: z.string().min(1, 'Nội dung lựa chọn là bắt buộc'),
  correct: z.boolean().default(false),
  id: z.number().optional(),
});

export const updateQuestionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi là bắt buộc'),
  hint: z.string().optional(),
  correctAnswer: z.string().optional(),
  answerExplanation: z.string().min(1, 'Giải thích đáp án là bắt buộc'),
  points: z.number().min(1, 'Điểm số phải lớn hơn 0').default(1),
  options: z.array(updateQuestionOptionSchema).min(2, 'Phải có ít nhất 2 lựa chọn'),
  id: z.number().optional(),
});

export const updateExerciseSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài tập là bắt buộc'),
  description: z.string().min(1, 'Mô tả bài tập là bắt buộc'),

  // Exercise types (same as original)
  type: z.enum([
    'MULTIPLE_CHOICE',
    'FILL_IN_THE_BLANK',
    'MATCHING',
    // Speech exercise types
    'LISTENING',
    'SPEAKING',
    'SPEECH_RECOGNITION',
    'PRONUNCIATION'
  ]),

  // Traditional exercise fields (optional for Speech exercises)
  questions: z.array(updateQuestionSchema).optional(),

  // Speech exercise specific fields
  targetText: z.string().optional(),
  targetAudioUrl: z.string().url().optional().or(z.literal('')),
  difficultyLevel: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional().default('BEGINNER'),
  speechRecognitionLanguage: z.string().optional().default('ja-JP'),
  minimumAccuracyScore: z.number().min(0).max(100).optional().default(70),

  // ID field for updates
  id: z.number().optional(),
}).superRefine((data, ctx) => {
  // Validation logic based on exercise type
  const speechTypes = ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'];
  const traditionalTypes = ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK', 'MATCHING'];

  if (speechTypes.includes(data.type)) {
    // Speech exercises must have targetText
    if (!data.targetText || data.targetText.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bài tập Speech cần có nội dung mục tiêu",
        path: ["targetText"]
      });
    }
  } else if (traditionalTypes.includes(data.type)) {
    // Traditional exercises must have questions with valid content
    if (!data.questions || data.questions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bài tập truyền thống cần có ít nhất một câu hỏi",
        path: ["questions"]
      });
    } else {
      // Check if all questions have valid content
      data.questions.forEach((question, index) => {
        if (!question.content || question.content.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nội dung câu hỏi là bắt buộc",
            path: ["questions", index, "content"]
          });
        }
        if (!question.answerExplanation || question.answerExplanation.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Giải thích đáp án là bắt buộc",
            path: ["questions", index, "answerExplanation"]
          });
        }
      });
    }
  }
});

export const updateResourceSchema = z.object({
  title: z.string().min(1, 'Tiêu đề tài liệu là bắt buộc'),
  description: z.string().min(1, 'Mô tả tài liệu là bắt buộc'),
  fileUrl: z.string().min(1, 'URL tài liệu là bắt buộc'),
  fileType: z.string().min(1, 'Loại tài liệu là bắt buộc'),
  id: z.number().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài học là bắt buộc'),
  description: z.string().min(1, 'Mô tả bài học là bắt buộc'),
  videoUrl: z.string().min(1, 'Video bài học là bắt buộc'),
  durationInMinutes: z.number().min(1, 'Thời lượng phải lớn hơn 0'),
  content: z.string().min(1, 'Nội dung bài học là bắt buộc'),
  position: z.number().min(0),
  resources: z.array(updateResourceSchema),
  exercises: z.array(updateExerciseSchema),
  id: z.number().optional(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề module là bắt buộc'),
  durationInMinutes: z.number().optional(),
  position: z.number().min(0),
  lessons: z.array(updateLessonSchema).min(1, 'Module phải có ít nhất một bài học'),
  id: z.number().optional(),
});

export const updateCourseFormSchema = z.object({
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
  modules: z.array(updateModuleSchema).min(1, 'Khóa học phải có ít nhất một module'),
  id: z.number().optional(),
});

// THÊM: Update types
export type UpdateQuestionOption = z.infer<typeof updateQuestionOptionSchema>;
export type UpdateQuestion = z.infer<typeof updateQuestionSchema>;
export type UpdateExercise = z.infer<typeof updateExerciseSchema>;
export type UpdateResource = z.infer<typeof updateResourceSchema>;
export type UpdateLesson = z.infer<typeof updateLessonSchema>;
export type UpdateModule = z.infer<typeof updateModuleSchema>;
export type UpdateCourseFormValues = z.infer<typeof updateCourseFormSchema>;