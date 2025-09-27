'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CourseService from '@/services/course-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Clock, BookOpen, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseDetailDialog from '@/app/(admin)/admin/components/course-detail';
import RejectCourseDialog from '@/app/(admin)/admin/components/reject-course';
import ConfirmDeleteDialog from '@/app/(admin)/admin/components/confirm-delete';
import ResourceDetailDialog from '@/app/(admin)/admin/components/resource-detail';
import ExerciseDetailDialog from '@/app/(admin)/admin/components/exercise-detail';
import ConfirmWithdrawDialog from '@/app/(admin)/admin/components/course-withdraw';

const CoursesAdmin = () => {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('all');
	const [selectedCourse, setSelectedCourse] = useState<any>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
	const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
	const [rejectFeedback, setRejectFeedback] = useState('');
	const [loadingCourseId, setLoadingCourseId] = useState<any>(null);
	const [loadingAction, setLoadingAction] = useState<any>(null);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [selectedResource, setSelectedResource] = useState(null);
	const [selectedExercise, setSelectedExercise] = useState(null);
	const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
	const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
	const [isWithdrawAlertOpen, setIsWithdrawAlertOpen] = useState(false);

	// Query for all courses
	const { data: allCoursesData, isLoading: isLoadingAll } = useQuery({
		queryKey: ['courses', 'all', page, pageSize],
		queryFn: () => CourseService.getAllCourses(page, pageSize),
	});

	// Query for pending courses
	const { data: pendingCoursesData, isLoading: isLoadingPending } = useQuery<any>({
		queryKey: ['courses', 'pending'],
		queryFn: () => CourseService.getPendingCourses(),
	});

	// Course detail query
	const {
		data: courseDetails,
		isLoading: isLoadingDetails,
		refetch: refetchDetails,
	} = useQuery<any>({
		queryKey: ['course', selectedCourse?.id],
		queryFn: () => (selectedCourse ? CourseService.getCourseById(selectedCourse.id) : null),
		enabled: !!selectedCourse?.id,
	});

	// Mutations
	const approveMutation = useMutation({
		mutationFn: (courseId: any) => CourseService.approveCourse(courseId, 'APPROVED'),
		onMutate: (courseId) => {
			setLoadingCourseId(courseId);
			setLoadingAction('approve');
		},
		onSuccess: () => {
			toast.success('Phê duyệt khóa học thành công!', {
				style: { background: '#58CC02', color: 'white' },
				icon: <CheckCircle2 className='text-white' />,
			});
			queryClient.invalidateQueries({ queryKey: ['courses', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['courses', 'pending'] });
			setLoadingCourseId(null);
			setLoadingAction(null);
			handleCloseDialog();
		},
		onError: () => {
			toast.error('Phê duyệt khóa học thất bại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			setLoadingCourseId(null);
			setLoadingAction(null);
		},
	});

	const withdrawMutation = useMutation({
		mutationFn: (courseId: any) => CourseService.withdrawCourse(courseId, 'DRAFT'),
		onMutate: (courseId) => {
			setLoadingCourseId(courseId);
			setLoadingAction('withdraw');
		},
		onSuccess: () => {
			toast.success('Rút lại khóa học thành công!', {
				style: { background: '#58CC02', color: 'white' },
				icon: <CheckCircle2 className='text-white' />,
			});
			queryClient.invalidateQueries({ queryKey: ['courses', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['courses', 'pending'] });
			setLoadingCourseId(null);
			setLoadingAction(null);
			handleCloseDialog();
			setIsWithdrawAlertOpen(false);
		},
		onError: () => {
			toast.error('Rút lại khóa học thất bại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			setLoadingCourseId(null);
			setLoadingAction(null);
		},
	});

	const handleWithdrawCourse = () => {
		withdrawMutation.mutate(displayCourse.id);
	};

	const rejectMutation = useMutation({
		mutationFn: (payload: any) => CourseService.rejectCourse(payload.courseId, payload.feedback),
		onMutate: (payload) => {
			setLoadingCourseId(payload.courseId);
			setLoadingAction('reject');
		},
		onSuccess: () => {
			toast.success('Từ chối khóa học thành công!', {
				style: { background: '#58CC02', color: 'white' },
				icon: <CheckCircle2 className='text-white' />,
			});
			queryClient.invalidateQueries({ queryKey: ['courses', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['courses', 'pending'] });
			setLoadingCourseId(null);
			setLoadingAction(null);
			setIsRejectDialogOpen(false);
			handleCloseDialog();
		},
		onError: () => {
			toast.error('Từ chối khóa học thất bại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			setLoadingCourseId(null);
			setLoadingAction(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (courseId: any) => CourseService.deleteCourse(courseId),
		onMutate: (courseId) => {
			setLoadingCourseId(courseId);
			setLoadingAction('delete');
		},
		onSuccess: () => {
			toast.success('Xóa khóa học thành công!', {
				style: { background: '#58CC02', color: 'white' },
				icon: <CheckCircle2 className='text-white' />,
			});
			queryClient.invalidateQueries({ queryKey: ['courses', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['courses', 'pending'] });
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

	const handleRejectCourse = (feedback: any) => {
		if (feedback.trim()) {
			rejectMutation.mutate({
				courseId: displayCourse.id,
				feedback: feedback,
			});
		}
	};

	const handleDeleteCourse = () => {
		deleteMutation.mutate(displayCourse.id);
	};

	const isPendingCourse = (courseId: any) => {
		return pendingCoursesData?.content.some((c: any) => c.id === courseId);
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
		if (allCoursesData && !allCoursesData.last) {
			setPage(page + 1);
		}
	};

	const goToPreviousPage = () => {
		if (allCoursesData && !allCoursesData.first) {
			setPage(page - 1);
		}
	};

	const handlePageSizeChange = (value: any) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	if (isLoadingAll || isLoadingPending) {
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

	const coursesData = activeTab === 'pending' ? pendingCoursesData : allCoursesData;

	// Use courseDetails if available, otherwise fallback to selectedCourse
	const displayCourse: any = courseDetails || selectedCourse;

	return (
		<div className='p-6 w-full mx-auto'>
			{/* Header */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
				<h1 className='text-3xl font-bold text-emerald-700'>Quản lý Khóa Học</h1>

				<div className='bg-emerald-100 rounded-lg p-1 shadow-sm'>
					<div className='flex space-x-1'>
						<button
							onClick={() => setActiveTab('all')}
							className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
								activeTab === 'all'
									? 'bg-emerald-500 text-white shadow-sm'
									: 'text-emerald-700 hover:bg-emerald-200'
							}`}
						>
							Tất cả khóa học
						</button>
						<button
							onClick={() => setActiveTab('pending')}
							className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center ${
								activeTab === 'pending'
									? 'bg-emerald-500 text-white shadow-sm'
									: 'text-emerald-700 hover:bg-emerald-200'
							}`}
						>
							Chờ duyệt
							{pendingCoursesData?.totalElements > 0 && (
								<span className='ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full'>
									{pendingCoursesData?.totalElements}
								</span>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Courses Table */}
			<div className='bg-white rounded-xl shadow-sm mb-6 overflow-hidden'>
				<Table>
					<TableHeader className='bg-emerald-50'>
						<TableRow>
							<TableHead className='text-emerald-900'>Hình thu nhỏ</TableHead>
							<TableHead className='text-emerald-900'>Tiêu đề</TableHead>
							<TableHead className='text-emerald-900'>Giảng viên</TableHead>
							<TableHead className='text-emerald-900'>Thời lượng</TableHead>
							<TableHead className='text-emerald-900'>Giá</TableHead>
							<TableHead className='text-emerald-900'>Trạng thái</TableHead>
							<TableHead className='text-emerald-900 text-right'>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{coursesData?.content?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className='h-24 text-center'>
									<p className='text-gray-500'>Không có khóa học nào</p>
									{activeTab === 'pending' && (
										<p className='text-sm text-gray-400 mt-1'>Tất cả các khóa học đã được xử lý</p>
									)}
								</TableCell>
							</TableRow>
						) : (
							coursesData?.content.map((course: any) => {
								const isPending = course.status === 'PENDING_APPROVAL';
								const isLoading = loadingCourseId === course.id;
								const isWithdrawing = course.status === 'APPROVED';
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
											<div className='flex items-center gap-2'>
												<div className='h-8 w-8 rounded-full bg-gray-100 overflow-hidden'>
													{course.tutor?.avatarUrl ? (
														<img
															src={course.tutor.avatarUrl}
															alt={course.tutor.fullName}
															className='h-full w-full object-cover'
														/>
													) : (
														<div className='h-full w-full flex items-center justify-center bg-orange-100 text-orange-600 font-medium'>
															{course.tutor?.fullName?.charAt(0) || '?'}
														</div>
													)}
												</div>
												<span className='text-sm'>{course.tutor?.fullName}</span>
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
												{isPending && (
													<>
														<Button
															variant='superOutline'
															size='sm'
															className='bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
															disabled={isLoading && loadingAction === 'approve'}
															onClick={(e) => {
																e.stopPropagation();
																approveMutation.mutate(course.id);
															}}
														>
															{isLoading && loadingAction === 'approve' ? (
																<>
																	<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																	Đang xử lý
																</>
															) : (
																<>
																	<CheckCircle2 className='mr-1 h-4 w-4' />
																	Duyệt
																</>
															)}
														</Button>
														<Button
															variant='superOutline'
															size='sm'
															className='bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
															disabled={isLoading && loadingAction === 'reject'}
															onClick={(e) => {
																e.stopPropagation();
																setSelectedCourse(course);
																setRejectFeedback('');
																setIsRejectDialogOpen(true);
															}}
														>
															{isLoading && loadingAction === 'reject' ? (
																<>
																	<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																	Đang xử lý
																</>
															) : (
																<>
																	<XCircle className='mr-1 h-4 w-4' />
																	Từ chối
																</>
															)}
														</Button>
													</>
												)}
												{course.status === 'APPROVED' && (
													<Button
														variant='superOutline'
														size='sm'
														className='bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
														disabled={isLoading && loadingAction === 'withdraw'}
														onClick={(e) => {
															e.stopPropagation();
															setSelectedCourse(course);
															setIsWithdrawAlertOpen(true);
														}}
													>
														{isLoading && loadingAction === 'withdraw' ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Đang xử lý
															</>
														) : (
															<>
																<Undo2 className='mr-1 h-4 w-4' />
																Rút lại
															</>
														)}
													</Button>
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
				onApprove={() => approveMutation.mutate(displayCourse?.id)}
				onReject={() => setIsRejectDialogOpen(true)}
				onDelete={() => setIsDeleteAlertOpen(true)}
				onWithdraw={() => setIsWithdrawAlertOpen(true)}
				isWithdrawing={loadingCourseId === displayCourse?.id && loadingAction === 'withdraw'}
				isApproving={loadingCourseId === displayCourse?.id && loadingAction === 'approve'}
				isRejecting={loadingCourseId === displayCourse?.id && loadingAction === 'reject'}
				isDeleting={loadingCourseId === displayCourse?.id && loadingAction === 'delete'}
				onResourceClick={handleResourceClick}
				onExerciseClick={handleExerciseClick}
				formatDuration={formatDuration}
				formatPrice={formatPrice}
				getStatusBadge={getStatusBadge}
			/>

			<ConfirmWithdrawDialog
				isOpen={isWithdrawAlertOpen}
				onClose={() => setIsWithdrawAlertOpen(false)}
				onConfirm={handleWithdrawCourse}
				courseTitle={displayCourse?.title}
				isLoading={loadingCourseId === displayCourse?.id && loadingAction === 'withdraw'}
			/>

			<RejectCourseDialog
				isOpen={isRejectDialogOpen}
				onClose={() => setIsRejectDialogOpen(false)}
				onConfirm={handleRejectCourse}
				feedback={rejectFeedback}
				setFeedback={setRejectFeedback}
				isLoading={loadingCourseId === displayCourse?.id && loadingAction === 'reject'}
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

export default CoursesAdmin;
