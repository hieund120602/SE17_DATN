'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Eye, QrCode } from 'lucide-react';
import { PaymentResponse, QRTransferResponse } from '@/services/payment-service';
import PaymentService from '@/services/payment-service';
import { useToast } from '@/hooks/use-toast';
import QRPaymentModal from './qr-payment-modal';

export default function PaymentHistory() {
	const { toast } = useToast();
	const [payments, setPayments] = useState<PaymentResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
	const [showPaymentDetail, setShowPaymentDetail] = useState(false);
	const [qrPaymentData, setQrPaymentData] = useState<QRTransferResponse | null>(null);
	const [showQRModal, setShowQRModal] = useState(false);

	useEffect(() => {
		loadPaymentHistory();
	}, []);

	const loadPaymentHistory = async () => {
		setLoading(true);
		try {
			const data = await PaymentService.getMyPaymentHistory();
			setPayments(data.content);
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể tải lịch sử thanh toán',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleViewPayment = (payment: PaymentResponse) => {
		setSelectedPayment(payment);
		setShowPaymentDetail(true);
	};

	const handleViewQRPayment = async (payment: PaymentResponse) => {
		try {
			const qrData = await PaymentService.getQRTransferPayment(payment.id);
			setQrPaymentData(qrData);
			setShowQRModal(true);
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể tải thông tin thanh toán QR',
				variant: 'destructive',
			});
		}
	};

	const handleRefreshQRPayment = async () => {
		if (qrPaymentData) {
			try {
				const updatedPayment = await PaymentService.getQRTransferPayment(qrPaymentData.paymentId);
				setQrPaymentData(updatedPayment);
			} catch (error) {
				toast({
					title: 'Lỗi',
					description: 'Không thể cập nhật thông tin thanh toán',
					variant: 'destructive',
				});
			}
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'WAITING_CONFIRMATION':
				return 'bg-yellow-100 text-yellow-800';
			case 'PENDING':
				return 'bg-blue-100 text-blue-800';
			case 'COMPLETED':
				return 'bg-green-100 text-green-800';
			case 'REJECTED':
				return 'bg-red-100 text-red-800';
			case 'FAILED':
				return 'bg-red-100 text-red-800';
			case 'CANCELED':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'WAITING_CONFIRMATION':
				return 'Chờ xác nhận';
			case 'PENDING':
				return 'Đang xử lý';
			case 'COMPLETED':
				return 'Hoàn thành';
			case 'REJECTED':
				return 'Bị từ chối';
			case 'FAILED':
				return 'Thất bại';
			case 'CANCELED':
				return 'Đã hủy';
			default:
				return status;
		}
	};

	const getMethodText = (method: string) => {
		switch (method) {
			case 'QR_TRANSFER':
				return 'Chuyển khoản QR';
			case 'VNPAY':
				return 'VNPay';
			default:
				return method;
		}
	};

	const PaymentCard = ({ payment }: { payment: PaymentResponse }) => (
		<Card key={payment.id} className='mb-4'>
			<CardHeader>
				<div className='flex justify-between items-start'>
					<div>
						<CardTitle className='text-lg'>Thanh toán #{payment.id}</CardTitle>
						<CardDescription>{payment.orderInfo}</CardDescription>
					</div>
					<div className='flex gap-2'>
						<Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
						<Badge variant='outline'>{getMethodText(payment.method)}</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-2 gap-4 mb-4'>
					<div>
						<p className='text-sm text-gray-600'>Số tiền:</p>
						<p className='font-bold text-lg'>{payment.amount.toLocaleString('vi-VN')} VND</p>
					</div>
					<div>
						<p className='text-sm text-gray-600'>Thời gian:</p>
						<p className='text-sm'>{new Date(payment.createdAt).toLocaleString('vi-VN')}</p>
					</div>
				</div>
 
				{payment.adminNotes && (
					<div className='mb-4'>
						<p className='text-sm text-gray-600'>Ghi chú admin:</p>
						<p className='text-sm bg-yellow-50 p-2 rounded'>{payment.adminNotes}</p>
					</div>
				)}

				<div className='flex gap-2'>
					{payment.method === 'QR_TRANSFER' && payment.status === 'WAITING_CONFIRMATION' && (
						<Button size='sm' variant='superOutline' onClick={() => handleViewQRPayment(payment)}>
							<QrCode className='w-4 h-4 mr-2' />
							Xem QR
						</Button>
					)}
					<Button size='sm' variant='superOutline' onClick={() => handleViewPayment(payment)}>
						<Eye className='w-4 h-4 mr-2' />
						Chi tiết
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold'>Lịch sử thanh toán</h1>
					<p className='text-gray-600'>Xem tất cả các giao dịch thanh toán của bạn</p>
				</div>
				<Button onClick={loadPaymentHistory} disabled={loading}>
					<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
					Làm mới
				</Button>
			</div>

			{payments.length === 0 ? (
				<Card>
					<CardContent className='text-center py-8'>
						<p className='text-gray-500'>Chưa có giao dịch thanh toán nào</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{payments.map((payment) => (
						<PaymentCard key={payment.id} payment={payment} />
					))}
				</div>
			)}

			{/* Payment Detail Dialog */}
			<Dialog open={showPaymentDetail} onOpenChange={setShowPaymentDetail}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Chi tiết thanh toán #{selectedPayment?.id}</DialogTitle>
					</DialogHeader>

					{selectedPayment && (
						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-gray-600'>Số tiền:</p>
									<p className='font-bold text-lg'>
										{selectedPayment.amount.toLocaleString('vi-VN')} VND
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-600'>Phương thức:</p>
									<p className='text-sm font-medium'>{getMethodText(selectedPayment.method)}</p>
								</div>
							</div>

							<div>
								<p className='text-sm text-gray-600'>Nội dung:</p>
								<p className='text-sm font-medium'>{selectedPayment.orderInfo}</p>
							</div>

							<div>
								<p className='text-sm text-gray-600'>Trạng thái:</p>
								<Badge className={getStatusColor(selectedPayment.status)}>
									{getStatusText(selectedPayment.status)}
								</Badge>
							</div>

							<div>
								<p className='text-sm text-gray-600'>Thời gian tạo:</p>
								<p className='text-sm'>{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</p>
							</div>

							{selectedPayment.paidAt && (
								<div>
									<p className='text-sm text-gray-600'>Thời gian hoàn thành:</p>
									<p className='text-sm'>
										{new Date(selectedPayment.paidAt).toLocaleString('vi-VN')}
									</p>
								</div>
							)}

							{selectedPayment.adminNotes && (
								<div>
									<p className='text-sm text-gray-600'>Ghi chú admin:</p>
									<p className='text-sm bg-yellow-50 p-2 rounded'>{selectedPayment.adminNotes}</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* QR Payment Modal */}
			<QRPaymentModal
				isOpen={showQRModal}
				onClose={() => setShowQRModal(false)}
				paymentData={qrPaymentData}
				onRefresh={handleRefreshQRPayment}
			/>
		</div>
	);
}
