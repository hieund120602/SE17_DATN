'use client';
import DeleteConfirmation from '@/app/(admin)/admin/components/delete-voucher';
import VoucherDetail from '@/app/(admin)/admin/components/voucher-detail';
import VoucherForm from '@/app/(admin)/admin/components/voucher-form';
import VoucherTable from '@/app/(admin)/admin/components/voucher-table';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import CourseService from '@/services/course-service';
import VoucherService, { Voucher, VoucherCreateUpdateRequest } from '@/services/voucher-service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'sonner';

const VoucherAdmin = () => {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);
	const [deletingVoucherId, setDeletingVoucherId] = useState<number | null>(null);
	const [deletingVoucherCode, setDeletingVoucherCode] = useState<string>('');
	const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);

	// Tạo ngày với thời gian 12:00 để tránh vấn đề múi giờ
	const createNormalizedDate = (daysToAdd = 0): string => {
		const date = new Date();
		date.setDate(date.getDate() + daysToAdd);
		date.setHours(12, 0, 0, 0);
		return date.toISOString();
	};

	const [formData, setFormData] = useState<VoucherCreateUpdateRequest>({
		code: '',
		description: '',
		discountType: 'PERCENTAGE',
		discountValue: 0,
		minimumPurchaseAmount: 0,
		maximumDiscountAmount: 0,
		validFrom: createNormalizedDate(),
		validUntil: createNormalizedDate(30), // 30 days later
		totalUsageLimit: 100,
		perUserLimit: 1,
		applicableCourseIds: [],
		applicableComboIds: [],
	});

	const queryClient = useQueryClient();

	// Get all vouchers query
	const { data: voucherData, isLoading: isLoadingVouchers } = useQuery<any>({
		queryKey: ['vouchers', 'all', page, pageSize],
		queryFn: () => VoucherService.getAllVouchers(page, pageSize),
	});

	// Fetch data for applicable courses and combos
	const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
		queryKey: ['courses', 'all', page, pageSize],
		queryFn: () => CourseService.getAllCourses(page, pageSize),
	});

	const { data: combosData, isLoading: isLoadingCombos } = useQuery({
		queryKey: ['combos', 'all'],
		queryFn: async () => {
			// This is a placeholder - you would need to implement a ComboService for this
			// return ComboService.getAllCombos(0, 100);
			return { content: [] }; // Placeholder
		},
	});

	// Create voucher mutation
	const createVoucherMutation = useMutation({
		mutationFn: (data: VoucherCreateUpdateRequest) => VoucherService.createVoucher(data),
		onSuccess: () => {
			resetForm();
			setIsCreateDialogOpen(false);
			setErrorMessage(null);
			queryClient.invalidateQueries({ queryKey: ['vouchers'] });
			toast.success('Mã giảm giá đã được tạo thành công!');
		},
		onError: (error: any) => {
			const message = error.message || 'Không thể tạo mã giảm giá. Vui lòng thử lại!';
			setErrorMessage(message);
			toast.error(message);
		},
	});

	// Update voucher mutation
	const updateVoucherMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: VoucherCreateUpdateRequest }) =>
			VoucherService.updateVoucher(id, data),
		onSuccess: () => {
			resetForm();
			setIsEditDialogOpen(false);
			setEditingVoucherId(null);
			setErrorMessage(null);
			queryClient.invalidateQueries({ queryKey: ['vouchers'] });
			toast.success('Mã giảm giá đã được cập nhật thành công!');
		},
		onError: (error: any) => {
			const message = error.message || 'Không thể cập nhật mã giảm giá. Vui lòng thử lại!';
			setErrorMessage(message);
			toast.error(message);
		},
	});

	// Delete voucher mutation
	const deleteVoucherMutation = useMutation({
		mutationFn: (id: number) => VoucherService.deleteVoucher(id),
		onSuccess: () => {
			setIsDeleteDialogOpen(false);
			setDeletingVoucherId(null);
			setDeletingVoucherCode('');
			setErrorMessage(null);
			queryClient.invalidateQueries({ queryKey: ['vouchers'] });
			toast.success('Mã giảm giá đã được xóa thành công!');
		},
		onError: (error: any) => {
			const message = error.message || 'Không thể xóa mã giảm giá. Vui lòng thử lại!';
			setErrorMessage(message);
			toast.error(message);
		},
	});

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: parseFloat(value) || 0,
		}));
	};

	const handleSelectChange = (id: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleDateChange = (id: string, isoString: string) => {
		setFormData((prev) => ({
			...prev,
			[id]: isoString,
		}));
	};

	const handleToggleCourse = (courseId: number) => {
		setFormData((prev) => {
			const isSelected = prev.applicableCourseIds.includes(courseId);
			const newCourseIds = isSelected
				? prev.applicableCourseIds.filter((id) => id !== courseId)
				: [...prev.applicableCourseIds, courseId];

			return {
				...prev,
				applicableCourseIds: newCourseIds,
			};
		});
	};

	const handleToggleCombo = (comboId: number) => {
		setFormData((prev) => {
			const isSelected = prev.applicableComboIds.includes(comboId);
			const newComboIds = isSelected
				? prev.applicableComboIds.filter((id) => id !== comboId)
				: [...prev.applicableComboIds, comboId];

			return {
				...prev,
				applicableComboIds: newComboIds,
			};
		});
	};

	// Action handlers
	const resetForm = () => {
		setFormData({
			code: '',
			description: '',
			discountType: 'PERCENTAGE',
			discountValue: 0,
			minimumPurchaseAmount: 0,
			maximumDiscountAmount: 0,
			validFrom: createNormalizedDate(),
			validUntil: createNormalizedDate(30),
			totalUsageLimit: 100,
			perUserLimit: 1,
			applicableCourseIds: [],
			applicableComboIds: [],
		});
		setEditingVoucherId(null);
		setErrorMessage(null);
	};

	const handleCreateSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.code.trim()) {
			toast.error('Vui lòng nhập mã giảm giá');
			return;
		}
		createVoucherMutation.mutate(formData);
	};

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.code.trim()) {
			toast.error('Vui lòng nhập mã giảm giá');
			return;
		}
		if (editingVoucherId) {
			updateVoucherMutation.mutate({ id: editingVoucherId, data: formData });
		}
	};

	const handleEditClick = async (voucher: Voucher) => {
		try {
			const fullVoucher = await VoucherService.getVoucherById(voucher.id);

			setFormData({
				code: fullVoucher.code,
				description: fullVoucher.description,
				discountType: fullVoucher.discountType,
				discountValue: fullVoucher.discountValue,
				minimumPurchaseAmount: fullVoucher.minimumPurchaseAmount,
				maximumDiscountAmount: fullVoucher.maximumDiscountAmount,
				validFrom: fullVoucher.validFrom,
				validUntil: fullVoucher.validUntil,
				totalUsageLimit: fullVoucher.totalUsageLimit,
				perUserLimit: fullVoucher.perUserLimit,
				applicableCourseIds: fullVoucher.applicableCourses.map((course) => course.id),
				applicableComboIds: fullVoucher.applicableCombos.map((combo) => combo.id),
			});

			setEditingVoucherId(voucher.id);
			setErrorMessage(null);
			setIsEditDialogOpen(true);
		} catch (error: any) {
			toast.error(error.message || 'Không thể lấy thông tin voucher. Vui lòng thử lại!');
		}
	};

	const handleDeleteClick = (voucher: Voucher) => {
		setDeletingVoucherId(voucher.id);
		setDeletingVoucherCode(voucher.code);
		setErrorMessage(null);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (deletingVoucherId) {
			deleteVoucherMutation.mutate(deletingVoucherId);
		}
	};

	const handleViewDetails = async (voucher: Voucher) => {
		try {
			const fullVoucher = await VoucherService.getVoucherById(voucher.id);
			setDetailVoucher(fullVoucher);
			setIsDetailDialogOpen(true);
		} catch (error: any) {
			toast.error(error.message || 'Không thể lấy thông tin chi tiết. Vui lòng thử lại!');
		}
	};

	// Pagination handlers
	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (value: string) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	if (isLoadingVouchers) {
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
				<h1 className='text-3xl font-bold text-emerald-700'>Quản lý Mã Giảm Giá</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button variant='secondary' onClick={() => resetForm()}>
							Tạo mã giảm giá
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[550px] max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Tạo mã giảm giá</DialogTitle>
							<DialogDescription>Tạo mã giảm giá mới cho khóa học hoặc combo</DialogDescription>
						</DialogHeader>
						<VoucherForm
							formData={formData}
							errorMessage={errorMessage}
							isLoading={createVoucherMutation.isPending}
							courses={coursesData?.content || []}
							isLoadingCourses={isLoadingCourses}
							combos={combosData?.content || []}
							isLoadingCombos={isLoadingCombos}
							onInputChange={handleInputChange}
							onNumberInputChange={handleNumberInputChange}
							onSelectChange={handleSelectChange}
							onDateChange={handleDateChange}
							onToggleCourse={handleToggleCourse}
							onToggleCombo={handleToggleCombo}
							onSubmit={handleCreateSubmit}
							onCancel={() => setIsCreateDialogOpen(false)}
							submitButtonText='Tạo mã giảm giá'
						/>
					</DialogContent>
				</Dialog>

				{/* Edit Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className='sm:max-w-[550px] max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Chỉnh sửa mã giảm giá</DialogTitle>
							<DialogDescription>Cập nhật thông tin mã giảm giá</DialogDescription>
						</DialogHeader>
						<VoucherForm
							formData={formData}
							errorMessage={errorMessage}
							isLoading={updateVoucherMutation.isPending}
							courses={coursesData?.content || []}
							isLoadingCourses={isLoadingCourses}
							combos={combosData?.content || []}
							isLoadingCombos={isLoadingCombos}
							onInputChange={handleInputChange}
							onNumberInputChange={handleNumberInputChange}
							onSelectChange={handleSelectChange}
							onDateChange={handleDateChange}
							onToggleCourse={handleToggleCourse}
							onToggleCombo={handleToggleCombo}
							onSubmit={handleEditSubmit}
							onCancel={() => setIsEditDialogOpen(false)}
							submitButtonText='Lưu thay đổi'
						/>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={isDeleteDialogOpen}
					onOpenChange={(open) => {
						if (!errorMessage || open) {
							setIsDeleteDialogOpen(open);
							if (!open) {
								setErrorMessage(null);
							}
						}
					}}
				>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Xác nhận xóa mã giảm giá</DialogTitle>
							<DialogDescription>
								Bạn có chắc chắn muốn xóa mã giảm giá "
								<span className='font-semibold'>{deletingVoucherCode}</span>"?
							</DialogDescription>
						</DialogHeader>
						<DeleteConfirmation
							itemName='mã giảm giá'
							itemCode={deletingVoucherCode}
							errorMessage={errorMessage}
							isDeleting={deleteVoucherMutation.isPending}
							onConfirm={handleDeleteConfirm}
							onCancel={() => setIsDeleteDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>

				{/* Detail Dialog */}
				<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
					<DialogContent className='sm:max-w-[550px] max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Chi tiết mã giảm giá</DialogTitle>
							<DialogDescription>Thông tin chi tiết về mã giảm giá</DialogDescription>
						</DialogHeader>
						{detailVoucher && (
							<VoucherDetail voucher={detailVoucher} onClose={() => setIsDetailDialogOpen(false)} />
						)}
					</DialogContent>
				</Dialog>
			</div>

			{/* Vouchers Table */}
			{voucherData && (
				<VoucherTable
					vouchers={voucherData.content}
					pagination={voucherData}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
					onViewDetails={handleViewDetails}
					onEdit={handleEditClick}
					onDelete={handleDeleteClick}
				/>
			)}
		</div>
	);
};

export default VoucherAdmin;
