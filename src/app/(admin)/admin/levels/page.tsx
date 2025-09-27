'use client';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import LevelsService from '@/services/levels-service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

const LevelsAdmin = () => {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
	});
	const [editingLevelId, setEditingLevelId] = useState<number | null>(null);
	const [deletingLevelId, setDeletingLevelId] = useState<number | null>(null);
	const [deletingLevelName, setDeletingLevelName] = useState<string>('');

	const queryClient = useQueryClient();

	const { data: levelsData, isLoading: isLoadingLevels } = useQuery<any>({
		queryKey: ['levels', page, pageSize],
		queryFn: () => LevelsService.getAllLevels(page, pageSize),
	});

	// Create level mutation
	const createLevelMutation = useMutation({
		mutationFn: (data: { name: string; description: string }) => LevelsService.createLevel(data),
		onSuccess: () => {
			// Reset form
			resetForm();
			// Close dialog
			setIsCreateDialogOpen(false);
			// Invalidate and refetch levels
			queryClient.invalidateQueries({ queryKey: ['levels'] });
			// Show success toast
			toast.success('Cấp độ đã được tạo thành công!');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Không thể tạo cấp độ. Vui lòng thử lại!');
		},
	});

	// Update level mutation
	const updateLevelMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: { name: string; description: string } }) =>
			LevelsService.updateLevel(id, data),
		onSuccess: () => {
			// Reset form
			resetForm();
			// Close dialog
			setIsEditDialogOpen(false);
			setEditingLevelId(null);
			// Invalidate and refetch levels
			queryClient.invalidateQueries({ queryKey: ['levels'] });
			// Show success toast
			toast.success('Cấp độ đã được cập nhật thành công!');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Không thể cập nhật cấp độ. Vui lòng thử lại!');
		},
	});

	// Delete level mutation
	const deleteLevelMutation = useMutation({
		mutationFn: (id: number) => LevelsService.deleteLevel(id),
		onSuccess: () => {
			// Close dialog
			setIsDeleteDialogOpen(false);
			setDeletingLevelId(null);
			setDeletingLevelName('');
			// Invalidate and refetch levels
			queryClient.invalidateQueries({ queryKey: ['levels'] });
			// Show success toast
			toast.success('Cấp độ đã được xóa thành công!');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Không thể xóa cấp độ. Vui lòng thử lại!');
		},
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const resetForm = () => {
		setFormData({ name: '', description: '' });
		setEditingLevelId(null);
	};

	const handleCreateSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast.error('Vui lòng nhập tên cấp độ');
			return;
		}
		createLevelMutation.mutate(formData);
	};

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast.error('Vui lòng nhập tên cấp độ');
			return;
		}
		if (editingLevelId) {
			updateLevelMutation.mutate({ id: editingLevelId, data: formData });
		}
	};

	const handleEditClick = (level: any) => {
		setFormData({
			name: level.name,
			description: level.description,
		});
		setEditingLevelId(level.id);
		setIsEditDialogOpen(true);
	};

	const handleDeleteClick = (level: any) => {
		setDeletingLevelId(level.id);
		setDeletingLevelName(level.name);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (deletingLevelId) {
			deleteLevelMutation.mutate(deletingLevelId);
		}
	};

	const goToNextPage = () => {
		if (levelsData && !levelsData.last) {
			setPage(page + 1);
		}
	};

	const goToPreviousPage = () => {
		if (levelsData && !levelsData.first) {
			setPage(page - 1);
		}
	};

	const handlePageSizeChange = (value: any) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	if (isLoadingLevels) {
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

	return (
		<div className='p-6 w-full mx-auto flex flex-col gap-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold text-primary'>Quản lý Cấp Độ</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button variant='secondary' onClick={() => resetForm()}>
							Tạo cấp độ
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<form onSubmit={handleCreateSubmit}>
							<DialogHeader>
								<DialogTitle>Tạo cấp độ</DialogTitle>
								<DialogDescription>Tạo cấp độ cho các khóa học của bạn</DialogDescription>
							</DialogHeader>
							<div className='py-4 flex flex-col gap-3'>
								<div className='flex flex-col gap-2'>
									<Label htmlFor='name'>Tên cấp độ</Label>
									<Input
										id='name'
										className=''
										placeholder='N1'
										value={formData.name}
										onChange={handleInputChange}
									/>
								</div>
								<div className='flex flex-col gap-2'>
									<Label htmlFor='description'>Mô tả cấp độ</Label>
									<Textarea
										id='description'
										placeholder='N1 là cấp bậc...'
										value={formData.description}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant='primary' type='submit' disabled={createLevelMutation.isPending}>
									{createLevelMutation.isPending ? 'Đang tạo...' : 'Tạo Cấp độ'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Edit Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className='sm:max-w-[425px]'>
						<form onSubmit={handleEditSubmit}>
							<DialogHeader>
								<DialogTitle>Chỉnh sửa cấp độ</DialogTitle>
								<DialogDescription>Cập nhật thông tin cấp độ</DialogDescription>
							</DialogHeader>
							<div className='py-4 flex flex-col gap-3'>
								<div className='flex flex-col gap-2'>
									<Label htmlFor='name'>Tên cấp độ</Label>
									<Input
										id='name'
										className=''
										placeholder='N1'
										value={formData.name}
										onChange={handleInputChange}
									/>
								</div>
								<div className='flex flex-col gap-2'>
									<Label htmlFor='description'>Mô tả cấp độ</Label>
									<Textarea
										id='description'
										placeholder='N1 là cấp bậc...'
										value={formData.description}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant='primary' type='submit' disabled={updateLevelMutation.isPending}>
									{updateLevelMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Xác nhận xóa cấp độ</DialogTitle>
							<DialogDescription>
								Bạn có chắc chắn muốn xóa cấp độ "
								<span className='font-semibold'>{deletingLevelName}</span>"?
							</DialogDescription>
						</DialogHeader>
						<div className='py-4'>
							<p className='text-sm text-gray-500'>
								Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến cấp độ này sẽ bị xóa vĩnh
								viễn.
							</p>
						</div>
						<DialogFooter className='flex gap-2'>
							<Button variant='superOutline' onClick={() => setIsDeleteDialogOpen(false)}>
								Hủy
							</Button>
							<Button
								variant='danger'
								onClick={handleDeleteConfirm}
								disabled={deleteLevelMutation.isPending}
							>
								{deleteLevelMutation.isPending ? 'Đang xóa...' : 'Xóa cấp độ'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Courses Table */}
			<div className='bg-white rounded-xl shadow-sm mb-6 overflow-hidden'>
				<Table>
					<TableHeader className='bg-emerald-50'>
						<TableRow>
							<TableHead className='text-emerald-900'>Tên cấp độ</TableHead>
							<TableHead className='text-emerald-900'>Mô tả cấp độ</TableHead>
							<TableHead className='text-emerald-900 text-center'>Khóa học đang sử dụng</TableHead>
							<TableHead className='text-emerald-900 text-right'>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{levelsData?.content?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className='h-24 text-center'>
									<p className='text-gray-500'>Không có cấp độ nào</p>
								</TableCell>
							</TableRow>
						) : (
							levelsData?.content?.map((level: any) => {
								return (
									<TableRow
										key={level.id}
										className='cursor-pointer hover:bg-emerald-50/50 transition-colors'
									>
										<TableCell className='font-medium text-emerald-800'>{level.name}</TableCell>
										<TableCell className='font-medium text-emerald-800'>
											{level.description}
										</TableCell>
										<TableCell>
											<div className='text-xs text-center text-gray-500'>{level.courseCount}</div>
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end items-center space-x-2'>
												<Button
													variant='primaryOutline'
													size='sm'
													onClick={(e) => {
														e.stopPropagation();
														handleEditClick(level);
													}}
												>
													<Edit className='h-4 w-4 mr-1' />
													Sửa
												</Button>
												<Button
													variant='danger'
													size='sm'
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteClick(level);
													}}
												>
													<Trash className='h-4 w-4 mr-1' />
													Xóa
												</Button>
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
							Hiển thị <span className='font-medium'>{levelsData?.numberOfElements ?? 0}</span> trong tổng
							số <span className='font-medium'>{levelsData?.totalElements ?? 0}</span> khóa học
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
							Trang <span className='font-medium'>{(levelsData?.number ?? 0) + 1}</span> /{' '}
							<span className='font-medium'>{levelsData?.totalPages ?? 0}</span>
						</p>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToPreviousPage}
							disabled={levelsData?.first}
							className='rounded-full p-2 h-8 w-8 border-emerald-200'
						>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<Button
							variant='superOutline'
							size='sm'
							onClick={goToNextPage}
							disabled={levelsData?.last}
							className='rounded-full p-2 h-8 w-8 border-emerald-200'
						>
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LevelsAdmin;
