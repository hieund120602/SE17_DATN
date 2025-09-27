'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserService from '@/services/user-service';
import ProfileService from '@/services/profile-service';
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
import { Phone, Mail, Loader2, ChevronLeft, ChevronRight, Ban, CheckCircle2, Pencil, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// First, let's update the ProfileService to include the admin update method
// This should be in your ProfileService file, but adding here for reference
// We'll simulate it's already included in the imported ProfileService

/*
// Add this to your ProfileService.ts file
updateUserProfile: async (userId: number, profileData: UpdateProfileRequest): Promise<Student> => {
  const response = await api.put<Student>(`/users/${userId}/profile`, profileData);
  return response.data;
}
*/

const StudentsAdmin = () => {
	const queryClient = useQueryClient();
	const [selectedStudentId, setSelectedStudentId] = useState<any>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isBlockConfirmDialogOpen, setIsBlockConfirmDialogOpen] = useState(false);
	const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
	const [loadingStudentId, setLoadingStudentId] = useState<any>(null);
	const [loadingAction, setLoadingAction] = useState<any>(null);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	// State for editing student profile
	const [editProfileForm, setEditProfileForm] = useState<any>({
		fullName: '',
		email: '',
		phoneNumber: '',
	});

	const { data: studentsData, isLoading } = useQuery<any>({
		queryKey: ['students', page, pageSize],
		queryFn: () => UserService.getStudents(page, pageSize),
	});

	// Query for selected student details
	const { data: selectedStudent, isLoading: isLoadingStudentDetails } = useQuery({
		queryKey: ['student', selectedStudentId],
		queryFn: () => UserService.getUserById(selectedStudentId),
		enabled: !!selectedStudentId, // Only run the query if selectedStudentId is not null
		staleTime: 30000, // Consider data fresh for 30 seconds
	});

	// Block user mutation
	const blockUserMutation = useMutation({
		mutationFn: (userId: any) => UserService.blockUserWithPath(userId),
		onMutate: (userId) => {
			setLoadingStudentId(userId);
			setLoadingAction('block');
		},
		onSuccess: () => {
			toast.success('Đã chặn sinh viên thành công!');
			queryClient.invalidateQueries({ queryKey: ['students'] });
			queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
			setLoadingStudentId(null);
			setLoadingAction(null);
			setIsBlockConfirmDialogOpen(false);
			if (isDialogOpen) handleCloseDialog();
		},
		onError: () => {
			toast.error('Chặn sinh viên thất bại.');
			setLoadingStudentId(null);
			setLoadingAction(null);
		},
	});

	// Unblock user mutation
	const unblockUserMutation = useMutation({
		mutationFn: (userId: any) => UserService.unblockUserWithPath(userId),
		onMutate: (userId) => {
			setLoadingStudentId(userId);
			setLoadingAction('unblock');
		},
		onSuccess: () => {
			toast.success('Đã bỏ chặn sinh viên thành công!');
			queryClient.invalidateQueries({ queryKey: ['students'] });
			queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
			setLoadingStudentId(null);
			setLoadingAction(null);
		},
		onError: () => {
			toast.error('Bỏ chặn sinh viên thất bại.');
			setLoadingStudentId(null);
			setLoadingAction(null);
		},
	});

	// Update profile mutation
	const updateProfileMutation = useMutation({
		mutationFn: (data: any) => ProfileService.updateUserProfile(data.userId, data.profileData),
		onMutate: (data) => {
			setLoadingStudentId(data.userId);
			setLoadingAction('updateProfile');
		},
		onSuccess: () => {
			toast.success('Cập nhật thông tin sinh viên thành công!');
			queryClient.invalidateQueries({ queryKey: ['students'] });
			queryClient.invalidateQueries({ queryKey: ['student', selectedStudentId] });
			setLoadingStudentId(null);
			setLoadingAction(null);
			setIsEditProfileDialogOpen(false);
		},
		onError: () => {
			toast.error('Cập nhật thông tin sinh viên thất bại.');
			setLoadingStudentId(null);
			setLoadingAction(null);
		},
	});

	const handleRowClick = (studentId: any) => {
		setSelectedStudentId(studentId);
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		// Optional: Clear the selected student id when closing the dialog
		// setSelectedStudentId(null);
	};

	const goToNextPage = () => {
		if (studentsData && !studentsData.last) {
			setPage(page + 1);
		}
	};

	const goToPreviousPage = () => {
		if (studentsData && !studentsData.first) {
			setPage(page - 1);
		}
	};

	const handlePageSizeChange = (value: any) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	const handleBlockUser = (userId: any) => {
		setSelectedStudentId(userId);
		setIsBlockConfirmDialogOpen(true);
	};

	const handleUnblockUser = (userId: any) => {
		unblockUserMutation.mutate(userId);
	};

	// Function to open edit profile dialog
	const handleEditProfile = () => {
		// Check if selectedStudent exists before trying to access its properties
		if (selectedStudent) {
			// Initialize form with current student data
			setEditProfileForm({
				fullName: selectedStudent.fullName || '',
				email: selectedStudent.email || '',
				phoneNumber: selectedStudent.phoneNumber || '',
			});
			setIsEditProfileDialogOpen(true);
		} else {
			toast.error('Không thể chỉnh sửa: Không có thông tin sinh viên được chọn');
		}
	};

	// Function to handle form input changes
	const handleFormChange = (field: any, value: any) => {
		setEditProfileForm((prev: any) => ({
			...prev,
			[field]: value,
		}));
	};

	// Function to handle form submission
	const handleSubmitProfileUpdate = () => {
		// Validate form data here if needed
		if (selectedStudentId) {
			updateProfileMutation.mutate({
				userId: selectedStudentId,
				profileData: editProfileForm,
			});
		} else {
			toast.error('Không thể cập nhật: Thiếu ID của sinh viên');
			setIsEditProfileDialogOpen(false);
		}
	};

	if (isLoading) {
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
			<h1 className='text-3xl font-bold mb-6 text-primary'>Quản lý Học Viên</h1>

			<div className='bg-white mb-6'>
				<Table>
					<TableHeader className='bg-emerald-50'>
						<TableRow>
							<TableHead>Ảnh đại diện</TableHead>
							<TableHead>Họ và tên</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Số điện thoại</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{studentsData?.content.map((student: any) => {
							const isLoading = loadingStudentId === student.id;
							return (
								<TableRow
									key={student.id}
									className='cursor-pointer hover:bg-gray-50 transition-colors'
									onClick={() => handleRowClick(student.id)}
								>
									<TableCell>
										<Avatar>
											<AvatarImage src={student?.avatarUrl} alt={student?.fullName} />
											<AvatarFallback>{student?.fullName?.charAt(0)}</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className='font-medium'>{student.fullName}</TableCell>
									<TableCell className='text-muted-foreground'>{student.email}</TableCell>
									<TableCell>{student.phoneNumber}</TableCell>
									<TableCell>
										{student.blocked ? (
											<Badge variant='outline' className='bg-red-50 text-red-600 border-red-200'>
												Đã chặn
											</Badge>
										) : (
											<Badge
												variant='outline'
												className='bg-green-50 text-green-600 border-green-200'
											>
												Đang hoạt động
											</Badge>
										)}
									</TableCell>
									<TableCell className='space-x-2'>
										{student.blocked ? (
											<Button
												variant='superOutline'
												className='text-green-600 border-green-200 hover:bg-green-50'
												disabled={isLoading && loadingAction === 'unblock'}
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													handleUnblockUser(student.id);
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
													handleBlockUser(student.id);
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
							Hiển thị <span className='font-medium'>{studentsData?.numberOfElements ?? 0}</span> trong
							tổng số <span className='font-medium'>{studentsData?.totalElements ?? 0}</span> học viên
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
							Trang <span className='font-medium'>{(studentsData?.number ?? 0) + 1}</span> /{' '}
							<span className='font-medium'>{studentsData?.totalPages ?? 0}</span>
						</p>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToPreviousPage}
							disabled={studentsData?.first}
							className='rounded-full p-2 h-8 w-8'
						>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToNextPage}
							disabled={studentsData?.last}
							className='rounded-full p-2 h-8 w-8'
						>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Dialog chi tiết sinh viên */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='max-w-2xl p-0 overflow-hidden'>
					{isLoadingStudentDetails ? (
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
							</div>
						</div>
					) : selectedStudent ? (
						<div className='flex flex-col h-full'>
							{/* Header với thông tin chính */}
							<div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
								<div className='flex flex-col md:flex-row gap-6 items-center md:items-start'>
									<Avatar className='w-24 h-24 border-4 border-white shadow-md'>
										<AvatarImage
											src={`${selectedStudent?.avatarUrl}`}
											alt={selectedStudent?.fullName}
										/>
										<AvatarFallback className='text-2xl bg-primary text-white'>
											{selectedStudent?.fullName?.charAt(0)}
										</AvatarFallback>
									</Avatar>

									<div className='flex-1 text-center md:text-left'>
										<h2 className='text-2xl font-bold mb-1'>{selectedStudent.fullName}</h2>

										<div className='flex flex-col md:flex-row gap-4 text-sm text-gray-600 mt-2'>
											<div className='flex items-center gap-1'>
												<Mail size={16} />
												<span>{selectedStudent.email}</span>
											</div>
											<div className='flex items-center gap-1'>
												<Phone size={16} />
												<span>{selectedStudent.phoneNumber}</span>
											</div>
										</div>

										<div className='mt-4'>
											{selectedStudent.blocked ? (
												<Badge className='bg-red-100 text-red-800 border-red-200'>
													Đã chặn
												</Badge>
											) : (
												<Badge className='bg-green-100 text-green-800 border-green-200'>
													Đang hoạt động
												</Badge>
											)}
										</div>
									</div>
								</div>
								<div className='flex mt-4 justify-center gap-2 md:self-center'>
									{/* Add Edit Profile button */}
									{!selectedStudent.blocked && (
										<Button variant='secondary' onClick={handleEditProfile}>
											<Pencil className='mr-2 h-4 w-4' />
											Sửa thông tin
										</Button>
									)}

									{selectedStudent.blocked ? (
										<Button
											variant='secondary'
											disabled={
												loadingStudentId === selectedStudent.id && loadingAction === 'unblock'
											}
											onClick={() => {
												handleUnblockUser(selectedStudent.id);
											}}
										>
											{loadingStudentId === selectedStudent.id && loadingAction === 'unblock' ? (
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
												loadingStudentId === selectedStudent.id && loadingAction === 'block'
											}
											onClick={() => {
												setIsBlockConfirmDialogOpen(true);
											}}
										>
											{loadingStudentId === selectedStudent.id && loadingAction === 'block' ? (
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
								</div>
							</div>

							{/* Information */}
							<div className='p-6'>
								<Card>
									<CardHeader>
										<CardTitle className='text-lg'>Thông tin học viên</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div>
												<p className='text-sm font-medium text-gray-500'>Họ và tên</p>
												<p>{selectedStudent.fullName}</p>
											</div>
											<div>
												<p className='text-sm font-medium text-gray-500'>Email</p>
												<p>{selectedStudent.email}</p>
											</div>
											<div>
												<p className='text-sm font-medium text-gray-500'>Số điện thoại</p>
												<p>{selectedStudent.phoneNumber || 'Không có'}</p>
											</div>
											<div>
												<p className='text-sm font-medium text-gray-500'>Loại người dùng</p>
												<p>{selectedStudent.userType || 'Student'}</p>
											</div>
											<div>
												<p className='text-sm font-medium text-gray-500'>Ngày tạo</p>
												<p>{new Date(selectedStudent.createdAt).toLocaleDateString('vi-VN')}</p>
											</div>
											<div>
												<p className='text-sm font-medium text-gray-500'>Cập nhật lần cuối</p>
												<p>{new Date(selectedStudent.updatedAt).toLocaleDateString('vi-VN')}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Footer */}
							<DialogFooter className='p-4 border-t bg-gray-50'>
								<Button variant='primary' onClick={handleCloseDialog}>
									Đóng
								</Button>
							</DialogFooter>
						</div>
					) : (
						<div className='p-8 text-center'>
							<p className='text-gray-500'>Không thể tải thông tin sinh viên. Vui lòng thử lại sau.</p>
							<Button variant='primary' onClick={handleCloseDialog} className='mt-4'>
								Đóng
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Dialog xác nhận chặn người dùng */}
			<Dialog open={isBlockConfirmDialogOpen} onOpenChange={setIsBlockConfirmDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Xác nhận chặn sinh viên</DialogTitle>
						<DialogDescription>
							Bạn có chắc chắn muốn chặn sinh viên này? Họ sẽ không thể đăng nhập vào hệ thống.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='danger'
							onClick={() => {
								if (selectedStudentId) {
									blockUserMutation.mutate(selectedStudentId);
								} else {
									toast.error('Không thể chặn: Thiếu ID của sinh viên');
									setIsBlockConfirmDialogOpen(false);
								}
							}}
							disabled={loadingStudentId === selectedStudentId && loadingAction === 'block'}
						>
							{loadingStudentId === selectedStudentId && loadingAction === 'block' ? (
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

			{/* Dialog chỉnh sửa thông tin sinh viên */}
			<Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
				<DialogContent className='sm:max-w-[500px]'>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa thông tin sinh viên</DialogTitle>
						<DialogDescription>Cập nhật thông tin cá nhân của sinh viên này</DialogDescription>
					</DialogHeader>

					<div className='grid gap-4 py-4'>
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
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								value={editProfileForm.email}
								onChange={(e) => handleFormChange('email', e.target.value)}
								placeholder='Nhập email'
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
								<>
									<Save className='mr-2 h-4 w-4' />
									Lưu thay đổi
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default StudentsAdmin;
