'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TutorService from '@/services/tutor-service';
import UserService from '@/services/user-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Phone,
	Mail,
	Award,
	Briefcase,
	Clock,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Ban,
	CheckCircle2,
	Pencil,
	Plus,
	Trash,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const TutorsAdmin = () => {
	const queryClient = useQueryClient();
	const [selectedTutorId, setSelectedTutorId] = useState<any>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
	const [isBlockConfirmDialogOpen, setIsBlockConfirmDialogOpen] = useState(false);
	const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [loadingTutorId, setLoadingTutorId] = useState<any>(null);
	const [loadingAction, setLoadingAction] = useState<any>(null);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	// State for editing tutor profile
	const [editProfileForm, setEditProfileForm] = useState<any>({
		fullName: '',
		email: '',
		phoneNumber: '',
		teachingRequirements: '',
		educations: [],
		experiences: [],
	});

	const { data: allTutorsData, isLoading: isLoadingAll } = useQuery<any>({
		queryKey: ['tutors', 'all', page, pageSize],
		queryFn: () => TutorService.getAllTutors(page, pageSize),
	});

	const { data: pendingTutorsData, isLoading: isLoadingPending } = useQuery({
		queryKey: ['tutors', 'pending'],
		queryFn: () => TutorService.getPendingTutors(),
	});

	// Query for selected tutor details
	const { data: selectedTutor, isLoading: isLoadingTutorDetails } = useQuery({
		queryKey: ['tutor', selectedTutorId],
		queryFn: () => UserService.getUserById(selectedTutorId),
		enabled: !!selectedTutorId, // Only run the query if selectedTutorId is not null
		staleTime: 30000, // Consider data fresh for 30 seconds
	});

	const approveMutation = useMutation({
		mutationFn: (tutorId: any) => TutorService.approveTutor(tutorId),
		onMutate: (tutorId) => {
			setLoadingTutorId(tutorId);
			setLoadingAction('approve');
		},
		onSuccess: () => {
			toast.success('Phê duyệt giảng viên thành công!');
			queryClient.invalidateQueries({ queryKey: ['tutors', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['tutors', 'pending'] });
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
		onError: () => {
			toast.error('Phê duyệt giảng viên thất bại.');
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (payload: any) => TutorService.rejectTutor(payload.tutorId, payload.reason),
		onMutate: (payload) => {
			setLoadingTutorId(payload.tutorId);
			setLoadingAction('reject');
		},
		onSuccess: () => {
			toast.success('Từ chối giảng viên thành công!');
			queryClient.invalidateQueries({ queryKey: ['tutors', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['tutors', 'pending'] });
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
		onError: () => {
			toast.error('Từ chối giảng viên thất bại.');
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
	});

	const blockUserMutation = useMutation({
		mutationFn: (userId: any) => UserService.blockUserWithPath(userId),
		onMutate: (userId) => {
			setLoadingTutorId(userId);
			setLoadingAction('block');
		},
		onSuccess: () => {
			toast.success('Đã chặn người dùng thành công!');
			queryClient.invalidateQueries({ queryKey: ['tutors', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['tutor', selectedTutorId] });
			setLoadingTutorId(null);
			setLoadingAction(null);
			setIsBlockConfirmDialogOpen(false);
			if (isDialogOpen) handleCloseDialog();
		},
		onError: () => {
			toast.error('Chặn người dùng thất bại.');
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
	});

	const unblockUserMutation = useMutation({
		mutationFn: (userId: any) => UserService.unblockUserWithPath(userId),
		onMutate: (userId) => {
			setLoadingTutorId(userId);
			setLoadingAction('unblock');
		},
		onSuccess: () => {
			toast.success('Đã bỏ chặn người dùng thành công!');
			queryClient.invalidateQueries({ queryKey: ['tutors', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['tutor', selectedTutorId] });
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
		onError: () => {
			toast.error('Bỏ chặn người dùng thất bại.');
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
	});

	// New mutation for updating tutor profile
	const updateTutorProfileMutation = useMutation({
		mutationFn: (data: any) => TutorService.updateTutorProfile(data.tutorId, data.profileData),
		onMutate: (data) => {
			setLoadingTutorId(data.tutorId);
			setLoadingAction('updateProfile');
		},
		onSuccess: () => {
			toast.success('Cập nhật thông tin giảng viên thành công!');
			queryClient.invalidateQueries({ queryKey: ['tutors', 'all'] });
			queryClient.invalidateQueries({ queryKey: ['tutor', selectedTutorId] });
			setLoadingTutorId(null);
			setLoadingAction(null);
			setIsEditProfileDialogOpen(false);
		},
		onError: () => {
			toast.error('Cập nhật thông tin giảng viên thất bại.');
			setLoadingTutorId(null);
			setLoadingAction(null);
		},
	});

	const handleRowClick = (tutorId: any) => {
		setSelectedTutorId(tutorId);
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		// Optional: Clear the selected tutor id when closing the dialog
		// setSelectedTutorId(null);
	};

	const isPendingTutor = (tutorId: any) => {
		return pendingTutorsData?.content.some((t: any) => t.id === tutorId);
	};

	const goToNextPage = () => {
		if (allTutorsData && !allTutorsData.last) {
			setPage(page + 1);
		}
	};

	const goToPreviousPage = () => {
		if (allTutorsData && !allTutorsData.first) {
			setPage(page - 1);
		}
	};

	const handlePageSizeChange = (value: any) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	const handleBlockUser = (userId: any) => {
		setSelectedTutorId(userId);
		setIsBlockConfirmDialogOpen(true);
	};

	const handleUnblockUser = (userId: any) => {
		unblockUserMutation.mutate(userId);
	};

	// Function to open edit profile dialog
	const handleEditProfile = () => {
		// Check if selectedTutor exists before trying to access its properties
		if (selectedTutor) {
			// Initialize form with current tutor data
			setEditProfileForm({
				fullName: selectedTutor.fullName || '',
				email: selectedTutor.email || '',
				phoneNumber: selectedTutor.phoneNumber || '',
				teachingRequirements: selectedTutor.teachingRequirements || '',
				educations:
					Array.isArray(selectedTutor.educations) && selectedTutor.educations.length > 0
						? [...selectedTutor.educations]
						: [],
				experiences:
					Array.isArray(selectedTutor.experiences) && selectedTutor.experiences.length > 0
						? [...selectedTutor.experiences]
						: [],
			});
			setIsEditProfileDialogOpen(true);
		} else {
			toast.error('Không thể chỉnh sửa: Không có thông tin giảng viên được chọn');
		}
	};

	// Function to handle form input changes
	const handleFormChange = (field: any, value: any) => {
		setEditProfileForm((prev: any) => ({
			...prev,
			[field]: value,
		}));
	};

	// Functions to handle education array changes
	const addEducation = () => {
		setEditProfileForm((prev: any) => ({
			...prev,
			educations: [
				...prev.educations,
				{
					institution: '',
					degree: '',
					fieldOfStudy: '',
					startDate: '',
					endDate: '',
					description: '',
				},
			],
		}));
	};

	const updateEducation = (index: any, field: any, value: any) => {
		const updatedEducations = [...editProfileForm.educations];
		updatedEducations[index][field] = value;

		setEditProfileForm((prev: any) => ({
			...prev,
			educations: updatedEducations,
		}));
	};

	const removeEducation = (index: any) => {
		const updatedEducations = [...editProfileForm.educations];
		updatedEducations.splice(index, 1);

		setEditProfileForm((prev: any) => ({
			...prev,
			educations: updatedEducations,
		}));
	};

	// Functions to handle experience array changes
	const addExperience = () => {
		setEditProfileForm((prev: any) => ({
			...prev,
			experiences: [
				...prev.experiences,
				{
					company: '',
					position: '',
					startDate: '',
					endDate: '',
					description: '',
					current: false,
				},
			],
		}));
	};

	const updateExperience = (index: any, field: any, value: any) => {
		const updatedExperiences = [...editProfileForm.experiences];
		updatedExperiences[index][field] = value;

		setEditProfileForm((prev: any) => ({
			...prev,
			experiences: updatedExperiences,
		}));
	};

	const removeExperience = (index: any) => {
		const updatedExperiences = [...editProfileForm.experiences];
		updatedExperiences.splice(index, 1);

		setEditProfileForm((prev: any) => ({
			...prev,
			experiences: updatedExperiences,
		}));
	};

	// Function to handle form submission
	const handleSubmitProfileUpdate = () => {
		// Validate form data here if needed
		if (selectedTutorId) {
			updateTutorProfileMutation.mutate({
				tutorId: selectedTutorId,
				profileData: editProfileForm,
			});
		} else {
			toast.error('Không thể cập nhật: Thiếu ID của giảng viên');
			setIsEditProfileDialogOpen(false);
		}
	};

	if (isLoadingAll || isLoadingPending) {
		return (
			<div className='p-6 w-full mx-auto'>
				<Skeleton className='h-10 w-[250px] mb-6' />
				<div className='bg-primary/10 rounded-lg shadow-sm p-6'>
					<div className='flex justify-center items-center'>
						<div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='p-6 w-full mx-auto'>
			<h1 className='text-3xl font-bold mb-6 text-primary'>Quản lý Giảng Viên</h1>

			<div className='bg-white mb-6'>
				<Table>
					<TableHeader className='bg-emerald-50'>
						<TableRow>
							<TableHead>Ảnh đại diện</TableHead>
							<TableHead>Họ và tên</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Số điện thoại</TableHead>
							<TableHead>Yêu cầu giảng dạy</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{allTutorsData?.content.map((tutor: any) => {
							const isPending = isPendingTutor(tutor.id);
							const isLoading = loadingTutorId === tutor.id;
							return (
								<TableRow
									key={tutor.id}
									className='cursor-pointer hover:bg-gray-50 transition-colors'
									onClick={() => handleRowClick(tutor.id)}
								>
									<TableCell>
										<Avatar>
											<AvatarImage src={tutor?.avatarUrl} alt={tutor?.fullName} />
											<AvatarFallback>{tutor?.fullName?.charAt(0)}</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className='font-medium'>{tutor.fullName}</TableCell>
									<TableCell className='text-muted-foreground'>{tutor.email}</TableCell>
									<TableCell>{tutor.phoneNumber}</TableCell>
									<TableCell className='max-w-xs truncate'>
										{tutor.teachingRequirements || 'Không có'}
									</TableCell>
									<TableCell>
										{isPending ? (
											<Badge
												variant='outline'
												className='bg-yellow-50 text-yellow-600 border-yellow-200'
											>
												Chờ duyệt
											</Badge>
										) : tutor.blocked ? (
											<Badge variant='outline' className='bg-red-50 text-red-600 border-red-200'>
												Đã chặn
											</Badge>
										) : (
											<Badge
												variant='outline'
												className='bg-green-50 text-green-600 border-green-200'
											>
												Đã duyệt
											</Badge>
										)}
									</TableCell>
									<TableCell className='space-x-2'>
										{isPending && (
											<>
												<Button
													variant='secondary'
													size='sm'
													disabled={isLoading && loadingAction === 'approve'}
													onClick={(e) => {
														e.stopPropagation();
														approveMutation.mutate(tutor.id);
													}}
												>
													{isLoading && loadingAction === 'approve' ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang xử lý...
														</>
													) : (
														'Duyệt'
													)}
												</Button>
												<Button
													variant='danger'
													size='sm'
													disabled={isLoading && loadingAction === 'reject'}
													onClick={(e) => {
														e.stopPropagation();
														setSelectedTutorId(tutor.id);
														setRejectReason('');
														setIsRejectDialogOpen(true);
													}}
												>
													{isLoading && loadingAction === 'reject' ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang xử lý...
														</>
													) : (
														'Từ chối'
													)}
												</Button>
											</>
										)}
										{!isPending && (
											<>
												{tutor.blocked ? (
													<Button
														variant='superOutline'
														className='text-green-600 border-green-200 hover:bg-green-50'
														disabled={isLoading && loadingAction === 'unblock'}
														size='sm'
														onClick={(e) => {
															e.stopPropagation();
															handleUnblockUser(tutor.id);
														}}
													>
														{isLoading && loadingAction === 'unblock' ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Đang xử lý...
															</>
														) : (
															<>
																<CheckCircle2 className='mr-2 h-4 w-4' />
																Bỏ chặn
															</>
														)}
													</Button>
												) : (
													<Button
														variant='danger'
														disabled={isLoading && loadingAction === 'block'}
														size='sm'
														onClick={(e) => {
															e.stopPropagation();
															handleBlockUser(tutor.id);
														}}
													>
														{isLoading && loadingAction === 'block' ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Đang xử lý...
															</>
														) : (
															<>
																<Ban className='mr-2 h-4 w-4' />
																Chặn
															</>
														)}
													</Button>
												)}
											</>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>

				{/* Pagination controls */}
				<div className='flex items-center justify-between px-4 py-3 border-t'>
					<div className='flex items-center gap-2'>
						<p className='text-sm text-gray-700'>
							Hiển thị <span className='font-medium'>{allTutorsData?.numberOfElements ?? 0}</span> trong
							tổng số <span className='font-medium'>{allTutorsData?.totalElements ?? 0}</span> gia sư
						</p>
						<div className='ml-4'>
							<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
								<SelectTrigger className='w-[70px] h-8'>
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
							Trang <span className='font-medium'>{(allTutorsData?.number ?? 0) + 1}</span> /{' '}
							<span className='font-medium'>{allTutorsData?.totalPages ?? 0}</span>
						</p>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToPreviousPage}
							disabled={allTutorsData?.first}
							className='rounded-full p-2 h-8 w-8'
						>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToNextPage}
							disabled={allTutorsData?.last}
							className='rounded-full p-2 h-8 w-8'
						>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Dialog chi tiết giảng viên */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='max-w-4xl p-0 overflow-hidden'>
					{isLoadingTutorDetails ? (
						<div className='p-6'>
							<div className='flex flex-col md:flex-row gap-6 items-center md:items-start'>
								<Skeleton className='w-24 h-24 rounded-full' />
								<div className='flex-1'>
									<Skeleton className='h-8 w-48 mb-2' />
									<Skeleton className='h-4 w-64 mb-1' />
									<Skeleton className='h-4 w-36' />
								</div>
							</div>
							<div className='mt-8 space-y-4'>
								<Skeleton className='h-48 w-full' />
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<Skeleton className='h-64 w-full' />
									<Skeleton className='h-64 w-full' />
								</div>
							</div>
						</div>
					) : selectedTutor ? (
						<div className='flex flex-col h-full'>
							{/* Header với thông tin chính */}
							<div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
								<div className='flex flex-col md:flex-row gap-6 items-center md:items-start'>
									<Avatar className='w-24 h-24 border-4 border-white shadow-md'>
										<AvatarImage
											src={`${selectedTutor?.avatarUrl}`}
											alt={selectedTutor?.fullName}
										/>
										<AvatarFallback className='text-2xl bg-primary text-white'>
											{selectedTutor?.fullName?.charAt(0)}
										</AvatarFallback>
									</Avatar>

									<div className='flex-1 text-center md:text-left'>
										<h2 className='text-2xl font-bold mb-1'>{selectedTutor.fullName}</h2>

										<div className='flex flex-col md:flex-row gap-4 text-sm text-gray-600 mt-2'>
											<div className='flex items-center gap-1'>
												<Mail size={16} />
												<span>{selectedTutor.email}</span>
											</div>
											<div className='flex items-center gap-1'>
												<Phone size={16} />
												<span>{selectedTutor.phoneNumber}</span>
											</div>
										</div>

										<div className='mt-4'>
											{isPendingTutor(selectedTutor.id) ? (
												<Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
													Chờ duyệt
												</Badge>
											) : selectedTutor.blocked ? (
												<Badge className='bg-red-100 text-red-800 border-red-200'>
													Đã chặn
												</Badge>
											) : (
												<Badge className='bg-green-100 text-green-800 border-green-200'>
													Đã duyệt
												</Badge>
											)}
										</div>
									</div>

									<div className='flex gap-2 md:self-center'>
										{/* Add Edit Profile button */}
										{!isPendingTutor(selectedTutor.id) && !selectedTutor.blocked && (
											<Button variant='secondary' onClick={handleEditProfile}>
												<Pencil className='mr-2 h-4 w-4' />
												Sửa thông tin
											</Button>
										)}

										{isPendingTutor(selectedTutor.id) && (
											<>
												<Button
													variant='secondary'
													disabled={
														loadingTutorId === selectedTutor.id &&
														loadingAction === 'approve'
													}
													onClick={() => {
														approveMutation.mutate(selectedTutor.id);
														handleCloseDialog();
													}}
												>
													{loadingTutorId === selectedTutor.id &&
													loadingAction === 'approve' ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang xử lý...
														</>
													) : (
														'Duyệt'
													)}
												</Button>
												<Button
													variant='danger'
													disabled={
														loadingTutorId === selectedTutor.id &&
														loadingAction === 'reject'
													}
													onClick={() => {
														setRejectReason('');
														setIsRejectDialogOpen(true);
													}}
												>
													{loadingTutorId === selectedTutor.id &&
													loadingAction === 'reject' ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang xử lý...
														</>
													) : (
														'Từ chối'
													)}
												</Button>
											</>
										)}
										{/* Block/unblock buttons */}
										{!isPendingTutor(selectedTutor.id) && selectedTutor.enabled && (
											<>
												{selectedTutor.blocked ? (
													<Button
														variant='secondary'
														disabled={
															loadingTutorId === selectedTutor.id &&
															loadingAction === 'unblock'
														}
														onClick={() => {
															handleUnblockUser(selectedTutor.id);
														}}
													>
														{loadingTutorId === selectedTutor.id &&
														loadingAction === 'unblock' ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Đang xử lý...
															</>
														) : (
															<>
																<CheckCircle2 className='mr-2 h-4 w-4' />
																Bỏ chặn người dùng
															</>
														)}
													</Button>
												) : (
													<Button
														variant='danger'
														disabled={
															loadingTutorId === selectedTutor.id &&
															loadingAction === 'block'
														}
														onClick={() => {
															setIsBlockConfirmDialogOpen(true);
														}}
													>
														{loadingTutorId === selectedTutor.id &&
														loadingAction === 'block' ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Đang xử lý...
															</>
														) : (
															<>
																<Ban className='mr-2 h-4 w-4' />
																Chặn người dùng
															</>
														)}
													</Button>
												)}
											</>
										)}
									</div>
								</div>
							</div>

							{/* Tab nội dung */}
							<Tabs defaultValue='overview' className='flex-1'>
								<div className='border-b px-6'>
									<TabsList className='bg-transparent -mb-px'>
										<TabsTrigger value='overview' className='py-3'>
											Tổng quan
										</TabsTrigger>
									</TabsList>
								</div>

								<div className='p-6 overflow-auto max-h-[60vh]'>
									<TabsContent value='overview' className='mt-0'>
										<Card>
											<CardHeader>
												<CardTitle className='text-lg flex items-center gap-2'>
													<Award size={18} />
													Yêu cầu giảng dạy
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className='whitespace-pre-line'>
													{selectedTutor.teachingRequirements ||
														'Không có thông tin yêu cầu giảng dạy.'}
												</p>
											</CardContent>
										</Card>

										<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
											<Card>
												<CardHeader>
													<CardTitle className='text-lg flex items-center gap-2'>
														<Award size={18} />
														Thông tin học vấn
													</CardTitle>
												</CardHeader>
												<CardContent>
													{selectedTutor.educations && selectedTutor.educations.length > 0 ? (
														<div className='space-y-4'>
															{selectedTutor.educations.map((edu: any, idx: any) => (
																<div key={idx} className='pb-3'>
																	<h4 className='font-medium text-base'>
																		{edu.institution}
																	</h4>
																	<p className='text-sm text-gray-600'>
																		{edu.degree} - {edu.fieldOfStudy}
																	</p>
																	<div className='flex items-center text-xs text-gray-500 mt-1'>
																		<Clock size={12} className='mr-1' />
																		<span>
																			{edu.startDate} -{' '}
																			{edu.endDate || 'Hiện tại'}
																		</span>
																	</div>
																	{idx < selectedTutor.educations.length - 1 && (
																		<Separator className='mt-3' />
																	)}
																</div>
															))}
														</div>
													) : (
														<p className='text-gray-500'>Không có thông tin học vấn</p>
													)}
												</CardContent>
											</Card>

											<Card>
												<CardHeader>
													<CardTitle className='text-lg flex items-center gap-2'>
														<Briefcase size={18} />
														Kinh nghiệm làm việc
													</CardTitle>
												</CardHeader>
												<CardContent>
													{selectedTutor.experiences &&
													selectedTutor.experiences.length > 0 ? (
														<div className='space-y-4'>
															{selectedTutor.experiences.map((exp: any, idx: any) => (
																<div key={idx} className='pb-3'>
																	<h4 className='font-medium text-base'>
																		{exp.position}
																	</h4>
																	<p className='text-sm font-medium text-gray-600'>
																		{exp.company}
																	</p>
																	<div className='flex items-center text-xs text-gray-500 mt-1'>
																		<Clock size={12} className='mr-1' />
																		<span>
																			{exp.startDate} -{' '}
																			{exp.endDate || 'Hiện tại'}
																		</span>
																	</div>
																	{exp.description && (
																		<p className='text-sm mt-2'>
																			{exp.description}
																		</p>
																	)}
																	{idx < selectedTutor.experiences.length - 1 && (
																		<Separator className='mt-3' />
																	)}
																</div>
															))}
														</div>
													) : (
														<p className='text-gray-500'>Không có thông tin kinh nghiệm</p>
													)}
												</CardContent>
											</Card>
										</div>
									</TabsContent>
								</div>
							</Tabs>

							{/* Footer */}
							<DialogFooter className='p-4 border-t bg-gray-50'>
								<Button variant='primary' onClick={handleCloseDialog}>
									Đóng
								</Button>
							</DialogFooter>
						</div>
					) : (
						<div className='p-8 text-center'>
							<p className='text-gray-500'>Không thể tải thông tin giảng viên. Vui lòng thử lại sau.</p>
							<Button variant='primary' onClick={handleCloseDialog} className='mt-4'>
								Đóng
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Dialog từ chối giảng viên */}
			<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Từ chối giảng viên</DialogTitle>
						<DialogDescription>Vui lòng nhập lý do từ chối giảng viên này.</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='reason'>Lý do từ chối</Label>
							<Input
								id='reason'
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								placeholder='Nhập lý do từ chối'
								className='min-h-[80px]'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='danger'
							onClick={() => {
								if (rejectReason.trim()) {
									rejectMutation.mutate({ tutorId: selectedTutorId, reason: rejectReason });
									setIsRejectDialogOpen(false);
									handleCloseDialog();
								}
							}}
							disabled={
								!rejectReason.trim() ||
								(loadingTutorId === selectedTutorId && loadingAction === 'reject')
							}
						>
							{loadingTutorId === selectedTutorId && loadingAction === 'reject' ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang xử lý...
								</>
							) : (
								'Xác nhận từ chối'
							)}
						</Button>
						<Button variant='primary' onClick={() => setIsRejectDialogOpen(false)}>
							Đóng
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog xác nhận chặn người dùng */}
			<Dialog open={isBlockConfirmDialogOpen} onOpenChange={setIsBlockConfirmDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Xác nhận chặn người dùng</DialogTitle>
						<DialogDescription>
							Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể đăng nhập vào hệ thống.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='danger'
							onClick={() => {
								blockUserMutation.mutate(selectedTutorId);
							}}
							disabled={loadingTutorId === selectedTutorId && loadingAction === 'block'}
						>
							{loadingTutorId === selectedTutorId && loadingAction === 'block' ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang xử lý...
								</>
							) : (
								'Xác nhận chặn'
							)}
						</Button>
						<Button variant='superOutline' onClick={() => setIsBlockConfirmDialogOpen(false)}>
							Hủy
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* New Dialog for editing tutor profile */}
			<Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
				<DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa thông tin giảng viên</DialogTitle>
						<DialogDescription>Cập nhật thông tin chi tiết của giảng viên này.</DialogDescription>
					</DialogHeader>

					<div className='grid gap-4 py-4'>
						{/* Basic information */}
						<div className='grid grid-cols-2 gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='fullName'>Họ và tên</Label>
								<Input
									id='fullName'
									value={editProfileForm.fullName}
									onChange={(e) => handleFormChange('fullName', e.target.value)}
									placeholder='Nhập họ và tên'
								/>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='phoneNumber'>Số điện thoại</Label>
								<Input
									id='phoneNumber'
									value={editProfileForm.phoneNumber}
									onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
									placeholder='Nhập số điện thoại'
								/>
							</div>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								value={editProfileForm.email}
								onChange={(e) => handleFormChange('email', e.target.value)}
								placeholder='Nhập email'
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='teachingRequirements'>Yêu cầu giảng dạy</Label>
							<Textarea
								id='teachingRequirements'
								value={editProfileForm.teachingRequirements}
								onChange={(e) => handleFormChange('teachingRequirements', e.target.value)}
								placeholder='Nhập yêu cầu giảng dạy'
								className='min-h-[100px]'
							/>
						</div>

						{/* Education section */}
						<div className='space-y-4 mt-2'>
							<div className='flex items-center justify-between'>
								<Label className='text-lg font-semibold'>Thông tin học vấn</Label>
								<Button
									variant='superOutline'
									size='sm'
									className='flex items-center gap-1'
									onClick={addEducation}
								>
									<Plus className='h-4 w-4' /> Thêm
								</Button>
							</div>

							{editProfileForm.educations.map((education: any, idx: any) => (
								<div key={idx} className='p-4 border rounded-md space-y-4 relative'>
									<Button
										variant='ghost'
										size='sm'
										className='absolute top-2 right-2 text-gray-500 hover:text-red-600'
										onClick={() => removeEducation(idx)}
									>
										<Trash className='h-4 w-4' />
									</Button>

									<div className='grid grid-cols-2 gap-4'>
										<div className='grid gap-2'>
											<Label>Trường/Viện</Label>
											<Input
												value={education.institution}
												onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
												placeholder='Tên trường hoặc viện'
											/>
										</div>
										<div className='grid gap-2'>
											<Label>Chuyên ngành</Label>
											<Input
												value={education.fieldOfStudy}
												onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
												placeholder='Chuyên ngành học'
											/>
										</div>
									</div>

									<div className='grid gap-2'>
										<Label>Bằng cấp</Label>
										<Input
											value={education.degree}
											onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
											placeholder='Loại bằng cấp (Đại học, Thạc sĩ, v.v.)'
										/>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div className='grid gap-2'>
											<Label>Ngày bắt đầu</Label>
											<Input
												type='date'
												value={education.startDate}
												onChange={(e) => updateEducation(idx, 'startDate', e.target.value)}
											/>
										</div>
										<div className='grid gap-2'>
											<Label>Ngày kết thúc</Label>
											<Input
												type='date'
												value={education.endDate || ''}
												onChange={(e) => updateEducation(idx, 'endDate', e.target.value)}
											/>
										</div>
									</div>

									<div className='grid gap-2'>
										<Label>Mô tả</Label>
										<Textarea
											value={education.description || ''}
											onChange={(e) => updateEducation(idx, 'description', e.target.value)}
											placeholder='Mô tả thêm về học vấn'
											className='min-h-[80px]'
										/>
									</div>
								</div>
							))}

							{editProfileForm.educations.length === 0 && (
								<p className='text-gray-500 text-sm italic p-2'>
									Không có thông tin học vấn. Nhấn "Thêm" để bổ sung.
								</p>
							)}
						</div>

						{/* Experience section */}
						<div className='space-y-4 mt-2'>
							<div className='flex items-center justify-between'>
								<Label className='text-lg font-semibold'>Kinh nghiệm làm việc</Label>
								<Button
									variant='secondary'
									size='sm'
									className='flex items-center gap-1'
									onClick={addExperience}
								>
									<Plus className='h-4 w-4' /> Thêm
								</Button>
							</div>

							{editProfileForm.experiences.map((experience: any, idx: any) => (
								<div key={idx} className='p-4 border rounded-md space-y-4 relative'>
									<Button
										variant='ghost'
										size='sm'
										className='absolute top-2 right-2 text-gray-500 hover:text-red-600'
										onClick={() => removeExperience(idx)}
									>
										<Trash className='h-4 w-4' />
									</Button>

									<div className='grid grid-cols-2 gap-4'>
										<div className='grid gap-2'>
											<Label>Công ty</Label>
											<Input
												value={experience.company}
												onChange={(e) => updateExperience(idx, 'company', e.target.value)}
												placeholder='Tên công ty'
											/>
										</div>
										<div className='grid gap-2'>
											<Label>Vị trí</Label>
											<Input
												value={experience.position}
												onChange={(e) => updateExperience(idx, 'position', e.target.value)}
												placeholder='Vị trí công việc'
											/>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div className='grid gap-2'>
											<Label>Ngày bắt đầu</Label>
											<Input
												type='date'
												value={experience.startDate}
												onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
											/>
										</div>
										<div className='grid gap-2'>
											<Label>Ngày kết thúc</Label>
											<Input
												type='date'
												value={experience.endDate || ''}
												onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
												disabled={experience.current}
											/>
										</div>
									</div>

									<div className='flex items-center gap-2'>
										<input
											type='checkbox'
											id={`current-job-${idx}`}
											checked={experience.current || false}
											onChange={(e) => {
												updateExperience(idx, 'current', e.target.checked);
												if (e.target.checked) {
													updateExperience(idx, 'endDate', '');
												}
											}}
											className='h-4 w-4'
										/>
										<Label htmlFor={`current-job-${idx}`} className='text-sm'>
											Đang làm việc tại đây
										</Label>
									</div>

									<div className='grid gap-2'>
										<Label>Mô tả</Label>
										<Textarea
											value={experience.description || ''}
											onChange={(e) => updateExperience(idx, 'description', e.target.value)}
											placeholder='Mô tả công việc và trách nhiệm'
											className='min-h-[80px]'
										/>
									</div>
								</div>
							))}

							{editProfileForm.experiences.length === 0 && (
								<p className='text-gray-500 text-sm italic p-2'>
									Không có thông tin kinh nghiệm. Nhấn "Thêm" để bổ sung.
								</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button variant='superOutline' onClick={() => setIsEditProfileDialogOpen(false)}>
							Hủy
						</Button>
						<Button
							variant='primary'
							onClick={handleSubmitProfileUpdate}
							disabled={loadingAction === 'updateProfile'}
						>
							{loadingAction === 'updateProfile' ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang cập nhật...
								</>
							) : (
								'Lưu thay đổi'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default TutorsAdmin;
