'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, BookOpen, Loader2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import PaymentService from '@/services/payment-service';

interface EnrollButtonProps {
	courseId: number;
	isEnrolled: boolean;
	dictionary: any;
	price: number; // Added price prop
}

const EnrollButton = ({ courseId, isEnrolled, dictionary, price }: EnrollButtonProps) => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const params = useParams();
	const lang = (params.lang as string) || 'vi';
	const { toast } = useToast();
	const { user, isLoading, isAuthenticated } = useAuth();

	const handleEnroll = async () => {
		if (isEnrolled) {
			// If already enrolled, navigate to learning page
			router.push(`/${lang}/learning/courses/${courseId}`);
			return;
		}

		// If not authenticated, show toast and redirect to login
		if (!isAuthenticated && !isLoading) {
			sonnerToast.success(dictionary?.common?.loginRequired || 'Please login to continue');
			router.push('/login');
			return;
		}

		// If authenticated but not enrolled, create payment
		try {
			setLoading(true);

			// Prepare payment data with the course price from props
			const paymentData = {
				amount: price, // Use the price passed from the parent component
				orderInfo: `Enroll in course #${courseId}`,
				courseId: courseId,
				studentId: user?.id ? Number(user.id) : undefined, // Convert to number if it exists
				// Redirect URLs - using the current URL path as base
				successRedirectUrl: `${window.location.origin}/${lang}/payment/success`,
				cancelRedirectUrl: `${window.location.origin}/${lang}/payment/cancel`,
			};

			// Call the payment service to create a payment
			const paymentResponse = await PaymentService.createPayment(paymentData);

			// Redirect to the payment URL
			if (paymentResponse && paymentResponse.paymentUrl) {
				// Store transaction ID in localStorage for verification later if needed
				localStorage.setItem('currentTransactionId', paymentResponse.transactionId);

				// Redirect to the payment gateway
				window.location.href = paymentResponse.paymentUrl;
			} else {
				throw new Error('Invalid payment response');
			}
		} catch (error) {
			console.error('Payment error:', error);
			toast({
				title: dictionary.courses.enrollError,
				description: dictionary.courses.enrollErrorDescription,
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			onClick={handleEnroll}
			className='w-full py-7 text-lg shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 hover:translate-y-[-2px] rounded-xl'
			disabled={loading || isLoading}
		>
			{loading ? (
				<div className='flex items-center justify-center'>
					<Loader2 className='h-5 w-5 mr-2 animate-spin' />
					{dictionary.courses.processing}
				</div>
			) : isEnrolled ? (
				<div className='flex items-center justify-center'>
					<BookOpen className='h-5 w-5 mr-2' />
					{dictionary.courses.continueToLearning}
				</div>
			) : (
				<div className='flex items-center justify-center'>
					<ShoppingCart className='h-5 w-5 mr-2' />
					{dictionary.courses.enrollNow}
				</div>
			)}
		</Button>
	);
};

export default EnrollButton;
