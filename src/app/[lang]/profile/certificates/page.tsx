'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import CertificateDisplay from '@/components/certificate-display';
import CertificateService from '@/services/certificate-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function CertificatesPage() {
	const params = useParams();
	const lang = params.lang as string;
	const [page, setPage] = useState(0);

	// Fetch certificates
	const {
		data: certificatesData,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['certificates', page],
		queryFn: () => CertificateService.getMyCertificates(page),
	});

	// Fetch dictionary
	const { data: dict, isLoading: isDictLoading } = useQuery({
		queryKey: ['dictionary', lang],
		queryFn: async () => {
			const response = await fetch(`/api/dictionary?lang=${lang}`);
			if (!response.ok) {
				throw new Error('Failed to fetch dictionary');
			}
			return response.json();
		},
	});

	if (isDictLoading) {
		return (
			<div className='container-lg py-8'>
				<div className='max-w-4xl mx-auto'>
					<Skeleton className='h-8 w-40 mb-6' />
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{[...Array(6)].map((_, i) => (
							<div key={i} className='border rounded-lg p-4'>
								<Skeleton className='h-6 w-3/4 mb-2' />
								<Skeleton className='h-4 w-1/2 mb-4' />
								<Skeleton className='h-16 w-full' />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='container-lg py-8'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center'>
						<h1 className='text-2xl font-bold mb-4'>
							{dict?.certificates?.errorTitle || 'Lỗi tải chứng chỉ'}
						</h1>
						<p className='text-gray-600 mb-4'>
							{dict?.certificates?.errorMessage || 'Không thể tải danh sách chứng chỉ. Vui lòng thử lại.'}
						</p>
						<Button onClick={() => refetch()}>
							<RefreshCw className='mr-2 h-4 w-4' />
							{dict?.common?.retry || 'Thử lại'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const certificates = certificatesData?.content || [];

	return (
		<div className='container-lg py-8'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex items-center justify-between mb-6'>
					<h1 className='text-3xl font-bold text-gray-900'>
						{dict?.certificates?.pageTitle || 'Chứng chỉ của tôi'}
					</h1>
					<Button onClick={() => refetch()} variant='superOutline'>
						<RefreshCw className='mr-2 h-4 w-4' />
						{dict?.common?.refresh || 'Làm mới'}
					</Button>
				</div>

				<CertificateDisplay certificates={certificates} dict={dict?.certificates || {}} />

				{/* Pagination */}
				{certificatesData && certificatesData.totalPages > 1 && (
					<div className='flex justify-center mt-8 gap-2'>
						<Button
							variant='superOutline'
							onClick={() => setPage(Math.max(0, page - 1))}
							disabled={page === 0}
						>
							{dict?.common?.previous || 'Trước'}
						</Button>

						<span className='flex items-center px-4'>
							{dict?.common?.page || 'Trang'} {page + 1} {dict?.common?.of || 'của'}{' '}
							{certificatesData.totalPages}
						</span>

						<Button
							variant='superOutline'
							onClick={() => setPage(Math.min(certificatesData.totalPages - 1, page + 1))}
							disabled={page === certificatesData.totalPages - 1}
						>
							{dict?.common?.next || 'Tiếp'}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
