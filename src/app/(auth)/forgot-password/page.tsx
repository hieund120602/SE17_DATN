'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AuthService from '@/lib/auth-service';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await AuthService.forgotPassword(email);
			toast({
				title: 'Thành công',
				description: res.message || 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.',
				variant: 'success',
			});
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Đã xảy ra lỗi',
				description: error?.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex items-center justify-center sec-com'>
			<Card className='w-full max-w-md p-6'>
				<CardContent>
					<h1 className='text-2xl font-bold mb-6 text-center'>Quên mật khẩu</h1>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='example@email.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<Button type='submit' className='w-full' disabled={loading}>
							{loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ForgotPassword;
