import React from 'react';

const CourseSkeleton = () => {
	return (
		<div className='bg-white rounded-2xl shadow-lg h-[500px] animate-pulse'>
			<div className='h-48 bg-gray-200 rounded-t-2xl'></div>
			<div className='p-6 space-y-4'>
				<div className='h-6 bg-gray-200 rounded'></div>
				<div className='h-4 bg-gray-200 rounded w-3/4'></div>
				<div className='h-4 bg-gray-200 rounded w-1/2'></div>
				<div className='space-y-2 pt-4'>
					<div className='flex gap-2'>
						<div className='w-10 h-4 bg-gray-200 rounded'></div>
						<div className='w-14 h-4 bg-gray-200 rounded'></div>
					</div>
					<div className='flex gap-2'>
						<div className='w-12 h-4 bg-gray-200 rounded'></div>
						<div className='w-16 h-4 bg-gray-200 rounded'></div>
					</div>
				</div>
				<div className='h-8 bg-gray-200 rounded mt-6'></div>
				<div className='flex justify-between mt-4 pt-2'>
					<div className='w-20 h-8 bg-gray-200 rounded'></div>
					<div className='w-16 h-8 bg-gray-200 rounded'></div>
				</div>
			</div>
		</div>
	);
};

export default CourseSkeleton;
