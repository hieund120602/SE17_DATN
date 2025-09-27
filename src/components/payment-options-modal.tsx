'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, QrCode, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import PaymentService, { QRTransferPaymentRequest } from '@/services/payment-service';
import QRPaymentModal from './qr-payment-modal';
import { QRTransferResponse } from '@/services/payment-service';

interface PaymentOptionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	courseId: number;
	price: number;
	dictionary: any;
}

export default function PaymentOptionsModal({
	isOpen,
	onClose,
	courseId,
	price,
	dictionary,
}: PaymentOptionsModalProps) {
	const [selectedMethod, setSelectedMethod] = useState<'vnpay' | 'qr'>('vnpay');
	const [loading, setLoading] = useState(false);
	const [qrPaymentData, setQrPaymentData] = useState<QRTransferResponse | null>(null);
	const [showQRModal, setShowQRModal] = useState(false);

	const router = useRouter();
	const params = useParams();
	const lang = (params.lang as string) || 'vi';
	const { toast } = useToast();
	const { user } = useAuth();

	const handlePayment = async () => {
		if (!user) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng đăng nhập để thanh toán',
				variant: 'destructive',
			});
			return;
		}

		setLoading(true);
		try {
			if (selectedMethod === 'vnpay') {
				// VNPay payment
				const paymentData = {
					amount: price,
					orderInfo: `Thanh toan khoa hoc #${courseId}`,
					courseId: courseId,
					studentId: user.id ? Number(user.id) : undefined,
					successRedirectUrl: `${window.location.origin}/${lang}/payment/success`,
					cancelRedirectUrl: `${window.location.origin}/${lang}/payment/cancel`,
				};

				const paymentResponse = await PaymentService.createPayment(paymentData);

				if (paymentResponse && paymentResponse.paymentUrl) {
					localStorage.setItem('currentTransactionId', paymentResponse.transactionId);
					window.location.href = paymentResponse.paymentUrl;
				} else {
					throw new Error('Invalid payment response');
				}
			} else {
				// QR Transfer payment
				const qrPaymentData: QRTransferPaymentRequest = {
					amount: price,
					orderInfo: `Thanh toan khoa hoc #${courseId}`,
					successRedirectUrl: `${window.location.origin}/${lang}/payment/success`,
					cancelRedirectUrl: `${window.location.origin}/${lang}/payment/cancel`,
					bankAccountInfo: 'Ngân hàng: Vietcombank\nSố tài khoản: 1234567890\nChủ tài khoản: CÔNG TY ABC',
				};

				const qrResponse = await PaymentService.createQRTransferPayment(qrPaymentData);
				setQrPaymentData(qrResponse);
				setShowQRModal(true);
				onClose(); // Close payment options modal
			}
		} catch (error) {
			console.error('Payment error:', error);
			toast({
				title: 'Lỗi',
				description: 'Không thể tạo thanh toán. Vui lòng thử lại.',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
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

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Chọn phương thức thanh toán</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						<div className='text-center mb-4'>
							<p className='text-lg font-semibold'>{price.toLocaleString('vi-VN')} VND</p>
							<p className='text-sm text-gray-600'>Thanh toán khóa học #{courseId}</p>
						</div>

						<RadioGroup
							value={selectedMethod}
							onValueChange={(value) => setSelectedMethod(value as 'vnpay' | 'qr')}
						>
							<div className='space-y-3'>
								<Card
									className={`cursor-pointer transition-all ${
										selectedMethod === 'vnpay' ? 'ring-2 ring-primary' : ''
									}`}
								>
									<CardHeader className='pb-3'>
										<div className='flex items-center space-x-3'>
											<RadioGroupItem value='vnpay' id='vnpay' />
											<div className='flex items-center space-x-2'>
												<CreditCard className='w-5 h-5' />
												<Label htmlFor='vnpay' className='text-base font-medium cursor-pointer'>
													Thanh toán VNPay
												</Label>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription>
											Thanh toán nhanh chóng qua VNPay với thẻ ATM, thẻ tín dụng hoặc ví điện tử
										</CardDescription>
									</CardContent>
								</Card>

								<Card
									className={`cursor-pointer transition-all ${
										selectedMethod === 'qr' ? 'ring-2 ring-primary' : ''
									}`}
								>
									<CardHeader className='pb-3'>
										<div className='flex items-center space-x-3'>
											<RadioGroupItem value='qr' id='qr' />
											<div className='flex items-center space-x-2'>
												<QrCode className='w-5 h-5' />
												<Label htmlFor='qr' className='text-base font-medium cursor-pointer'>
													Chuyển khoản QR
												</Label>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription>
											Quét mã QR để chuyển khoản ngân hàng. Admin sẽ xác nhận sau khi nhận được
											tiền
										</CardDescription>
									</CardContent>
								</Card>
							</div>
						</RadioGroup>

						<div className='flex gap-2 pt-4'>
							<Button variant='superOutline' onClick={onClose} className='flex-1'>
								Hủy
							</Button>
							<Button onClick={handlePayment} disabled={loading} className='flex-1'>
								{loading ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Đang xử lý...
									</>
								) : (
									'Tiếp tục'
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* QR Payment Modal */}
			<QRPaymentModal
				isOpen={showQRModal}
				onClose={() => setShowQRModal(false)}
				paymentData={qrPaymentData}
				onRefresh={handleRefreshQRPayment}
			/>
		</>
	);
}
