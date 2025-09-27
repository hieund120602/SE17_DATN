'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, CreditCardIcon, CheckIcon, PackageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useDictionary } from '@/hooks/use-dictionary';
import { safeString, safeImageUrl, formatPrice } from '@/lib/utils';
import ClientOnly from '@/components/client-only';

import PaymentService, { CreatePaymentRequest } from '@/services/payment-service';

// Fallback dictionary
const fallbackDict = {
	combos: {
		buyNow: 'Mua ngay',
		comboLabel: 'Combo',
		includedCourses: 'khóa học',
		savingsLabel: 'Tiết kiệm',
		off: 'giảm',
		processing: 'Đang xử lý...',
		notFound: 'Combo không tìm thấy',
		notFoundMessage: 'Gói combo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
	},
	courses: {
		viewAllCourses: 'Xem các khóa học',
		lessons: 'bài học',
		duration: 'Thời lượng',
		access: 'Quyền truy cập',
		fullLifetimeAccess: 'Truy cập trọn đời',
		certificate: 'Chứng chỉ',
		moneyBackGuarantee: 'Đảm bảo hoàn tiền trong 30 ngày',
	},
	common: {
		home: 'Trang chủ',
		back: 'Quay lại',
	},
	profile: {
		welcomeMessage: 'Xin chào, {name}',
	},
};

function PurchaseContent() {
	const params = useParams();
	const router = useRouter();
	const comboId = params.id as string;
	const lang = params.lang as string;
	const [isProcessing, setIsProcessing] = useState(false);
	const { user, isAuthenticated, isLoading: authLoading } = useAuth();

	// Dictionary for translations
	const { data: dictData } = useDictionary(lang);
	const dict = dictData || fallbackDict;

	// Redirect to login if not authenticated
	React.useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push(`/login`);
		}
	}, [isAuthenticated, authLoading, router, lang]);

	// Fetch combo details
	const {
		data: combo,
		isLoading: comboLoading,
		error: comboError,
	} = useQuery({
		queryKey: ['combo', comboId],
		queryFn: async () => {
			console.log('Fetching combo with ID:', comboId);
			const response = await fetch(`/api/combos/${comboId}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch combo: ${response.status}`);
			}
			const data = await response.json();
			console.log('Combo data received:', data);
			return data;
		},
		enabled: !!comboId && isAuthenticated,
		retry: 2,
	});

	// Payment mutation - SỬ DỤNG createPayment CHO USER ĐÃ ĐĂNG NHẬP
	const paymentMutation = useMutation({
		mutationFn: async () => {
			console.log('Starting payment process for combo:', combo);
			const currentUrl = window.location.origin;

			if (!combo) {
				throw new Error('Combo data not available');
			}

			// Prepare payment data for authenticated user
			const paymentData: CreatePaymentRequest = {
				amount: combo.discountPrice || combo.price || 0,
				orderInfo: `Mua combo: ${combo.title}`,
				comboId: parseInt(comboId),
				successRedirectUrl: `${currentUrl}/${lang}/payment/success`,
				cancelRedirectUrl: `${currentUrl}/${lang}/combos/${comboId}`,
			};

			console.log('Payment data:', paymentData);

			// SỬ DỤNG createPayment CHO USER ĐÃ ĐĂNG NHẬP
			return PaymentService.createPayment(paymentData);
		},
		onSuccess: (response) => {
			console.log('Payment created successfully:', response);
			// Redirect to VNPay
			window.location.href = response.paymentUrl;
		},
		onError: (error: any) => {
			console.error('Payment error:', error);
			const errorMessage =
				error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.';
			toast({
				title: 'Lỗi thanh toán',
				description: errorMessage,
				variant: 'destructive',
			});
			setIsProcessing(false);
		},
	});

	const handlePurchase = () => {
		console.log('Purchase button clicked');
		setIsProcessing(true);
		paymentMutation.mutate();
	};

	// Show loading if auth is loading
	if (authLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
			</div>
		);
	}

	// Redirect if not authenticated
	if (!isAuthenticated) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (comboLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (comboError || !combo) {
		console.error('Combo error:', comboError);
		return (
			<div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
				<div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6'>
					<PackageIcon className='w-12 h-12 text-red-400' />
				</div>
				<h1 className='text-3xl font-bold text-gray-800 mb-3'>{dict.combos.notFound}</h1>
				<p className='text-gray-600 text-center max-w-md mb-4'>{dict.combos.notFoundMessage}</p>
				<p className='text-red-600 text-center max-w-md mb-8'>
					{comboError?.message || 'Không thể tải thông tin combo'}
				</p>
				<Link href={`/${lang}/combos`}>
					<Button className='bg-primary hover:bg-primary/90'>{dict.courses.viewAllCourses}</Button>
				</Link>
			</div>
		);
	}

	const hasDiscount = combo.originalPrice && combo.discountPrice && combo.originalPrice > combo.discountPrice;
	const savings = hasDiscount ? combo.originalPrice - combo.discountPrice : 0;
	const savingsPercentage = hasDiscount ? Math.round((savings / combo.originalPrice) * 100) : 0;

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='bg-white border-b border-gray-200'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex items-center gap-4'>
						<Link href={`/${lang}/combos/${comboId}`}>
							<Button variant='ghost' size='sm'>
								<ArrowLeftIcon className='h-4 w-4 mr-2' />
								{dict.common.back}
							</Button>
						</Link>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>Thanh toán combo</h1>
							<p className='text-gray-600'>Xác nhận đơn hàng của bạn</p>
						</div>
					</div>
				</div>
			</div>

			<div className='container mx-auto px-4 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column - Order Summary */}
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<PackageIcon className='h-5 w-5' />
									Thông tin đơn hàng
								</CardTitle>
								<CardDescription>Xác nhận thông tin combo bạn muốn mua</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-6'>
									{/* User Greeting */}
									{user && (
										<div className='p-4 bg-primary/5 rounded-lg'>
											<p className='text-lg font-medium'>
												{dict.profile?.welcomeMessage?.replace('{name}', user.fullName || '') ||
													`Xin chào, ${user.fullName || 'bạn'}`}
											</p>
											<p className='text-sm text-gray-600'>
												Đơn hàng sẽ được liên kết với tài khoản của bạn:{' '}
												<span className='font-medium'>{user.email}</span>
											</p>
										</div>
									)}

									{/* Combo Info */}
									<div className='flex gap-6 py-4 border-t border-b'>
										<div className='relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0'>
											<Image
												src={safeImageUrl(combo.thumbnailUrl, '/images/default-combo.jpg')}
												alt={combo.title}
												fill
												className='object-cover'
											/>
										</div>
										<div className='flex-1'>
											<Badge variant='secondary' className='mb-2'>
												<PackageIcon className='w-3 h-3 mr-1' />
												{dict.combos.comboLabel || 'Combo'}
											</Badge>
											<h3 className='text-xl font-semibold leading-tight mb-2'>{combo.title}</h3>
											<p className='text-gray-600 mb-3 line-clamp-2'>{combo.description}</p>

											<div className='flex flex-wrap gap-4'>
												<div className='text-sm text-gray-600'>
													<span className='font-medium'>
														{combo.courseCount || combo.courses?.length || 0}
													</span>{' '}
													khóa học
												</div>
												<div className='text-sm text-gray-600'>
													<span className='font-medium'>{combo.totalDuration || '40h'}</span>{' '}
													thời lượng
												</div>
												<div className='text-sm text-gray-600'>
													Truy cập <span className='font-medium'>trọn đời</span>
												</div>
											</div>
										</div>
									</div>

									{/* Payment Summary */}
									<div className='space-y-3'>
										<h4 className='font-medium'>Chi tiết thanh toán</h4>
										<div className='space-y-2'>
											{hasDiscount && (
												<div className='flex justify-between items-center text-gray-500'>
													<span>Giá gốc</span>
													<span className='line-through'>
														{formatPrice(combo.originalPrice)}
													</span>
												</div>
											)}
											{hasDiscount && (
												<div className='flex justify-between items-center text-green-600'>
													<span>Giảm giá ({savingsPercentage}%)</span>
													<span>-{formatPrice(savings)}</span>
												</div>
											)}
											<div className='flex justify-between items-center text-lg font-bold pt-2 border-t'>
												<span>Tổng cộng</span>
												<span className='text-secondary'>
													{formatPrice(combo.discountPrice || combo.price || 0)}
												</span>
											</div>
										</div>
									</div>

									<Alert>
										<CheckIcon className='h-4 w-4' />
										<AlertDescription className='text-sm'>
											{dict.courses.moneyBackGuarantee || 'Đảm bảo hoàn tiền trong 30 ngày'}
										</AlertDescription>
									</Alert>

									<Button
										onClick={handlePurchase}
										className='w-full bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 py-6 text-lg'
										disabled={isProcessing}
									>
										{isProcessing ? (
											<>
												<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
												{dict.combos.processing || 'Đang xử lý...'}
											</>
										) : (
											<>
												<CreditCardIcon className='h-5 w-5 mr-2' />
												Thanh toán ngay - {formatPrice(combo.discountPrice || combo.price || 0)}
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - What You Get */}
					<div className='lg:col-span-1'>
						<Card className='sticky top-6'>
							<CardHeader>
								<CardTitle>Bạn sẽ nhận được gì</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-start gap-3'>
									<CheckIcon className='h-5 w-5 text-green-500 mt-0.5' />
									<div>
										<p className='font-medium'>
											Truy cập đầy đủ {combo.courseCount || combo.courses?.length || 0} khóa học
										</p>
										<p className='text-sm text-gray-600'>Tất cả nội dung, bài tập và tài nguyên</p>
									</div>
								</div>

								<div className='flex items-start gap-3'>
									<CheckIcon className='h-5 w-5 text-green-500 mt-0.5' />
									<div>
										<p className='font-medium'>Học không giới hạn thời gian</p>
										<p className='text-sm text-gray-600'>Truy cập trọn đời với mọi cập nhật</p>
									</div>
								</div>

								<div className='flex items-start gap-3'>
									<CheckIcon className='h-5 w-5 text-green-500 mt-0.5' />
									<div>
										<p className='font-medium'>Hỗ trợ từ giảng viên</p>
										<p className='text-sm text-gray-600'>Giải đáp thắc mắc và hỗ trợ học tập</p>
									</div>
								</div>

								<div className='flex items-start gap-3'>
									<CheckIcon className='h-5 w-5 text-green-500 mt-0.5' />
									<div>
										<p className='font-medium'>Chứng chỉ hoàn thành</p>
										<p className='text-sm text-gray-600'>Sau khi hoàn thành tất cả khóa học</p>
									</div>
								</div>

								<Separator />

								<div className='text-sm text-gray-600'>
									<p className='mb-2'>Phương thức thanh toán:</p>
									<div className='flex items-center gap-2'>
										<span>💳 VNPay - Thẻ ATM/Visa/Master/JCB</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ComboPurchase() {
	return (
		<ClientOnly
			fallback={
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			}
		>
			<PurchaseContent />
		</ClientOnly>
	);
}
