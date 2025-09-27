'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, UserPlusIcon, BookOpenIcon, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import ClientOnly from '@/components/client-only';
import { toast } from '@/hooks/use-toast';

import PaymentService from '@/services/payment-service';

function PaymentSuccessContent() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const lang = params.lang as string;
	const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
	const [paymentInfo, setPaymentInfo] = useState<any>(null);
	const [userInfo, setUserInfo] = useState<any>(null);

	// Extract VNPay parameters
	const vnpayParams: any = {
		vnp_ResponseCode: searchParams.get('vnp_ResponseCode'),
		vnp_TxnRef: searchParams.get('vnp_TxnRef'),
		vnp_Amount: searchParams.get('vnp_Amount'),
		vnp_OrderInfo: searchParams.get('vnp_OrderInfo'),
		vnp_SecureHash: searchParams.get('vnp_SecureHash'),
		vnp_BankCode: searchParams.get('vnp_BankCode'),
		vnp_BankTranNo: searchParams.get('vnp_BankTranNo'),
		vnp_CardType: searchParams.get('vnp_CardType'),
		vnp_PayDate: searchParams.get('vnp_PayDate'),
		vnp_TransactionNo: searchParams.get('vnp_TransactionNo'),
	};

	// Payment verification mutation
	const verifyPaymentMutation = useMutation({
		mutationFn: PaymentService.processVnpayReturn,
		onSuccess: (response) => {
			if (response.success) {
				setVerificationStatus('success');
				setPaymentInfo(response);
				// Get stored user info
				const storedUserInfo = localStorage.getItem('pendingUserInfo');
				if (storedUserInfo) {
					setUserInfo(JSON.parse(storedUserInfo));
					localStorage.removeItem('pendingUserInfo');
				}
			} else {
				setVerificationStatus('failed');
				toast({
					title: 'Thanh toán thất bại',
					description: response.message || 'Giao dịch không thành công',
					variant: 'destructive',
				});
			}
		},
		onError: (error: any) => {
			setVerificationStatus('failed');
			toast({
				title: 'Lỗi xác thực thanh toán',
				description: 'Không thể xác thực trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.',
				variant: 'destructive',
			});
		},
	});

	useEffect(() => {
		// Verify payment when component mounts
		if (vnpayParams.vnp_ResponseCode) {
			verifyPaymentMutation.mutate(vnpayParams);
		} else {
			setVerificationStatus('failed');
		}
	}, []);

	if (verificationStatus === 'loading') {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4'></div>
					<h2 className='text-xl font-semibold text-gray-800 mb-2'>Đang xác thực thanh toán...</h2>
					<p className='text-gray-600'>Vui lòng đợi trong giây lát</p>
				</div>
			</div>
		);
	}

	if (verificationStatus === 'failed') {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
				<Card className='w-full max-w-md'>
					<CardContent className='pt-6'>
						<div className='text-center'>
							<XCircleIcon className='w-16 h-16 text-red-500 mx-auto mb-4' />
							<h2 className='text-2xl font-bold text-gray-800 mb-2'>Thanh toán thất bại</h2>
							<p className='text-gray-600 mb-6'>Giao dịch không thành công hoặc đã bị hủy</p>
							<Link href={`/${lang}/courses`}>
								<Button className='w-full'>Quay lại trang khóa học</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-12'>
			<div className='container mx-auto px-4'>
				<div className='max-w-2xl mx-auto'>
					{/* Success Header */}
					<div className='text-center mb-8'>
						<CheckCircleIcon className='w-20 h-20 text-green-500 mx-auto mb-4' />
						<h1 className='text-3xl font-bold text-gray-800 mb-2'>Thanh toán thành công!</h1>
						<p className='text-gray-600'>Cảm ơn bạn đã mua combo. Chúng tôi đang xử lý đơn hàng của bạn.</p>
					</div>

					{/* Payment Info */}
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle>Thông tin thanh toán</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-600'>Mã giao dịch</label>
									<p className='font-mono text-sm bg-gray-100 p-2 rounded'>
										{vnpayParams.vnp_TxnRef}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Số tiền</label>
									<p className='text-lg font-semibold text-green-600'>
										{vnpayParams.vnp_Amount
											? new Intl.NumberFormat('vi-VN', {
													style: 'currency',
													currency: 'VND',
											  }).format(parseInt(vnpayParams.vnp_Amount) / 100)
											: 'N/A'}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Ngân hàng</label>
									<p>{vnpayParams.vnp_BankCode || 'N/A'}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Thời gian</label>
									<p>
										{vnpayParams.vnp_PayDate
											? new Date(
													vnpayParams.vnp_PayDate.substring(0, 4) +
														'-' +
														vnpayParams.vnp_PayDate.substring(4, 6) +
														'-' +
														vnpayParams.vnp_PayDate.substring(6, 8) +
														'T' +
														vnpayParams.vnp_PayDate.substring(8, 10) +
														':' +
														vnpayParams.vnp_PayDate.substring(10, 12) +
														':' +
														vnpayParams.vnp_PayDate.substring(12, 14)
											  ).toLocaleString('vi-VN')
											: 'N/A'}
									</p>
								</div>
							</div>
							<div>
								<label className='text-sm font-medium text-gray-600'>Thông tin đơn hàng</label>
								<p className='text-sm bg-gray-100 p-2 rounded'>{vnpayParams.vnp_OrderInfo}</p>
							</div>
						</CardContent>
					</Card>

					{/* Next Steps */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<UserPlusIcon className='h-5 w-5' />
								Bước tiếp theo
							</CardTitle>
							<CardDescription>Chúng tôi đang xử lý đơn hàng và tạo tài khoản cho bạn</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<Alert>
								<MailIcon className='h-4 w-4' />
								<AlertDescription>
									<strong>Kiểm tra email của bạn!</strong>
									<br />
									Chúng tôi đã gửi thông tin đăng nhập và hướng dẫn truy cập khóa học đến email{' '}
									<strong>{userInfo?.email}</strong>. Vui lòng kiểm tra cả hộp thư spam.
								</AlertDescription>
							</Alert>

							<div className='bg-blue-50 p-4 rounded-lg'>
								<h4 className='font-semibold text-blue-800 mb-2'>Những gì bạn sẽ nhận được:</h4>
								<ul className='space-y-2 text-sm text-blue-700'>
									<li className='flex items-center gap-2'>
										<CheckCircleIcon className='h-4 w-4' />
										Tài khoản học viên được tạo tự động
									</li>
									<li className='flex items-center gap-2'>
										<CheckCircleIcon className='h-4 w-4' />
										Quyền truy cập ngay lập tức vào tất cả khóa học trong combo
									</li>
									<li className='flex items-center gap-2'>
										<CheckCircleIcon className='h-4 w-4' />
										Chứng chỉ hoàn thành cho mỗi khóa học
									</li>
									<li className='flex items-center gap-2'>
										<CheckCircleIcon className='h-4 w-4' />
										Hỗ trợ 24/7 từ đội ngũ JPE
									</li>
								</ul>
							</div>

							<div className='text-center space-y-4 pt-4'>
								<p className='text-gray-600'>
									Bạn có thể đăng nhập ngay bây giờ bằng email và mật khẩu được gửi qua email
								</p>
								<div className='space-y-2'>
									<Link href={`/${lang}/login`} className='block'>
										<Button size='lg' className='w-full'>
											<UserPlusIcon className='h-5 w-5 mr-2' />
											Đăng nhập vào tài khoản
										</Button>
									</Link>
									<Link href={`/${lang}/combos`} className='block'>
										<Button variant='superOutline' size='lg' className='w-full'>
											<BookOpenIcon className='h-5 w-5 mr-2' />
											Xem thêm combo khác
										</Button>
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Support */}
					<div className='text-center mt-8'>
						<p className='text-gray-600 text-sm'>
							Gặp vấn đề?{' '}
							<Link href={`/${lang}/contact`} className='text-primary hover:underline'>
								Liên hệ hỗ trợ
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PaymentSuccess() {
	return (
		<ClientOnly
			fallback={
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			}
		>
			<Suspense fallback={
				<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4'></div>
						<h2 className='text-xl font-semibold text-gray-800 mb-2'>Đang tải...</h2>
						<p className='text-gray-600'>Vui lòng đợi trong giây lát</p>
					</div>
				</div>
			}>
				<PaymentSuccessContent />
			</Suspense>
		</ClientOnly>
	);
}
