'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { QRTransferResponse } from '@/services/payment-service';
import { useToast } from '@/hooks/use-toast';

interface QRPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	paymentData: QRTransferResponse | null;
	onRefresh?: () => void;
}

export default function QRPaymentModal({ isOpen, onClose, paymentData, onRefresh }: QRPaymentModalProps) {
	const { toast } = useToast();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleCopyBankInfo = () => {
		if (paymentData?.bankAccountInfo) {
			navigator.clipboard.writeText(paymentData.bankAccountInfo);
			toast({
				title: 'Đã sao chép',
				description: 'Thông tin tài khoản đã được sao chép vào clipboard',
			});
		}
	};

	const handleRefresh = async () => {
		if (onRefresh) {
			setIsRefreshing(true);
			try {
				await onRefresh();
				toast({
					title: 'Đã cập nhật',
					description: 'Thông tin thanh toán đã được cập nhật',
				});
			} catch (error) {
				toast({
					title: 'Lỗi',
					description: 'Không thể cập nhật thông tin thanh toán',
					variant: 'destructive',
				});
			} finally {
				setIsRefreshing(false);
			}
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'WAITING_CONFIRMATION':
				return 'bg-yellow-100 text-yellow-800';
			case 'COMPLETED':
				return 'bg-green-100 text-green-800';
			case 'REJECTED':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'WAITING_CONFIRMATION':
				return 'Chờ xác nhận';
			case 'COMPLETED':
				return 'Hoàn thành';
			case 'REJECTED':
				return 'Bị từ chối';
			default:
				return status;
		}
	};

	if (!paymentData) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-xl overflow-y-auto max-h-[96vh]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<span>Thanh toán chuyển khoản</span>
						<Badge className={getStatusColor(paymentData.status)}>
							{getStatusText(paymentData.status)}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					{/* QR Code */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Mã QR</CardTitle>
							<CardDescription>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col items-center space-y-4'>
							<div className='relative'>
								<img src='/images/qrcode.png' alt='QR Code' className='w-48 h-48 border rounded-lg' />
							</div>
							<div className='text-center'>
								<p className='text-sm text-gray-600'>Mã giao dịch:</p>
								<p className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
									{paymentData.transactionId}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Bank Information */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Thông tin tài khoản</CardTitle>
							<CardDescription>Chuyển khoản đến tài khoản sau</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<div className='flex justify-between items-center'>
									<span className='text-sm font-medium'>Số tiền:</span>
									<span className='font-bold text-lg'>
										{paymentData.amount.toLocaleString('vi-VN')} VND
									</span>
								</div>
								{/* <div className='bg-gray-50 p-3 rounded-lg'>
									<pre className='text-sm whitespace-pre-wrap font-mono'>
										{paymentData.bankAccountInfo}
									</pre>
								</div>
								<Button
									variant='superOutline'
									size='sm'
									onClick={handleCopyBankInfo}
									className='w-full'
								>
									<Copy className='w-4 h-4 mr-2' />
									Sao chép thông tin
								</Button> */}
							</div>
						</CardContent>
					</Card>

					{/* Payment Details */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Chi tiết thanh toán</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2'>
							<div className='flex justify-between'>
								<span className='text-sm text-gray-600'>Nội dung:</span>
								<span className='text-sm font-medium'>Email của bạn</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-sm text-gray-600'>Thời gian tạo:</span>
								<span className='text-sm'>
									{new Date(paymentData.createdAt).toLocaleString('vi-VN')}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className='flex gap-2'>
						<Button
							variant='superOutline'
							onClick={handleRefresh}
							disabled={isRefreshing}
							className='flex-1'
						>
							<RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
							Cập nhật trạng thái
						</Button>
						<Button onClick={onClose} className='flex-1'>
							Đóng
						</Button>
					</div>

					{/* Status Message */}
					{/* {paymentData.message && (
						<div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
							<p className='text-sm text-blue-800'>{paymentData.message}</p>
						</div>
					)} */}
				</div>
			</DialogContent>
		</Dialog>
	);
}
