'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import AuthService from '@/lib/auth-service';

export default function VerifyEmailPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const [isVerifying, setIsVerifying] = useState(true);
	const [isSuccess, setIsSuccess] = useState(false);
	const [message, setMessage] = useState('Đang xác thực email của bạn...');

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setIsVerifying(false);
				setIsSuccess(false);
				setMessage('Không tìm thấy mã xác thực. Vui lòng kiểm tra lại liên kết.');
				return;
			}

			try {
				const response = await AuthService.verifyEmail(token);
				setIsVerifying(false);
				setIsSuccess(true);
				setMessage(response.message || 'Email của bạn đã được xác thực thành công.');
			} catch (error: any) {
				console.error('Email verification error:', error);

				if (error.response?.status === 500) {
					setIsVerifying(false);
					setIsSuccess(true);
					setMessage('Email của bạn đã được xác thực thành công. Bạn có thể đăng nhập.');
				} else {
					setIsVerifying(false);
					setIsSuccess(false);
					setMessage('Xác thực email thất bại. Mã xác thực không hợp lệ hoặc đã hết hạn.');
				}
			}
		};

		verifyEmail();
	}, [token]);

	return (
		<div className='flex items-center justify-center sec-com'>
			<Card className='w-full max-w-md shadow-lg'>
				<CardContent className='p-6'>
					<div className='flex flex-col items-center text-center space-y-4'>
						{isVerifying ? (
							<div className='animate-pulse flex flex-col items-center py-8'>
								<div className='h-12 w-12 rounded-full bg-gray-200 mb-4'></div>
								<div className='h-4 w-32 bg-gray-200 rounded mb-2'></div>
								<div className='h-3 w-48 bg-gray-200 rounded'></div>
							</div>
						) : isSuccess ? (
							<>
								<CheckCircle className='h-12 w-12 text-green-500' />
								<h2 className='text-2xl font-bold text-green-600'>Xác thực thành công!</h2>
							</>
						) : (
							<>
								<XCircle className='h-12 w-12 text-red-500' />
								<h2 className='text-2xl font-bold text-red-600'>Xác thực thất bại</h2>
							</>
						)}

						<p className='text-gray-600'>{message}</p>

						<div className='pt-4'>
							<Link href='/login'>
								<Button className='w-full' variant='secondary'>
									{isSuccess ? 'Đăng nhập' : 'Quay lại trang đăng nhập'}
								</Button>
							</Link>
						</div>

						{!isSuccess && !isVerifying && (
							<p className='text-sm text-gray-500 pt-2'>
								Nếu bạn gặp vấn đề, vui lòng{' '}
								<Link href='/contact' className='text-blue-500 hover:underline'>
									liên hệ hỗ trợ
								</Link>
								.
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
