'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PaymentService, { VnpayReturnParams, PaymentVerificationResponse } from '@/services/payment-service';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface PaymentHandlerProps {
	dictionary: any;
	lang: string;
}

export default function PaymentHandler({ dictionary, lang }: PaymentHandlerProps) {
	const [isMounted, setIsMounted] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [paymentState, setPaymentState] = useState<{
		isProcessing: boolean;
		isSuccess: boolean;
		message: string;
		orderInfo: string;
		amount: number;
		isError: boolean;
	}>({
		isProcessing: false,
		isSuccess: false,
		message: '',
		orderInfo: '',
		amount: 0,
		isError: false,
	});

	const searchParams = useSearchParams();
	const router = useRouter();

	// Process payment only once when component is mounted and has VNPay parameters
	useEffect(() => {
		if (!isMounted) return;

		// Check if we have VNPay parameters in the URL
		const hasVnpayParams =
			searchParams && searchParams.get('vnp_ResponseCode') && searchParams.get('vnp_SecureHash');

		if (!hasVnpayParams) return;

		// Don't re-process if we've already done it
		if (showPaymentModal) return;

		const processVnpayReturn = async () => {
			console.log('VNPay parameters detected in URL:', Object.fromEntries(searchParams.entries()));
			setShowPaymentModal(true);
			setPaymentState((prev) => ({ ...prev, isProcessing: true }));

			try {
				// Convert searchParams to an object
				const queryParams: Record<string, string> = {};
				searchParams.forEach((value, key) => {
					queryParams[key] = value;
				});

				// Check if we have the required parameters
				if (
					!queryParams.vnp_ResponseCode ||
					!queryParams.vnp_TxnRef ||
					!queryParams.vnp_Amount ||
					!queryParams.vnp_OrderInfo ||
					!queryParams.vnp_SecureHash
				) {
					throw new Error('Missing required VNPay parameters');
				}

				// VNPay success is indicated by response code '00'
				const isVnpaySuccess = queryParams.vnp_ResponseCode === '00';

				if (!isVnpaySuccess) {
					// If VNPay directly reports failure, don't even call our API
					setPaymentState({
						isProcessing: false,
						isSuccess: false,
						message: 'Payment was declined by the payment provider.',
						orderInfo: queryParams.vnp_OrderInfo || '',
						amount: parseInt(queryParams.vnp_Amount || '0') / 100,
						isError: false,
					});
					return;
				}

				// Process payment verification with backend
				const result = await PaymentService.processVnpayReturn(queryParams as any);
				console.log('Payment verification result:', result);

				// Successful payment
				setPaymentState({
					isProcessing: false,
					isSuccess: true,
					message: result.message || 'Payment processed successfully!',
					orderInfo: result.orderInfo || queryParams.vnp_OrderInfo || '',
					amount: result.amount || parseInt(queryParams.vnp_Amount || '0') / 100,
					isError: false,
				});

				// Clean the URL to remove payment parameters after successful processing
				// This prevents reprocessing on page refresh
				const baseURL = window.location.pathname;
				window.history.replaceState({}, document.title, baseURL);
			} catch (error) {
				console.error('Error processing payment result:', error);
				setPaymentState({
					isProcessing: false,
					isSuccess: false,
					message:
						'An error occurred while processing your payment. The transaction may still have been successful. Please check your account or contact support.',
					orderInfo: '',
					amount: 0,
					isError: true,
				});
			}
		};

		processVnpayReturn();
	}, [isMounted, searchParams, showPaymentModal]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	// Handler to close modal and clean URL if needed
	const handleCloseModal = () => {
		setShowPaymentModal(false);

		// Clean the URL if it still has VNPay parameters
		if (window.location.search.includes('vnp_')) {
			const baseURL = window.location.pathname;
			window.history.replaceState({}, document.title, baseURL);
		}
	};

	// Only render modal if needed
	if (!showPaymentModal) {
		return null;
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative'>
				{/* Close button */}
				<button className='absolute top-3 right-3 text-gray-500 hover:text-gray-700' onClick={handleCloseModal}>
					<X className='h-5 w-5' />
				</button>

				{paymentState.isProcessing ? (
					<div className='flex flex-col items-center justify-center py-8'>
						<Loader2 className='h-16 w-16 text-primary animate-spin mb-4' />
						<h2 className='text-2xl font-bold text-gray-800'>
							{dictionary?.payment?.processing || 'Processing Payment'}
						</h2>
						<p className='text-gray-600 text-center mt-2'>
							{dictionary?.payment?.pleaseWait || 'Please wait while we process your payment...'}
						</p>
					</div>
				) : paymentState.isSuccess ? (
					<div className='flex flex-col items-center justify-center py-8'>
						<CheckCircle className='h-16 w-16 text-green-500 mb-4' />
						<h2 className='text-2xl font-bold text-gray-800'>
							{dictionary?.payment?.success || 'Payment Successful!'}
						</h2>
						<p className='text-gray-600 text-center mt-2'>
							{paymentState.message || 'Your payment has been processed successfully.'}
						</p>
						{paymentState.orderInfo && (
							<p className='text-sm text-gray-500 mt-1'>{paymentState.orderInfo}</p>
						)}
						{paymentState.amount > 0 && (
							<p className='text-lg font-semibold text-primary mt-3'>
								{formatPrice(
									paymentState.amount,
									lang === 'jp' ? 'ja-JP' : 'vi-VN',
									lang === 'jp' ? 'JPY' : 'VND'
								)}
							</p>
						)}
						<Link href={`/${lang}/my-courses`} className='mt-6'>
							<Button className='bg-primary hover:bg-primary-dark text-white px-6 py-2'>
								{dictionary?.payment?.goToCourses || 'Go to My Courses'}
							</Button>
						</Link>
					</div>
				) : (
					<div className='flex flex-col items-center justify-center py-8'>
						<XCircle className='h-16 w-16 text-red-500 mb-4' />
						<h2 className='text-2xl font-bold text-gray-800'>
							{dictionary?.payment?.failed || 'Payment Failed'}
						</h2>
						<p className='text-gray-600 text-center mt-2'>
							{paymentState.message || 'There was an issue processing your payment.'}
						</p>
						{paymentState.orderInfo && (
							<p className='text-sm text-gray-500 mt-1'>{paymentState.orderInfo}</p>
						)}
						<div className='flex gap-3 mt-6'>
							<Button variant='primaryOutline' onClick={handleCloseModal}>
								{dictionary?.payment?.close || 'Close'}
							</Button>
							<Link href={`/${lang}/courses`}>
								<Button className='bg-primary hover:bg-primary-dark text-white px-6 py-2'>
									{dictionary?.payment?.tryAgain || 'Try Again'}
								</Button>
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
