'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('@/app/pages/home/home-client'), {
	ssr: false,
});

export default function ClientPage({ dictionary, lang }: { dictionary: any; lang: string }) {
	const router = useRouter();
	// useEffect(() => {
	// 	if (!user) {
	// 		router.push('/login');
	// 	}
	// });

	return (
		<div>
			<HomeClient dictionary={dictionary} />
		</div>
	);
}
