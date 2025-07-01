'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';

const HeaderAuth = () => {
	const pathname = usePathname();

	const isLogin = pathname === '/login';
	const buttonText = isLogin ? 'Đăng ký' : 'Đăng nhập';

	return (
		<div className='w-full flex justify-between items-center pt-6'>
			<Link href='/'>
				<span className='font-semibold'>
					<X width={30} height={30} className='text-gray-400' />
				</span>
			</Link>
			<Link href={isLogin ? '/register' : '/login'}>
				<Button variant='primaryOutline'>{buttonText}</Button>
			</Link>
		</div>
	);
};

export default HeaderAuth;
