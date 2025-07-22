import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ComboCardSkeleton = () => {
	return (
		<div className='bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100'>
			<Skeleton className='h-52 w-full' />
			<div className='p-6 flex-1 flex flex-col'>
				<Skeleton className='h-7 w-4/5 mb-3' />
				<Skeleton className='h-4 w-full mb-2' />
				<Skeleton className='h-4 w-3/4 mb-4' />

				{/* Included courses skeleton */}
				<div className='mb-4 bg-gray-50 p-3 rounded-lg'>
					<div className='flex items-center mb-2'>
						<Skeleton className='h-4 w-4 mr-2 rounded-full' />
						<Skeleton className='h-4 w-40' />
					</div>
					<div className='pl-6 space-y-2'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-4 w-2/3' />
						<Skeleton className='h-4 w-5/6' />
					</div>
				</div>

				<div className='flex flex-wrap gap-3 mb-5'>
					<Skeleton className='h-8 w-28 rounded-full' />
					<Skeleton className='h-8 w-24 rounded-full' />
					<Skeleton className='h-8 w-20 rounded-full' />
				</div>

				<div className='mt-auto flex justify-between items-center pt-4 border-t border-gray-100'>
					<div className='flex flex-col'>
						<Skeleton className='h-6 w-24 mb-1' />
						<Skeleton className='h-4 w-20' />
					</div>
					<Skeleton className='h-10 w-32 rounded-lg' />
				</div>
			</div>
		</div>
	);
};

export default ComboCardSkeleton;
