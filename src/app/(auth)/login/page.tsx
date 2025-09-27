import LoginForm from '@/app/(auth)/components/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Đăng nhập | JPE',
	description: 'Đăng nhập vào tài khoản của bạn',
};

export default function LoginPage() {
	return (
		<div className='w-full relative'>
			<div className='w-full max-w-md space-y-5 mx-auto'>
				<div className='flex flex-col space-y-2 text-center'>
					<h1 className='text-2xl font-semibold tracking-tight text-black'>Đăng nhập</h1>
					<p className='text-sm text-muted-foreground'>
						Nhập thông tin đăng nhập của bạn để truy cập vào tài khoản
					</p>
				</div>
				<LoginForm />
				<div className='flex flex-col gap-3 text-sm text-center'>
					<p>
						By signing in to Elearing, you agree to our <span className='font-bold'>Terms</span> and{' '}
						<span className='font-bold'>Privacy Policy.</span>
					</p>
					<p>
						This site is protected by reCAPTCHA Enterprise and the Google{' '}
						<span className='font-bold'>Privacy Policy</span> and{' '}
						<span className='font-bold'>Terms of Service</span> apply.
					</p>
				</div>
			</div>
		</div>
	);
}
