import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Voucher } from '@/services/voucher-service';
import { ChevronLeft, ChevronRight, Edit, Trash, Check, X } from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface VoucherTableProps {
	vouchers: Voucher[];
	pagination: {
		totalElements: number;
		totalPages: number;
		number: number;
		size: number;
		numberOfElements: number;
		first: boolean;
		last: boolean;
	};
	onPageChange: (newPage: number) => void;
	onPageSizeChange: (newSize: string) => void;
	onViewDetails: (voucher: Voucher) => void;
	onEdit: (voucher: Voucher) => void;
	onDelete: (voucher: Voucher) => void;
}

const VoucherTable: React.FC<VoucherTableProps> = ({
	vouchers,
	pagination,
	onPageChange,
	onPageSizeChange,
	onViewDetails,
	onEdit,
	onDelete,
}) => {
	// Format date for display
	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
		} catch (e) {
			return 'Ngày không hợp lệ';
		}
	};

	// Format price to Vietnamese format
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	// Get discount value display
	const getDiscountDisplay = (voucher: Voucher) => {
		if (voucher.discountType === 'PERCENTAGE') {
			return `${voucher.discountValue}%`;
		} else {
			return formatPrice(voucher.discountValue);
		}
	};

	// Check if voucher is active
	const isActive = (voucher: Voucher) => {
		return voucher.active;
	};

	return (
		<div className='bg-white rounded-xl shadow-sm mb-6 overflow-hidden'>
			<Table>
				<TableHeader className='bg-emerald-50'>
					<TableRow>
						<TableHead className='text-emerald-900'>Mã giảm giá</TableHead>
						<TableHead className='text-emerald-900'>Mức giảm giá</TableHead>
						<TableHead className='text-emerald-900'>Thời hạn</TableHead>
						<TableHead className='text-emerald-900 text-center'>Trạng thái</TableHead>
						<TableHead className='text-emerald-900 text-center'>Lượt sử dụng</TableHead>
						<TableHead className='text-emerald-900 text-right'>Hành động</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{vouchers?.length === 0 ? (
						<TableRow>
							<TableCell colSpan={7} className='h-24 text-center'>
								<p className='text-gray-500'>Không có mã giảm giá nào</p>
							</TableCell>
						</TableRow>
					) : (
						vouchers?.map((voucher: Voucher) => {
							const active = isActive(voucher);

							return (
								<TableRow
									key={voucher.id}
									className='cursor-pointer hover:bg-emerald-50/50 transition-colors'
								>
									<TableCell className='font-medium'>
										<div className='flex flex-col'>
											<span className='text-emerald-800 font-medium'>{voucher.code}</span>
											<span className='text-xs text-gray-500 truncate max-w-[200px]'>
												{voucher.description}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<span className='font-medium'>{getDiscountDisplay(voucher)}</span>
											{voucher.minimumPurchaseAmount > 0 && (
												<span className='text-xs text-gray-500'>
													Đơn tối thiểu: {formatPrice(voucher.minimumPurchaseAmount)}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<div className='flex items-center gap-1 text-sm'>
												<span>Từ:</span>
												<span className='font-medium'>{formatDate(voucher.validFrom)}</span>
											</div>
											<div className='flex items-center gap-1 text-sm'>
												<span>Đến:</span>
												<span className='font-medium'>{formatDate(voucher.validUntil)}</span>
											</div>
										</div>
									</TableCell>
									<TableCell className='text-center'>
										<div
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}
										>
											{active ? (
												<>
													<Check className='w-3 h-3 mr-1' />
													Đang hoạt động
												</>
											) : (
												<>
													<X className='w-3 h-3 mr-1' />
													Không hoạt động
												</>
											)}
										</div>
									</TableCell>
									<TableCell className='text-center'>
										<div className='text-sm'>
											{voucher.usageCount} / {voucher.totalUsageLimit}
										</div>
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex justify-end items-center space-x-2'>
											<Button
												variant='default'
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													onViewDetails(voucher);
												}}
											>
												Chi tiết
											</Button>
											<Button
												variant='primaryOutline'
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													onEdit(voucher);
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
													onDelete(voucher);
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
						Hiển thị <span className='font-medium'>{pagination?.numberOfElements ?? 0}</span> trong tổng số{' '}
						<span className='font-medium'>{pagination?.totalElements ?? 0}</span> mã giảm giá
					</p>
					<div className='ml-4'>
						<Select value={pagination.size.toString()} onValueChange={onPageSizeChange}>
							<SelectTrigger className='w-[70px] h-8 border-emerald-200'>
								<SelectValue placeholder={pagination.size} />
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
						Trang <span className='font-medium'>{(pagination?.number ?? 0) + 1}</span> /{' '}
						<span className='font-medium'>{pagination?.totalPages ?? 0}</span>
					</p>
					<Button
						variant='superOutline'
						size='sm'
						onClick={() => onPageChange(pagination.number - 1)}
						disabled={pagination?.first}
						className='rounded-full p-2 h-8 w-8 border-emerald-200'
					>
						<ChevronLeft className='h-4 w-4' />
					</Button>
					<Button
						variant='superOutline'
						size='sm'
						onClick={() => onPageChange(pagination.number + 1)}
						disabled={pagination?.last}
						className='rounded-full p-2 h-8 w-8 border-emerald-200'
					>
						<ChevronRight className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default VoucherTable;
