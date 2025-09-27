'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, BookOpen, Loader2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import PaymentOptionsModal from './payment-options-modal';

interface EnrollButtonProps {
	courseId: number;
	isEnrolled: boolean;
	dictionary: any;
	price: number; // Added price prop
}

const EnrollButton = ({ courseId, isEnrolled, dictionary, price }: EnrollButtonProps) => {
	const [loading, setLoading] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
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

		// If authenticated but not enrolled, show payment options
		setShowPaymentModal(true);
	};

	return (
		<>
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

			{/* Payment Options Modal */}
			<PaymentOptionsModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				courseId={courseId}
				price={price}
				dictionary={dictionary}
			/>
		</>
	);
};

export default EnrollButton;
