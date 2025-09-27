'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TutorCourseService from '@/services/tutor-course-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Clock, BookOpen, Loader2, ChevronLeft, ChevronRight, PenLine, Play, Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import CourseDetailDialog from '@/app/(tutor)/tutor/components/course-detail';
import ConfirmDeleteDialog from '@/app/(tutor)/tutor/components/confirm-delete';
import ResourceDetailDialog from '@/app/(tutor)/tutor/components/resource-detail';
import ExerciseDetailDialog from '@/app/(tutor)/tutor/components/exercise-detail';
import { toast } from 'sonner';

// Import dialog components

const CoursesTutor = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [selectedCourse, setSelectedCourse] = useState<any>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
	const [loadingCourseId, setLoadingCourseId] = useState(null);
	const [loadingAction, setLoadingAction] = useState<any>(null);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [selectedResource, setSelectedResource] = useState(null);
	const [selectedExercise, setSelectedExercise] = useState(null);
	const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
	const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);

	// Query for all courses
	const { data: coursesData, isLoading } = useQuery<any>({
		queryKey: ['tutor-courses', page, pageSize],
		queryFn: () => TutorCourseService.getAllCourses(page, pageSize),
	});

	// Course detail query
	const {
		data: courseDetails,
		isLoading: isLoadingDetails,
		refetch: refetchDetails,
	} = useQuery({
		queryKey: ['tutor-course', selectedCourse?.id],
		queryFn: () => (selectedCourse ? TutorCourseService.getCourseById(selectedCourse.id) : null),
		enabled: !!selectedCourse?.id,
	});

	// Mutations
	const submitMutation = useMutation({
		mutationFn: (courseId: any) => TutorCourseService.submitCourseForApproval(courseId),
		onMutate: (courseId) => {
			setLoadingCourseId(courseId);
			setLoadingAction('submit');
		},
		onSuccess: () => {
			toast.success('Khóa học đã được gửi để phê duyệt!', {
				style: { background: '#58CC02', color: 'white' },
			});
			queryClient.invalidateQueries({ queryKey: ['tutor-courses'] });
			setLoadingCourseId(null);
			setLoadingAction(null);
			handleCloseDialog();
		},
		onError: () => {
			toast.error('Gửi khóa học thất bại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			setLoadingCourseId(null);
			setLoadingAction(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (courseId: any) => TutorCourseService.deleteCourse(courseId),
		onMutate: (courseId) => {
			setLoadingCourseId(courseId);
			setLoadingAction('delete');
		},
		onSuccess: () => {
			toast.success('Xóa khóa học thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
			queryClient.invalidateQueries({ queryKey: ['tutor-courses'] });
			setLoadingCourseId(null);
			setLoadingAction(null);
			setIsDeleteAlertOpen(false);
			handleCloseDialog();
		},
		onError: () => {
			toast.error('Xóa khóa học thất bại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			setLoadingCourseId(null);
			setLoadingAction(null);
		},
	});

	// Event handlers
	const handleRowClick = (course: any) => {
		setSelectedCourse(course);
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		setSelectedCourse(null);
	};

	const handleResourceClick = (resource: any) => {
		setSelectedResource(resource);
		setIsResourceDialogOpen(true);
	};

	const handleExerciseClick = (exercise: any) => {
		setSelectedExercise(exercise);
		setIsExerciseDialogOpen(true);
	};

	const handleEditCourse = (courseId: any) => {
		router.push(`/tutor/course/edit/${courseId}`);
	};

	const handleCreateCourse = () => {
		router.push('/tutor/course/create');
	};

	const handleDeleteCourse = () => {
		deleteMutation.mutate(displayCourse.id);
	};

	const handleSubmitCourse = (courseId: any) => {
		submitMutation.mutate(courseId);
	};

	// Format functions
	const formatDuration = (minutes: any) => {
		if (!minutes) return 'N/A';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	};

	const formatPrice = (price: any) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	const getStatusBadge = (status: any) => {
		switch (status) {
			case 'DRAFT':
				return (
					<Badge variant='outline' className='bg-gray-100 text-gray-600 border-gray-200'>
						Bản nháp
					</Badge>
				);
			case 'PENDING_APPROVAL':
				return (
					<Badge variant='outline' className='bg-yellow-50 text-yellow-600 border-yellow-200'>
						Chờ duyệt
					</Badge>
				);
			case 'APPROVED':
				return (
					<Badge variant='outline' className='bg-green-50 text-green-600 border-green-200'>
						Đã xuất bản
					</Badge>
				);
			case 'REJECTED':
				return (
					<Badge variant='outline' className='bg-red-50 text-red-600 border-red-200'>
						Đã từ chối
					</Badge>
				);
			default:
				return null;
		}
	};

	// Pagination handlers
	const goToNextPage = () => {
		if (coursesData && !coursesData.last) {
			setPage(page + 1);
		}
	};

	const goToPreviousPage = () => {
		if (coursesData && !coursesData.first) {
			setPage(page - 1);
		}
	};

	const handlePageSizeChange = (value: any) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	if (isLoading) {
		return (
			<div className='p-6 w-full mx-auto'>
				<Skeleton className='h-10 w-[250px] mb-6' />
				<div className='bg-primary/10 rounded-lg shadow-sm p-6'>
					<div className='flex justify-center items-center'>
						<div className='w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
					</div>
				</div>
			</div>
		);
	}

	// Use courseDetails if available, otherwise fallback to selectedCourse
	const displayCourse = courseDetails || selectedCourse;

	return (
		<div className='p-6 w-full mx-auto'>
			{/* Header */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
				<h1 className='text-3xl font-bold text-emerald-700'>Khóa Học Của Tôi</h1>

				<Button onClick={handleCreateCourse} className='bg-emerald-600 hover:bg-emerald-700 text-white'>
					<Plus className='h-4 w-4 mr-2' />
					Tạo khóa học mới
				</Button>
			</div>

			{/* Courses Table */}
			<div className='bg-white rounded-xl shadow-sm mb-6 overflow-hidden'>
				<Table>
					<TableHeader className='bg-emerald-50'>
						<TableRow>
							<TableHead className='text-emerald-900'>Hình thu nhỏ</TableHead>
							<TableHead className='text-emerald-900'>Tiêu đề</TableHead>
							<TableHead className='text-emerald-900'>Thời lượng</TableHead>
							<TableHead className='text-emerald-900'>Giá</TableHead>
							<TableHead className='text-emerald-900'>Trạng thái</TableHead>
							<TableHead className='text-emerald-900 text-right'>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{coursesData?.content?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className='h-24 text-center'>
									<p className='text-gray-500'>Bạn chưa có khóa học nào</p>
									<p className='text-sm text-gray-400 mt-1'>Nhấn "Tạo khóa học mới" để bắt đầu</p>
								</TableCell>
							</TableRow>
						) : (
							coursesData?.content.map((course: any) => {
								const isDraft = course.status === 'DRAFT';
								const isRejected = course.status === 'REJECTED';
								const isLoading = loadingCourseId === course.id;
								return (
									<TableRow
										key={course.id}
										className='cursor-pointer hover:bg-emerald-50/50 transition-colors'
										onClick={() => handleRowClick(course)}
									>
										<TableCell>
											<div className='h-16 w-24 rounded-md overflow-hidden bg-gray-100 border border-gray-200'>
												{course.thumbnailUrl ? (
													<img
														src={course.thumbnailUrl}
														alt={course.title}
														className='h-full w-full object-cover'
													/>
												) : (
													<div className='flex items-center justify-center h-full w-full bg-emerald-100'>
														<BookOpen className='h-6 w-6 text-emerald-600' />
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className='font-medium text-emerald-800 w-[20%]'>
											<p className='line-clamp-1'>{course.title}</p>
											<div className='text-xs text-gray-500 mt-1'>
												{course.level?.name || 'Không có cấp độ'}
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center text-gray-700'>
												<Clock className='h-4 w-4 mr-1.5 text-emerald-600' />
												{formatDuration(course.durationInMinutes)}
											</div>
											<div className='text-xs text-gray-500 mt-1'>
												{course.lessonCount} bài học
											</div>
										</TableCell>
										<TableCell className='font-medium'>{formatPrice(course.price)}</TableCell>
										<TableCell>{getStatusBadge(course.status)}</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end space-x-2'>
												<Button
													variant='superOutline'
													size='sm'
													className='bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
													onClick={(e) => {
														e.stopPropagation();
														handleRowClick(course);
													}}
												>
													<Eye className='h-4 w-4 mr-1' />
													Chi tiết
												</Button>

												{(isDraft || isRejected) && (
													<>
														<Button
															variant='superOutline'
															size='sm'
															className='bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
															onClick={(e) => {
																e.stopPropagation();
																handleEditCourse(course.id);
															}}
														>
															<PenLine className='h-4 w-4 mr-1' />
															Chỉnh sửa
														</Button>

														{isDraft && (
															<Button
																variant='superOutline'
																size='sm'
																className='bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
																disabled={isLoading && loadingAction === 'submit'}
																onClick={(e) => {
																	e.stopPropagation();
																	handleSubmitCourse(course.id);
																}}
															>
																{isLoading && loadingAction === 'submit' ? (
																	<>
																		<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																		Đang xử lý
																	</>
																) : (
																	<>
																		<Play className='mr-1 h-4 w-4' />
																		Gửi duyệt
																	</>
																)}
															</Button>
														)}

														<Button
															variant='superOutline'
															size='sm'
															className='bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
															disabled={isLoading && loadingAction === 'delete'}
															onClick={(e) => {
																e.stopPropagation();
																setSelectedCourse(course);
																setIsDeleteAlertOpen(true);
															}}
														>
															{isLoading && loadingAction === 'delete' ? (
																<>
																	<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																	Đang xử lý
																</>
															) : (
																<>
																	<Trash2 className='mr-1 h-4 w-4' />
																	Xóa
																</>
															)}
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>

				{/* Pagination controls */}
				<div className='flex items-center justify-between px-4 py-3 border-t'>
					<div className='flex items-center gap-2'>
						<p className='text-sm text-gray-700'>
							Hiển thị <span className='font-medium'>{coursesData?.numberOfElements ?? 0}</span> trong
							tổng số <span className='font-medium'>{coursesData?.totalElements ?? 0}</span> khóa học
						</p>
						<div className='ml-4'>
							<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
								<SelectTrigger className='w-[70px] h-8 border-emerald-200'>
									<SelectValue placeholder={pageSize} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='5'>5</SelectItem>
									<SelectItem value='10'>10</SelectItem>
									<SelectItem value='20'>20</SelectItem>
									<SelectItem value='50'>50</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<p className='text-sm text-gray-700 mr-4'>
							Trang <span className='font-medium'>{(coursesData?.number ?? 0) + 1}</span> /{' '}
							<span className='font-medium'>{coursesData?.totalPages ?? 0}</span>
						</p>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToPreviousPage}
							disabled={coursesData?.first}
							className='rounded-full p-2 h-8 w-8 border-emerald-200'
						>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToNextPage}
							disabled={coursesData?.last}
							className='rounded-full p-2 h-8 w-8 border-emerald-200'
						>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Dialogs */}
			<CourseDetailDialog
				isOpen={isDialogOpen}
				onClose={handleCloseDialog}
				course={displayCourse}
				isLoading={isLoadingDetails}
				onEdit={
					displayCourse?.status === 'DRAFT' || displayCourse?.status === 'REJECTED'
						? () => handleEditCourse(displayCourse?.id)
						: undefined
				}
				onSubmit={displayCourse?.status === 'DRAFT' ? () => handleSubmitCourse(displayCourse?.id) : undefined}
				onDelete={
					displayCourse?.status === 'DRAFT' || displayCourse?.status === 'REJECTED'
						? () => setIsDeleteAlertOpen(true)
						: undefined
				}
				isSubmitting={loadingCourseId === displayCourse?.id && loadingAction === 'submit'}
				isDeleting={loadingCourseId === displayCourse?.id && loadingAction === 'delete'}
				onResourceClick={handleResourceClick}
				onExerciseClick={handleExerciseClick}
				formatDuration={formatDuration}
				formatPrice={formatPrice}
				getStatusBadge={getStatusBadge}
			/>

			<ConfirmDeleteDialog
				isOpen={isDeleteAlertOpen}
				onClose={() => setIsDeleteAlertOpen(false)}
				onConfirm={handleDeleteCourse}
				courseTitle={displayCourse?.title}
				isLoading={loadingCourseId === displayCourse?.id && loadingAction === 'delete'}
			/>

			<ResourceDetailDialog
				resource={selectedResource}
				isOpen={isResourceDialogOpen}
				onClose={() => setIsResourceDialogOpen(false)}
			/>

			<ExerciseDetailDialog
				exercise={selectedExercise}
				isOpen={isExerciseDialogOpen}
				onClose={() => setIsExerciseDialogOpen(false)}
			/>
		</div>
	);
};

export default CoursesTutor;
