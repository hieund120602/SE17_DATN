import { Button } from '@/components/ui/button';
import { Tag, Check, X } from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Voucher } from '@/services/voucher-service';

interface VoucherDetailProps {
	voucher: Voucher;
	onClose: () => void;
}

const VoucherDetail: React.FC<VoucherDetailProps> = ({ voucher, onClose }) => {
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
		<div className='py-4 space-y-4'>
			<div className='bg-emerald-50 p-4 rounded-md'>
				<div className='flex items-center gap-2 mb-2'>
					<Tag className='h-5 w-5 text-emerald-600' />
					<h3 className='text-lg font-semibold text-emerald-800'>{voucher.code}</h3>
					<div
						className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
							isActive(voucher) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
						}`}
					>
						{isActive(voucher) ? 'Đang hoạt động' : 'Không hoạt động'}
					</div>
				</div>
				<p className='text-sm text-gray-600'>{voucher.description}</p>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='flex flex-col'>
					<span className='text-sm text-gray-500'>Giảm giá</span>
					<span className='font-medium'>{getDiscountDisplay(voucher)}</span>
				</div>
				{voucher.discountType === 'PERCENTAGE' && (
					<div className='flex flex-col'>
						<span className='text-sm text-gray-500'>Giảm tối đa</span>
						<span className='font-medium'>{formatPrice(voucher.maximumDiscountAmount)}</span>
					</div>
				)}
				<div className='flex flex-col'>
					<span className='text-sm text-gray-500'>Đơn hàng tối thiểu</span>
					<span className='font-medium'>{formatPrice(voucher.minimumPurchaseAmount)}</span>
				</div>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='flex flex-col'>
					<span className='text-sm text-gray-500'>Hiệu lực từ</span>
					<span className='font-medium'>{formatDate(voucher.validFrom)}</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-sm text-gray-500'>Hiệu lực đến</span>
					<span className='font-medium'>{formatDate(voucher.validUntil)}</span>
				</div>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='flex flex-col'>
					<span className='text-sm text-gray-500'>Lượt sử dụng còn lại</span>
					<span className='font-medium'>
						{voucher.totalUsageLimit - voucher.usageCount} / {voucher.totalUsageLimit}
					</span>
				</div>
				<div className='flex flex-col'>
					<span className='text-sm text-gray-500'>Lượt sử dụng/người dùng</span>
					<span className='font-medium'>{voucher.perUserLimit}</span>
				</div>
			</div>

			<div>
				<h4 className='mb-2 font-medium'>Áp dụng cho</h4>
				<div className='space-y-3'>
					{voucher.applicableCourses?.length > 0 || voucher.applicableCombos?.length > 0 ? (
						<>
							{voucher.applicableCourses?.length > 0 && (
								<div>
									<h5 className='text-sm text-gray-500 mb-1'>
										Khóa học ({voucher.applicableCourses.length})
									</h5>
									<div className='border rounded-md p-2 max-h-32 overflow-y-auto'>
										<ul className='text-sm space-y-1'>
											{voucher.applicableCourses.map((course) => (
												<li key={course.id} className='flex items-center gap-1'>
													<div className='h-2 w-2 rounded-full bg-emerald-400'></div>
													<span>{course.title}</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							)}
							{voucher.applicableCombos?.length > 0 && (
								<div>
									<h5 className='text-sm text-gray-500 mb-1'>
										Combo ({voucher.applicableCombos.length})
									</h5>
									<div className='border rounded-md p-2 max-h-32 overflow-y-auto'>
										<ul className='text-sm space-y-1'>
											{voucher.applicableCombos.map((combo) => (
												<li key={combo.id} className='flex items-center gap-1'>
													<div className='h-2 w-2 rounded-full bg-emerald-400'></div>
													<span>{combo.title}</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							)}
						</>
					) : (
						<p className='text-sm text-gray-500'>Áp dụng cho tất cả khóa học và combo</p>
					)}
				</div>
			</div>

			<div className='flex justify-end'>
				<Button variant='superOutline' onClick={onClose}>
					Đóng
				</Button>
			</div>
		</div>
	);
};

export default VoucherDetail;
