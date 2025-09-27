'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DiscussionDetail from '@/components/discussion/discussion-detail';
import { Skeleton } from '@/components/ui/skeleton';

interface Params {
	id: string;
	lang: string;
}

const DiscussionPage = () => {
	const params = useParams() as unknown as Params;
	const discussionId = parseInt(params.id, 10);
	const lang = params.lang || 'vi';

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

	// Get current user ID from session
	const { data: session, isLoading: isSessionLoading } = useQuery({
		queryKey: ['session'],
		queryFn: async () => {
			const response = await fetch('/api/auth/session');
			if (!response.ok) {
				return null;
			}
			return response.json();
		},
	});

	const currentUserId = session?.user?.id;

	if (isDictLoading || isSessionLoading) {
		return (
			<div className='container-lg py-8'>
				<div className='max-w-3xl mx-auto'>
					<Skeleton className='h-8 w-40 mb-4' />
					<Skeleton className='h-6 w-full mb-2' />
					<Skeleton className='h-6 w-3/4 mb-6' />
					<Skeleton className='h-32 w-full mb-8' />
					<Skeleton className='h-8 w-40 mb-4' />
					<Skeleton className='h-24 w-full mb-4' />
					<div className='space-y-6'>
						{[...Array(3)].map((_, i) => (
							<div key={i} className='border-t pt-4'>
								<div className='flex gap-3'>
									<Skeleton className='h-8 w-8 rounded-full' />
									<div className='flex-1'>
										<Skeleton className='h-4 w-32 mb-2' />
										<Skeleton className='h-16 w-full' />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!dict) {
		return (
			<div className='container-lg py-8'>
				<div className='max-w-3xl mx-auto'>
					<div className='p-4 bg-red-50 text-red-700 rounded-md'>Failed to load dictionary</div>
				</div>
			</div>
		);
	}

	return (
		<div className='sec-com'>
			<div className='container-lg'>
				<div className='max-w-3xl mx-auto'>
					<DiscussionDetail
						discussionId={discussionId}
						lang={lang}
						dict={dict}
						currentUserId={currentUserId}
					/>
				</div>
			</div>
		</div>
	);
};

export default DiscussionPage;
