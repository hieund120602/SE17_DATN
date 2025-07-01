'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AccountType } from './account-creation-flow';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import AuthService, { RegisterParams } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { useTutorRegistrationStore } from '@/store/tutor-registration-store';

interface AccountDetailsStepProps {
	accountType: AccountType;
	onContinue: () => void;
	onBack?: () => void;
}

export default function AccountDetailsStep({ accountType, onContinue, onBack }: AccountDetailsStepProps) {
	const { toast } = useToast();
	const setBasicInfo = useTutorRegistrationStore((state) => state.setBasicInfo);

	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		phoneNumber: '',
		password: '',
		confirmPassword: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (accountType === 'student') {
			setIsLoading(true);
			try {
				// Keep phoneNumber as string to preserve leading zeros
				// The API will handle the conversion appropriately
				const registerParams: RegisterParams = {
					...formData,
					phoneNumber: formData.phoneNumber,
				};

				await AuthService.register(registerParams);
				toast({
					title: 'Đăng ký thành công',
					description: 'Tài khoản của bạn đã được tạo.',
					variant: 'success',
				});
				onContinue();
			} catch (error) {
				console.error('Registration error:', error);
				toast({
					title: 'Đăng ký thất bại',
					description: 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		} else {
			// For tutor registration, store data in Zustand and continue
			setBasicInfo(formData);
			onContinue();
		}
	};

	const isFormValid = () => {
		return (
			formData.fullName.trim() !== '' &&
			formData.email.trim() !== '' &&
			formData.phoneNumber.trim() !== '' &&
			formData.password.trim() !== '' &&
			formData.confirmPassword.trim() !== '' &&
			formData.password === formData.confirmPassword
		);
	};

	const toggleShowPassword = () => setShowPassword(!showPassword);
	const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

	return (
		<div className='p-6 space-y-6 w-full max-w-3xl mx-auto'>
			<div className='text-center space-y-2'>
				<h2 className='text-2xl font-bold'>
					Tạo tài khoản {accountType === 'student' ? 'Học Viên' : 'Giảng viên'}
				</h2>
				<p className='text-gray-500'>
					{accountType === 'student'
						? 'Cùng SU25Elearning nâng cao tri thức với cộng đồng Giảng Viên chất lượng.'
						: 'Tạo tài khoản dành cho Giảng viên và gia tăng thu nhập với cộng đồng học viên đông đảo của Tutor Bee.'}
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='space-y-2'>
					<Label htmlFor='fullName'>Họ tên</Label>
					<Input
						id='fullName'
						name='fullName'
						placeholder='Nguyen Van A'
						value={formData.fullName}
						onChange={handleChange}
						required
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='email'>Email</Label>
					<Input
						id='email'
						name='email'
						type='email'
						placeholder='nguyenvana@example.com'
						value={formData.email}
						onChange={handleChange}
						required
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='phoneNumber'>Số điện thoại</Label>
					<Input
						id='phoneNumber'
						name='phoneNumber'
						type='tel'
						placeholder='0123456789'
						value={formData.phoneNumber}
						onChange={handleChange}
						required
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='password'>Tạo mật khẩu</Label>
					<div className='relative'>
						<Input
							id='password'
							name='password'
							type={showPassword ? 'text' : 'password'}
							placeholder='************'
							value={formData.password}
							onChange={handleChange}
							required
						/>
						<button
							type='button'
							className='absolute right-2 top-2 text-gray-500'
							onClick={toggleShowPassword}
							tabIndex={-1}
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='confirmPassword'>Nhập lại mật khẩu</Label>
					<div className='relative'>
						<Input
							id='confirmPassword'
							name='confirmPassword'
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder='************'
							value={formData.confirmPassword}
							onChange={handleChange}
							required
						/>
						<button
							type='button'
							className='absolute right-2 top-2 text-gray-500'
							onClick={toggleShowConfirmPassword}
							tabIndex={-1}
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>

				<Button type='submit' className='w-full' variant='secondary' disabled={!isFormValid() || isLoading}>
					{isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
				</Button>

				<div className='relative'>
					<div className='absolute inset-0 flex items-center'>
						<span className='w-full border-t' />
					</div>
					<div className='relative flex justify-center text-xs uppercase'>
						<span className='bg-white px-2 text-gray-500'>or</span>
					</div>
				</div>

				<Button type='button' variant='superOutline' className='w-full flex items-center justify-center gap-2'>
					<svg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 0 24 24' width='24'>
						<path
							d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
							fill='#4285F4'
						/>
						<path
							d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
							fill='#34A853'
						/>
						<path
							d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
							fill='#FBBC05'
						/>
						<path
							d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
							fill='#EA4335'
						/>
						<path d='M1 1h22v22H1z' fill='none' />
					</svg>
					Continue with Google
				</Button>

				<div className='text-center text-sm'>
					Bạn đã có tài khoản{' '}
					<Link href='/login' className='text-blue-500 hover:underline'>
						Đăng nhập
					</Link>
				</div>
			</form>
		</div>
	);
}
