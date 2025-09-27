'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
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

// Import shared schemas and types for update
import {
	updateCourseFormSchema,
	UpdateCourseFormValues
} from '@/schemas/course-schema';

const UpdateCourse: React.FC = () => {
	const router = useRouter();
	const params = useParams();
	const courseId = params.id as string;
	const queryClient = useQueryClient();

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

	// Get course data for editing
	const { data: courseData, isLoading: isLoadingCourse } = useQuery<any>({
		queryKey: ['tutor-course-edit', courseId],
		queryFn: () => TutorCourseService.getCourseById(Number(courseId)),
		enabled: !!courseId,
	});

	// Form setup with React Hook Form and Zod validation
	const methods = useForm<any>({
		resolver: zodResolver(updateCourseFormSchema),
		defaultValues: {
			title: '',
			description: '',
			levelId: courseData?.level?.id,
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
							videoUrl:
								'http://res.cloudinary.com/dugsysqjv/video/upload/v1747729756/japanese_learning/videos/ashy2031hvxtfihh2iqr.mp4',
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

	// Update form values when course data is loaded
	useEffect(() => {
		if (courseData && !isLoadingCourse) {
			// Set image preview
			setImagePreview(courseData.thumbnailUrl || '');

			// Reset form with course data
			methods.reset({
				...courseData,
				levelId: courseData.levelId || courseData.level?.id,
			});
		}
	}, [courseData, isLoadingCourse, methods]);

	// Define the mutation for updating a course
	const updateCourseMutation = useMutation({
		mutationFn: (data: any) => {
			// Process data to ensure types match API requirements
			const preparedData = {
				...data,
				modules: data.modules.map((module: any) => ({
					...module,
					durationInMinutes: module.durationInMinutes || 0,
					lessons: module.lessons.map((lesson: any) => ({
						...lesson,
						exercises: lesson.exercises.map((exercise: any) => ({
							...exercise,
							questions: exercise.questions.map((question: any) => ({
								...question,
								options: question.options.map((option: any) => ({
									...option,
									correct: option.correct === undefined ? false : option.correct,
								})),
							})),
						})),
					})),
				})),
			};

			return TutorCourseService.updateCourse(Number(courseId), preparedData);
		},
		onSuccess: () => {
			toast.success('Khóa học đã được cập nhật thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});

			// Invalidate queries to refetch course data
			queryClient.invalidateQueries({ queryKey: ['tutor-courses'] });
			queryClient.invalidateQueries({ queryKey: ['tutor-course-edit', courseId] });

			// Navigate back to the course list
			router.push('/tutor/course');
		},
		onError: (error) => {
			toast.error('Cập nhật khóa học thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			console.error('Error updating course:', error);
		},
	});

	// Submit handler
	const onSubmit = (data: any) => {
		// Calculate total duration from all lessons
		data.modules.forEach((module: any) => {
			module.durationInMinutes = module.lessons.reduce(
				(sum: any, lesson: any) => sum + (lesson.durationInMinutes || 0),
				0
			);
		});

		// Update the course
		updateCourseMutation.mutate(data);
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
	if (isLoadingLevels || isLoadingCourse) {
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
		{ id: 'preview', label: 'Xem trước & cập nhật', icon: <Eye className='h-4 w-4' /> },
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
						<h1 className='text-xl font-bold text-emerald-700'>Chỉnh Sửa Khóa Học: {courseData?.title}</h1>
					</div>

					<div className='flex items-center space-x-3'>
						<Button variant='secondary' onClick={saveDraft} disabled={updateCourseMutation.isPending}>
							{updateCourseMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang lưu...
								</>
							) : (
								<>
									<Save className='mr-2 h-4 w-4' />
									Lưu thay đổi
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
									form={methods}
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
								<CourseContentTab form={methods} navigateToTab={navigateToTab} />
							)}

							{/* Modules and Lessons */}
							{activeTab === 'modules' && (
								<ModulesTab
									form={methods}
									navigateToTab={navigateToTab}
									currentUploadTasks={currentUploadTasks}
									setCurrentUploadTasks={setCurrentUploadTasks}
								/>
							)}

							{/* Pricing */}
							{activeTab === 'pricing' && <PricingTab form={methods} navigateToTab={navigateToTab} />}

							{/* Preview */}
							{activeTab === 'preview' && (
								<PreviewTab
									form={methods}
									navigateToTab={navigateToTab}
									formatDuration={formatDuration}
									saveDraft={saveDraft}
									createCourseMutation={updateCourseMutation}
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
						<AlertDialogTitle>Lưu thay đổi và gửi duyệt?</AlertDialogTitle>
						<AlertDialogDescription>
							Khóa học đã được cập nhật và sẽ được gửi đến quản trị viên để xem xét. Sau khi được phê
							duyệt, khóa học sẽ được đăng tải và hiển thị cho học viên.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
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

export default UpdateCourse;
