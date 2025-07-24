'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const InstructorPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.push('/tutor/course');
	}, [router]);

	return (
		<div className='flex items-center justify-center h-screen'>
			<p className='text-gray-500'>Đang chuyển hướng...</p>
		</div>
	);
};

export default InstructorPage;
