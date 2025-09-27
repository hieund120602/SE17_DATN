'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Eye, RefreshCw } from 'lucide-react';
import { PaymentResponse, AdminProcessPaymentRequest } from '@/services/payment-service';
import PaymentService from '@/services/payment-service';
import { useToast } from '@/hooks/use-toast';

export default function AdminPaymentManagement() {
	const { toast } = useToast();
	const [payments, setPayments] = useState<PaymentResponse[]>([]);
	const [pendingPayments, setPendingPayments] = useState<PaymentResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
	const [processDialogOpen, setProcessDialogOpen] = useState(false);
	const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');
	const [adminNotes, setAdminNotes] = useState('');
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		loadPayments();
	}, []);

	const loadPayments = async () => {
		setLoading(true);
		try {
			const [waitingData, pendingData] = await Promise.all([
				PaymentService.getPaymentsWaitingConfirmation(),
				PaymentService.getPendingPayments(),
			]);
			setPayments(waitingData.content);
			setPendingPayments(pendingData.content);
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể tải danh sách thanh toán',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleProcessPayment = (payment: PaymentResponse, action: 'approve' | 'reject') => {
		setSelectedPayment(payment);
		setProcessAction(action);
		setAdminNotes('');
		setProcessDialogOpen(true);
	};

	const confirmProcessPayment = async () => {
		if (!selectedPayment) return;

		setProcessing(true);
		try {
			const request: AdminProcessPaymentRequest = {
				paymentId: selectedPayment.id,
				action: processAction,
				adminNotes: adminNotes.trim() || undefined,
			};

			await PaymentService.processPayment(request);

			toast({
				title: 'Thành công',
				description: `Đã ${processAction === 'approve' ? 'chấp nhận' : 'từ chối'} thanh toán`,
			});

			setProcessDialogOpen(false);
			loadPayments(); // Reload data
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể xử lý thanh toán',
				variant: 'destructive',
			});
		} finally {
			setProcessing(false);
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
						<CardDescription>
							{payment.student?.fullName} - {payment.student?.email}
						</CardDescription>
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

				<div className='mb-4'>
					<p className='text-sm text-gray-600'>Nội dung:</p>
					<p className='text-sm font-medium'>{payment.orderInfo}</p>
				</div>

				{payment.qrCodeUrl && (
					<div className='mb-4'>
						<p className='text-sm text-gray-600'>QR Code:</p>
						<img src={payment.qrCodeUrl} alt='QR Code' className='w-24 h-24 border rounded' />
					</div>
				)}

				{payment.bankAccountInfo && (
					<div className='mb-4'>
						<p className='text-sm text-gray-600'>Thông tin ngân hàng:</p>
						<pre className='text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap'>
							{payment.bankAccountInfo}
						</pre>
					</div>
				)}

				{payment.adminNotes && (
					<div className='mb-4'>
						<p className='text-sm text-gray-600'>Ghi chú admin:</p>
						<p className='text-sm bg-yellow-50 p-2 rounded'>{payment.adminNotes}</p>
					</div>
				)}

				<div className='flex gap-2'>
					{payment.status === 'WAITING_CONFIRMATION' && (
						<>
							<Button
								size='sm'
								onClick={() => handleProcessPayment(payment, 'approve')}
								className='flex-1'
							>
								<Check className='w-4 h-4 mr-2' />
								Chấp nhận
							</Button>
							<Button
								size='sm'
								variant='danger'
								onClick={() => handleProcessPayment(payment, 'reject')}
								className='flex-1'
							>
								<X className='w-4 h-4 mr-2' />
								Từ chối
							</Button>
						</>
					)}
					<Button size='sm' variant='superOutline'>
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
					<h1 className='text-2xl font-bold'>Quản lý thanh toán</h1>
					<p className='text-gray-600'>Xử lý các thanh toán chuyển khoản và VNPay</p>
				</div>
				<Button onClick={loadPayments} disabled={loading}>
					<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
					Làm mới
				</Button>
			</div>

			<Tabs defaultValue='waiting' className='w-full'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='waiting'>Chờ xác nhận ({payments.length})</TabsTrigger>
					<TabsTrigger value='pending'>Đang xử lý ({pendingPayments.length})</TabsTrigger>
				</TabsList>

				<TabsContent value='waiting' className='space-y-4'>
					{payments.length === 0 ? (
						<Card>
							<CardContent className='text-center py-8'>
								<p className='text-gray-500'>Không có thanh toán nào chờ xác nhận</p>
							</CardContent>
						</Card>
					) : (
						payments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
					)}
				</TabsContent>

				<TabsContent value='pending' className='space-y-4'>
					{pendingPayments.length === 0 ? (
						<Card>
							<CardContent className='text-center py-8'>
								<p className='text-gray-500'>Không có thanh toán nào đang xử lý</p>
							</CardContent>
						</Card>
					) : (
						pendingPayments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
					)}
				</TabsContent>
			</Tabs>

			{/* Process Payment Dialog */}
			<Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{processAction === 'approve' ? 'Chấp nhận' : 'Từ chối'} thanh toán</DialogTitle>
						<DialogDescription>
							{processAction === 'approve'
								? 'Xác nhận rằng bạn đã nhận được chuyển khoản từ người dùng'
								: 'Từ chối thanh toán này'}
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						{selectedPayment && (
							<div className='bg-gray-50 p-4 rounded-lg'>
								<p className='text-sm font-medium'>Thanh toán #{selectedPayment.id}</p>
								<p className='text-sm text-gray-600'>
									{selectedPayment.student?.fullName} -{' '}
									{selectedPayment.amount.toLocaleString('vi-VN')} VND
								</p>
							</div>
						)}

						<div>
							<label className='text-sm font-medium'>Ghi chú (tùy chọn):</label>
							<Textarea
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
								placeholder='Nhập ghi chú cho thanh toán này...'
								className='mt-1'
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant='superOutline'
							onClick={() => setProcessDialogOpen(false)}
							disabled={processing}
						>
							Hủy
						</Button>
						<Button
							onClick={confirmProcessPayment}
							disabled={processing}
							variant={processAction === 'approve' ? 'default' : 'danger'}
						>
							{processing ? 'Đang xử lý...' : processAction === 'approve' ? 'Chấp nhận' : 'Từ chối'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
