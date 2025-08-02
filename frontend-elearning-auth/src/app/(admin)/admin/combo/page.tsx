'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ComboService from '@/services/combo-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
	Package,
	Plus,
	Edit,
	Trash2,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Image,
	DollarSign,
	Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateComboForm from '@/app/(admin)/admin/components/create-combo';
import UpdateComboForm from '@/app/(admin)/admin/components/update-combo';

const ComboAdmin = () => {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [sortBy, setSortBy] = useState('createdAt');
	const [direction, setDirection] = useState('desc');
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [selectedComboId, setSelectedComboId] = useState(null);

	// Fetch combos
	const {
		data: combosData,
		isLoading: isLoadingCombos,
		error: combosError,
	} = useQuery<any>({
		queryKey: ['combos', page, pageSize, sortBy, direction],
		queryFn: () => ComboService.getAllCombos(page, pageSize, sortBy, direction),
	});

	// Fetch individual combo details
	const {
		data: selectedCombo,
		isLoading: isLoadingComboDetails,
		refetch: refetchComboDetails,
	} = useQuery({
		queryKey: ['combo', selectedComboId],
		queryFn: () => (selectedComboId ? ComboService.getComboById(selectedComboId) : null),
		enabled: !!selectedComboId,
	});

	// Delete combo mutation
	const deleteComboMutation = useMutation({
		mutationFn: (comboId: any) => ComboService.deleteCombo(comboId),
		onSuccess: () => {
			toast.success('Combo khóa học đã được xóa thành công!');
			queryClient.invalidateQueries({ queryKey: ['combos'] });
			setIsDeleteDialogOpen(false);
			setSelectedComboId(null);
		},
		onError: (error) => {
			toast.error(`Không thể xóa combo khóa học: ${error.message}`);
		},
	});

	// Open view dialog
	const openViewDialog = (comboId: any) => {
		setSelectedComboId(comboId);
		setIsViewDialogOpen(true);
	};

	// Open delete dialog
	const openDeleteDialog = (comboId: any) => {
		setSelectedComboId(comboId);
		setIsDeleteDialogOpen(true);
	};

	// Open update dialog
	const openUpdateDialog = (comboId: any) => {
		setSelectedComboId(comboId);
		setIsUpdateDialogOpen(true);
	};

	// Handle pagination
	const goToNextPage = () => {
		if (combosData && !combosData.last) {
			setPage(page + 1);
		}
	};

	const goToPreviousPage = () => {
		if (combosData && !combosData.first) {
			setPage(page - 1);
		}
	};

	const handlePageSizeChange = (value: any) => {
		setPageSize(parseInt(value));
		setPage(0); // Reset to first page when changing page size
	};

	// Format currency
	const formatCurrency = (amount: any) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	// Format date
	const formatDate = (dateString: any) => {
		try {
			return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
		} catch (error) {
			return 'N/A';
		}
	};

	if (isLoadingCombos) {
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

	if (combosError) {
		return (
			<div className='p-6 w-full mx-auto'>
				<div className='bg-red-50 text-red-600 rounded-lg p-6 text-center'>
					<h3 className='text-lg font-medium'>Đã xảy ra lỗi khi tải dữ liệu</h3>
					<p className='mt-2'>{combosError.message}</p>
					<Button
						variant='secondary'
						onClick={() => queryClient.invalidateQueries({ queryKey: ['combos'] })}
						className='mt-4'
					>
						Thử lại
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='p-6 w-full mx-auto'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-[#58cc02]'>Quản lý Combo Khóa học</h1>
				<Button
					onClick={() => setIsCreateDialogOpen(true)}
					className='bg-[#58cc02] hover:bg-[#46a302] text-white font-bold'
				>
					<Plus className='mr-2 h-5 w-5' />
					Tạo Combo Mới
				</Button>
			</div>

			{/* Filters and sorting */}
			<div className='bg-white rounded-xl shadow-sm mb-6 p-4 border border-gray-100'>
				<div className='flex flex-wrap items-center gap-4'>
					<div className='flex items-center gap-2'>
						<label htmlFor='sortBy' className='text-sm font-medium'>
							Sắp xếp theo:
						</label>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className='w-[180px] h-9'>
								<SelectValue placeholder='Sắp xếp theo' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='createdAt'>Ngày tạo</SelectItem>
								<SelectItem value='title'>Tên combo</SelectItem>
								<SelectItem value='originalPrice'>Giá gốc</SelectItem>
								<SelectItem value='discountPrice'>Giá khuyến mãi</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='flex items-center gap-2'>
						<label htmlFor='direction' className='text-sm font-medium'>
							Thứ tự:
						</label>
						<Select value={direction} onValueChange={setDirection}>
							<SelectTrigger className='w-[120px] h-9'>
								<SelectValue placeholder='Thứ tự' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='asc'>Tăng dần</SelectItem>
								<SelectItem value='desc'>Giảm dần</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Combos list */}
			<div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
				<Table>
					<TableHeader className='bg-emerald-50'>
						<TableRow>
							<TableHead className='w-[100px] text-emerald-900'>Ảnh bìa</TableHead>
							<TableHead className='text-emerald-900'>Tiêu đề</TableHead>
							<TableHead className='text-emerald-900'>Giá gốc</TableHead>
							<TableHead className='text-emerald-900'>Giá KM</TableHead>
							<TableHead className='text-emerald-900'>Giảm (%)</TableHead>
							<TableHead className='text-emerald-900'>Số khóa học</TableHead>
							<TableHead className='text-emerald-900'>Hiệu lực đến</TableHead>
							<TableHead className='text-emerald-900'>Trạng thái</TableHead>
							<TableHead className='text-right text-emerald-900'>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{combosData?.content.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className='text-center py-8 text-gray-500'>
									<Package className='mx-auto h-12 w-12 text-gray-300 mb-3' />
									<p>Chưa có combo khóa học nào. Bắt đầu bằng cách tạo combo mới.</p>
								</TableCell>
							</TableRow>
						) : (
							combosData?.content.map((combo: any) => (
								<TableRow
									key={combo.id}
									className='cursor-pointer hover:bg-gray-50 transition-colors'
									onClick={() => openViewDialog(combo.id)}
								>
									<TableCell>
										<div className='h-14 w-20 relative rounded-md overflow-hidden'>
											{combo.thumbnailUrl ? (
												<img
													src={combo.thumbnailUrl}
													alt={combo.title}
													className='h-full w-full object-cover'
												/>
											) : (
												<div className='h-full w-full bg-gray-200 flex items-center justify-center'>
													<Image className='h-6 w-6 text-gray-400' />
												</div>
											)}
										</div>
									</TableCell>
									<TableCell className='font-medium'>{combo.title}</TableCell>
									<TableCell>{formatCurrency(combo.originalPrice)}</TableCell>
									<TableCell className='text-[#ff4b4b] font-medium'>
										{formatCurrency(combo.discountPrice)}
									</TableCell>
									<TableCell>
										<Badge
											variant='outline'
											className='bg-purple-50 text-purple-700 border-purple-200'
										>
											{combo.discountPercentage}%
										</Badge>
									</TableCell>
									<TableCell>{combo.courses?.length || 0}</TableCell>
									<TableCell>{formatDate(combo.validUntil)}</TableCell>
									<TableCell>
										{combo.active ? (
											<Badge
												variant='outline'
												className='bg-green-50 text-green-700 border-green-200'
											>
												Đang hoạt động
											</Badge>
										) : (
											<Badge
												variant='outline'
												className='bg-gray-100 text-gray-700 border-gray-200'
											>
												Không hoạt động
											</Badge>
										)}
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end gap-2'>
											<Button
												variant='ghost'
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													openUpdateDialog(combo.id);
												}}
												className='text-blue-600 hover:text-blue-800 hover:bg-blue-50'
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													openDeleteDialog(combo.id);
												}}
												className='text-red-600 hover:text-red-800 hover:bg-red-50'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				{/* Pagination */}
				{combosData?.content.length > 0 && (
					<div className='flex items-center justify-between px-4 py-3 border-t'>
						<div className='flex items-center gap-2'>
							<p className='text-sm text-gray-700'>
								Hiển thị <span className='font-medium'>{combosData?.numberOfElements || 0}</span> trong
								tổng số <span className='font-medium'>{combosData?.totalElements || 0}</span> combo
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
								Trang <span className='font-medium'>{(combosData?.number || 0) + 1}</span> /{' '}
								<span className='font-medium'>{combosData?.totalPages || 0}</span>
							</p>
							<Button
								variant='superOutline'
								size='sm'
								onClick={goToPreviousPage}
								disabled={combosData?.first}
								className='rounded-full p-2 h-8 w-8'
							>
								<ChevronLeft className='h-4 w-4' />
							</Button>
							<Button
								variant='superOutline'
								size='sm'
								onClick={goToNextPage}
								disabled={combosData?.last}
								className='rounded-full p-2 h-8 w-8'
							>
								<ChevronRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Create Combo Form */}
			<CreateComboForm
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ['combos'] });
				}}
			/>

			{/* Update Combo Form */}
			{isUpdateDialogOpen && selectedComboId && (
				<UpdateComboForm
					isOpen={isUpdateDialogOpen}
					onClose={() => setIsUpdateDialogOpen(false)}
					comboId={selectedComboId}
					onSuccess={() => {
						queryClient.invalidateQueries({ queryKey: ['combos'] });
						queryClient.invalidateQueries({ queryKey: ['combo', selectedComboId] });
					}}
				/>
			)}

			{/* View combo dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
					{isLoadingComboDetails ? (
						<div className='p-6 space-y-4'>
							<Skeleton className='h-8 w-1/2' />
							<Skeleton className='h-4 w-3/4' />
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
								<Skeleton className='h-24 w-full' />
								<Skeleton className='h-24 w-full' />
							</div>
							<Skeleton className='h-40 w-full mt-4' />
						</div>
					) : selectedCombo ? (
						<>
							<DialogHeader>
								<div className='flex justify-between items-center'>
									<div>
										<DialogTitle className='text-xl font-bold'>{selectedCombo.title}</DialogTitle>
										<p className='text-sm text-gray-500 mt-1'>ID: {selectedCombo.id}</p>
									</div>
									<Badge
										variant='outline'
										className={
											selectedCombo.active
												? 'bg-green-50 text-green-700 border-green-200'
												: 'bg-gray-100 text-gray-700 border-gray-200'
										}
									>
										{selectedCombo.active ? 'Đang hoạt động' : 'Không hoạt động'}
									</Badge>
								</div>
							</DialogHeader>

							<div className='space-y-6 mt-4'>
								{/* Banner image */}
								<div className='w-full h-60 rounded-lg overflow-hidden bg-gray-100 relative'>
									{selectedCombo.thumbnailUrl ? (
										<img
											src={selectedCombo.thumbnailUrl}
											alt={selectedCombo.title}
											className='w-full h-full object-cover'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center'>
											<Image className='h-12 w-12 text-gray-300' />
										</div>
									)}
								</div>

								<Tabs defaultValue='details' className='w-full'>
									<TabsList className='mb-4 bg-transparent border-b w-full justify-start'>
										<TabsTrigger
											value='details'
											className='rounded-none border-b-2 border-transparent data-[state=active]:border-[#58cc02] data-[state=active]:text-[#58cc02] data-[state=active]:bg-white'
										>
											Thông tin chi tiết
										</TabsTrigger>
										<TabsTrigger
											value='courses'
											className='rounded-none border-b-2 border-transparent data-[state=active]:border-[#58cc02] data-[state=active]:text-[#58cc02] data-[state=active]:bg-white'
										>
											Khóa học trong combo
										</TabsTrigger>
									</TabsList>

									<TabsContent value='details' className='mt-0'>
										<div className='grid grid-cols-1 gap-3'>
											<Card>
												<CardHeader className='pb-2'>
													<CardTitle className='text-base flex items-center gap-2'>
														<DollarSign className='h-4 w-4 text-[#ff4b4b]' />
														Thông tin giá
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className='space-y-2'>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>Giá gốc:</span>
															<span className='line-through'>
																{formatCurrency(selectedCombo.originalPrice)}
															</span>
														</div>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>
																Giá khuyến mãi:
															</span>
															<span className='font-semibold text-[#ff4b4b]'>
																{formatCurrency(selectedCombo.discountPrice)}
															</span>
														</div>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>Giảm giá:</span>
															<Badge
																variant='outline'
																className='bg-purple-50 text-purple-700 border-purple-200'
															>
																{selectedCombo.discountPercentage}%
															</Badge>
														</div>
													</div>
												</CardContent>
											</Card>

											<Card>
												<CardHeader className='pb-2'>
													<CardTitle className='text-base flex items-center gap-2'>
														<Calendar className='h-4 w-4 text-blue-500' />
														Thời gian
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className='space-y-2'>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>Ngày tạo:</span>
															<span>{formatDate(selectedCombo.createdAt)}</span>
														</div>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>
																Cập nhật lần cuối:
															</span>
															<span>{formatDate(selectedCombo.updatedAt)}</span>
														</div>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>Hiệu lực đến:</span>
															<span className='font-medium'>
																{formatDate(selectedCombo.validUntil)}
															</span>
														</div>
														<div className='flex justify-between items-center'>
															<span className='text-sm text-gray-500'>
																Thời gian truy cập:
															</span>
															<span>{selectedCombo.accessPeriodMonths} tháng</span>
														</div>
													</div>
												</CardContent>
											</Card>
										</div>

										<Card className='mt-4'>
											<CardHeader className='pb-2'>
												<CardTitle className='text-base'>Mô tả combo</CardTitle>
											</CardHeader>
											<CardContent>
												<p className='whitespace-pre-line'>{selectedCombo.description}</p>
											</CardContent>
										</Card>
									</TabsContent>

									<TabsContent value='courses' className='mt-0'>
										{selectedCombo.courses && selectedCombo.courses.length > 0 ? (
											<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
												{selectedCombo.courses.map((course) => (
													<Card key={course.id} className='overflow-hidden'>
														<div className='h-32 overflow-hidden'>
															{course.thumbnailUrl ? (
																<img
																	src={course.thumbnailUrl}
																	alt={course.title}
																	className='w-full h-full object-cover'
																/>
															) : (
																<div className='w-full h-full bg-gray-100 flex items-center justify-center'>
																	<Image className='h-8 w-8 text-gray-300' />
																</div>
															)}
														</div>
														<CardHeader className='pb-2'>
															<CardTitle className='text-base'>{course.title}</CardTitle>
														</CardHeader>
														<CardContent className='pt-0'>
															<div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
																<Badge
																	variant='outline'
																	className='bg-blue-50 text-blue-700 border-blue-200'
																>
																	{course.level?.name || 'N/A'}
																</Badge>
																<div className='flex items-center gap-1'>
																	<Award className='h-4 w-4' />
																	<span>{course.tutor?.fullName || 'N/A'}</span>
																</div>
															</div>
															<div className='flex justify-between items-center'>
																<span className='font-medium'>
																	{formatCurrency(course.price || 0)}
																</span>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className='text-center py-8 bg-gray-50 rounded-lg'>
												<Package className='h-12 w-12 text-gray-300 mx-auto mb-2' />
												<p className='text-gray-500'>Combo này chưa có khóa học nào.</p>
											</div>
										)}
									</TabsContent>
								</Tabs>
							</div>

							<DialogFooter className='flex flex-row justify-between mt-6'>
								<div>
									<Button variant='primary' onClick={() => setIsViewDialogOpen(false)}>
										Đóng
									</Button>
								</div>
								<div className='flex gap-2'>
									<Button
										variant='danger'
										onClick={() => {
											setIsViewDialogOpen(false);
											openDeleteDialog(selectedCombo.id);
										}}
									>
										<Trash2 className='mr-2 h-4 w-4' />
										Xóa
									</Button>
									<Button
										variant='secondary'
										onClick={() => {
											setIsViewDialogOpen(false);
											openUpdateDialog(selectedCombo.id);
										}}
									>
										<Edit className='mr-2 h-4 w-4' />
										Chỉnh sửa
									</Button>
								</div>
							</DialogFooter>
						</>
					) : (
						<div className='text-center py-8'>
							<p className='text-gray-500'>Không thể tải thông tin combo. Vui lòng thử lại sau.</p>
							<Button variant='primary' onClick={() => setIsViewDialogOpen(false)} className='mt-4'>
								Đóng
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle className='text-red-600'>Xóa Combo Khóa học</DialogTitle>
						<DialogDescription>
							Bạn có chắc chắn muốn xóa combo khóa học này? Hành động này không thể hoàn tác.
						</DialogDescription>
					</DialogHeader>

					<div className='border rounded-md p-4 bg-red-50 mt-2'>
						<p className='font-medium'>{selectedCombo?.title}</p>
						<p className='text-sm text-gray-700 mt-1'>
							Combo gồm {selectedCombo?.courses?.length || 0} khóa học
						</p>
					</div>

					<DialogFooter className='mt-6'>
						<Button variant='superOutline' onClick={() => setIsDeleteDialogOpen(false)}>
							Hủy
						</Button>
						<Button
							variant='danger'
							onClick={() => deleteComboMutation.mutate(selectedComboId)}
							disabled={deleteComboMutation.isPending}
						>
							{deleteComboMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang xử lý...
								</>
							) : (
								<>
									<Trash2 className='mr-2 h-4 w-4' />
									Xác nhận xóa
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ComboAdmin;
