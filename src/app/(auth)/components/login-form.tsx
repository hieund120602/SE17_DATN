'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthService, { LoginParams } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
	email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
	password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
	const { toast } = useToast();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onTouched',
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);

		try {
			const loginParams: LoginParams = {
				email: data.email,
				password: data.password,
			};

			const response = await AuthService.login(loginParams);

			toast({
				title: 'Đăng nhập thành công',
				description: 'Bạn đã đăng nhập thành công.',
				variant: 'success',
			});

			if (response?.user.roles?.[0] === 'ROLE_ADMIN') {
				router.push('/admin');
			} else if (response?.user.roles?.[0] === 'ROLE_TUTOR') {
				router.push('/tutor/course');
			} else {
				router.push('/');
			}
			console.log('response', response);
		} catch (error) {
			console.error('Login failed:', error);
			toast({
				title: 'Đăng nhập thất bại',
				description: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<Card className='border-none shadow-none'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className='pt-6 space-y-4'>
					<div className='space-y-2'>
						<Input
							id='email'
							placeholder='Email'
							autoComplete='email'
							{...register('email')}
							type='email'
						/>
						{errors.email && <p className='text-red-500 text-xs'>{errors.email.message}</p>}
					</div>
					<div className='space-y-2'>
						<div className='relative'>
							<Input
								id='password'
								placeholder='Mật khẩu'
								autoComplete='current-password'
								{...register('password')}
								type={showPassword ? 'text' : 'password'}
							/>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
								onClick={togglePasswordVisibility}
								tabIndex={-1}
							>
								{showPassword ? (
									<EyeOff className='h-4 w-4 text-gray-400' />
								) : (
									<Eye className='h-4 w-4 text-gray-400' />
								)}
							</Button>
						</div>
						{errors.password && <p className='text-red-500 text-xs'>{errors.password.message}</p>}
						<div className='flex items-end justify-end'>
							<Link
								href='/forgot-password'
								className='text-sm text-sky-500 hover:text-sky-600 hover:underline'
							>
								Quên mật khẩu?
							</Link>
						</div>
					</div>
				</CardContent>
				<CardFooter className='flex flex-col space-y-4'>
					<Button type='submit' variant='primary' className='w-full' disabled={isLoading}>
						{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
					</Button>
					<div className='relative w-full'>
						<div className='flex items-center my-2'>
							<div className='flex-grow border-t-2 border-gray-200 border'></div>
							<span className='px-4 text-gray-500 text-sm font-medium uppercase'>hoặc</span>
							<div className='flex-grow border-t-2 border-gray-200 border'></div>
						</div>
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}
