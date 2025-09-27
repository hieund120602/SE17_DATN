'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Icons
import { Loader2, ArrowLeft, Pencil, BookCopy, LayoutGrid, Star, Eye, Save, Send } from 'lucide-react';

// Services
import TutorCourseService from '@/services/tutor-course-service';
import LevelsService from '@/services/levels-service';
import Sidebar from '@/app/(tutor)/tutor/components/sidebar';
import BasicInfoTab from '@/app/(tutor)/tutor/components/basic-info';
import CourseContentTab from '@/app/(tutor)/tutor/components/course-content';
import ModulesTab from '@/app/(tutor)/tutor/components/module-tab';
import PricingTab from '@/app/(tutor)/tutor/components/pricing';
import PreviewTab from '@/app/(tutor)/tutor/components/privew-tab';

// Import shared schemas and types
import {
	courseFormSchema,
	CourseFormValues,
	CreateCourseResponse,
	Level
} from '@/schemas/course-schema';
import { useAuth } from '@/context/AuthContext';

const CreateCourse: React.FC = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<string>('basic-info');
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
	const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
	const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);
	const [currentUploadTasks, setCurrentUploadTasks] = useState<Record<string, boolean>>({});
	const [imagePreview, setImagePreview] = useState<string>('');

	// Get all levels
	const { data: levels, isLoading: isLoadingLevels } = useQuery<any>({
		queryKey: ['levels'],
		queryFn: () => LevelsService.getLevels(),
	});

	// Form setup with React Hook Form and Zod validation
	const methods = useForm<any>({
		resolver: zodResolver(courseFormSchema),
		defaultValues: {
			title: '',
			description: '',
			levelId: undefined as unknown as number, // Type assertion to handle undefined during initialization
			courseOverview: '',
			courseContent: '',
			price: 0,
			thumbnailUrl: '',
			includesDescription: '',
			modules: [
				{
					title: 'Module 1',
					position: 0,
					durationInMinutes: 0,
					lessons: [
						{
							title: 'Bài học 1',
							description: '',
							videoUrl: '',
							durationInMinutes: 0,
							content: '',
							position: 0,
							resources: [],
							exercises: [],
						},
					],
				},
			],
		},
	});

	// Define the mutation for creating a course
	const createCourseMutation = useMutation<any>({
		mutationFn: (data: any) => {
			console.log('Mutation function called with data:', data);

			// Process data to ensure types match API requirements
			const preparedData = {
				...data,
				modules: data.modules.map((module: any) => ({
					...module,
					durationInMinutes: module.durationInMinutes || 0, // Ensure durationInMinutes is always defined
					lessons: module.lessons.map((lesson: any) => ({
						...lesson,
						exercises: lesson.exercises.map((exercise: any) => ({
							...exercise,
							questions: exercise.questions?.map((question: any) => ({
								...question,
								options: question.options?.map((option: any) => ({
									...option,
									correct: option.correct === undefined ? false : option.correct, // Ensure correct is always boolean
								})),
							})) || [],
						})),
					})),
				})),
			};

			console.log('Final prepared data for API:', preparedData);
			return TutorCourseService.createCourse(preparedData);
		},
		onSuccess: (response) => {
			console.log('Course creation successful:', response);
			toast.success('Khóa học đã được tạo thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
			// Navigate to the course list page
			router.push('/tutor/course');
		},
		onError: (error) => {
			console.error('Course creation failed:', error);
			toast.error('Tạo khóa học thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			console.error('Error creating course:', error);
		},
	});

	// Submit handler
	const onSubmit: any = (data: any) => {
		console.log('Form submitted with data:', data);
		console.log('Current token:', document.cookie);
		console.log('Current user:', user);

		// Clean up data: remove empty questions from speech exercises and filter invalid questions
		data.modules.forEach((module: any) => {
			module.lessons.forEach((lesson: any) => {
				lesson.exercises = lesson.exercises.map((exercise: any) => {
					const speechTypes = ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'];
					if (speechTypes.includes(exercise.type)) {
						// For speech exercises, remove questions entirely and ensure required fields
						const cleanedExercise: any = {
							title: exercise.title || '',
							description: exercise.description || '',
							type: exercise.type,
							targetText: exercise.targetText || '',
							targetAudioUrl: exercise.targetAudioUrl || '',
							difficultyLevel: exercise.difficultyLevel || 'BEGINNER',
							speechRecognitionLanguage: exercise.speechRecognitionLanguage || 'ja-JP',
							minimumAccuracyScore: exercise.minimumAccuracyScore || 70,
						};
						// Only include id if it exists (for updates)
						if (exercise.id) {
							cleanedExercise.id = exercise.id;
						}
						return cleanedExercise;
					} else {
						// For traditional exercises, filter out empty questions
						const validQuestions = (exercise.questions || []).filter((question: any) =>
							question.content && question.content.trim().length > 0 &&
							question.answerExplanation && question.answerExplanation.trim().length > 0
						);

						return {
							...exercise,
							questions: validQuestions
						};
					}
				});
			});
		});

		// Calculate total duration from all lessons
		data.modules.forEach((module: any) => {
			module.durationInMinutes = module.lessons.reduce(
				(sum: any, lesson: any) => sum + (lesson.durationInMinutes || 0),
				0
			);
		});

		console.log('Prepared data before mutation:', data);

		// Submit the course
		createCourseMutation.mutate(data);
	};

	// Save as draft handler
	const saveDraft = () => {
		methods.handleSubmit(onSubmit)();
	};

	// Handle navigation between tabs
	const navigateToTab = (tab: string) => {
		setActiveTab(tab);
	};

	// Format time duration for display
	const formatDuration = (minutes: number): string => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	};

	// Render loading skeleton
	if (isLoadingLevels) {
		return (
			<div className='p-6 max-w-7xl mx-auto'>
				<Skeleton className='h-12 w-1/3 mb-6' />
				<div className='space-y-6'>
					<Skeleton className='h-64 w-full rounded-lg' />
					<div className='grid grid-cols-2 gap-6'>
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
					</div>
					<Skeleton className='h-32 w-full' />
				</div>
			</div>
		);
	}

	// Configure sidebar items
	const sidebarItems = [
		{ id: 'basic-info', label: 'Thông tin cơ bản', icon: <Pencil className='h-4 w-4' /> },
		{ id: 'content', label: 'Nội dung khóa học', icon: <BookCopy className='h-4 w-4' /> },
		{ id: 'modules', label: 'Các module & bài học', icon: <LayoutGrid className='h-4 w-4' /> },
		{ id: 'pricing', label: 'Định giá khóa học', icon: <Star className='h-4 w-4' /> },
		{ id: 'preview', label: 'Xem trước & đăng tải', icon: <Eye className='h-4 w-4' /> },
	];

	return (
		<div>
			{/* Header */}
			<div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
				<div className='w-full py-4 flex justify-between items-center'>
					<div className='flex items-center space-x-4'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => router.push('/tutor/course')}
							className='text-gray-600 hover:text-emerald-600'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Quay lại
						</Button>
						<h1 className='text-xl font-bold text-emerald-700'>Tạo Khóa Học Mới</h1>
					</div>

					<div className='flex items-center space-x-3'>
						<Button variant='secondary' onClick={saveDraft} disabled={createCourseMutation.isPending}>
							{createCourseMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang lưu...
								</>
							) : (
								<>
									<Save className='mr-2 h-4 w-4' />
									Lưu bản nháp
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<FormProvider {...methods}>
				<div className='flex flex-1 w-full py-8'>
					{/* Sidebar navigation */}
					<Sidebar
						sidebarOpen={sidebarOpen}
						setSidebarOpen={setSidebarOpen}
						sidebarItems={sidebarItems}
						activeTab={activeTab}
						navigateToTab={navigateToTab}
					/>

					{/* Main content area */}
					<div className='flex-1 relative'>
						<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-8'>
							{/* Basic Information */}
							{activeTab === 'basic-info' && (
								<BasicInfoTab
									form={methods as any} // Type assertion to avoid type conflicts
									uploadingThumbnail={uploadingThumbnail}
									setUploadingThumbnail={setUploadingThumbnail}
									imagePreview={imagePreview}
									setImagePreview={setImagePreview}
									navigateToTab={navigateToTab}
									router={router}
									levels={levels}
								/>
							)}

							{/* Course Content */}
							{activeTab === 'content' && (
								<CourseContentTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
								/>
							)}

							{/* Modules and Lessons */}
							{activeTab === 'modules' && (
								<ModulesTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
									currentUploadTasks={currentUploadTasks}
									setCurrentUploadTasks={setCurrentUploadTasks}
								/>
							)}

							{/* Pricing */}
							{activeTab === 'pricing' && (
								<PricingTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
								/>
							)}

							{/* Preview */}
							{activeTab === 'preview' && (
								<PreviewTab
									form={methods as any} // Type assertion to avoid type conflicts
									navigateToTab={navigateToTab}
									formatDuration={formatDuration}
									saveDraft={saveDraft}
									createCourseMutation={createCourseMutation}
									setIsSubmitConfirmOpen={setIsSubmitConfirmOpen}
									levels={levels}
								/>
							)}
						</form>
					</div>
				</div>
			</FormProvider>

			{/* Submit Confirmation Dialog */}
			<AlertDialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Gửi khóa học để phê duyệt?</AlertDialogTitle>
						<AlertDialogDescription>
							Khóa học của bạn sẽ được gửi đến quản trị viên để xem xét. Sau khi được phê duyệt, khóa học
							sẽ được đăng tải và hiển thị cho học viên.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								console.log('Submit button clicked');
								console.log('Form errors:', methods.formState.errors);
								console.log('Form values:', methods.getValues());
								setIsSubmitConfirmOpen(false);
								methods.handleSubmit(onSubmit)();
							}}
						>
							Xác nhận
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default CreateCourse;
