'use client';
import ComboCard from '@/app/pages/home/combo-card';
import ComboCardSkeleton from '@/app/pages/home/combo-skeleton';
import React from 'react';

interface ComboGridProps {
	combos: any[];
	isLoading: boolean;
	isFetching: boolean;
	dictionary: any;
	onLoadMore: () => void;
	hasMore: boolean;
	loadingMore: boolean;
	currentLocale: string;
}

const ComboGrid = ({
	combos,
	isLoading,
	isFetching,
	dictionary,
	onLoadMore,
	hasMore,
	loadingMore,
	currentLocale,
}: ComboGridProps) => {
	return (
		<>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{isLoading
					? // Show skeletons while loading initial data
					  Array(6)
							.fill(0)
							.map((_, index) => <ComboCardSkeleton key={index} />)
					: combos.map((combo: any, index: number) => (
							<ComboCard
								key={combo.id}
								combo={combo}
								index={index}
								dictionary={dictionary}
								currentLocale={currentLocale}
							/>
					  ))}
			</div>

			{/* Show loading skeletons at the bottom while fetching more data */}
			{loadingMore && (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8'>
					{Array(3)
						.fill(0)
						.map((_, index) => (
							<ComboCardSkeleton key={`loading-more-${index}`} />
						))}
				</div>
			)}

			{!isLoading && combos.length > 0 && (
				<div className='mt-12 flex justify-center'>
					{hasMore && (
						<button
							onClick={onLoadMore}
							disabled={isFetching}
							className='px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed'
						>
							{isFetching ? dictionary.courses.loading : dictionary.courses.loadMore}
							{!isFetching && (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5 ml-2'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							)}
							{isFetching && (
								<svg
									className='animate-spin ml-2 h-5 w-5 text-white'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
								>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'
									></circle>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
									></path>
								</svg>
							)}
						</button>
					)}
				</div>
			)}

			{/* No combos message */}
			{!isLoading && combos.length === 0 && (
				<div className='flex flex-col items-center justify-center py-16'>
					<div className='text-gray-400 mb-4'>
						<svg className='w-16 h-16' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1.5}
								d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c-2.3-.3-4.3-1.5-4.3-2.8v-1.44c0-.43-.3-.87-.7-1.1l-3.6-2.1c-1.2-.78-1.2-2.7 0-3.46L10.6 3.86c.4-.23.9-.23 1.3 0l3.6 2.1c.4.23.7.67.7 1.1V9'
							/>
						</svg>
					</div>
					<h3 className='text-xl font-medium text-gray-700'>
						{dictionary.combos?.noCombos || 'No combo packages'}
					</h3>
					<p className='text-gray-500 mt-2 text-center max-w-md'>
						{dictionary.combos?.noCombosMessage ||
							'There are currently no combo packages available. Please check back later.'}
					</p>
				</div>
			)}
		</>
	);
};

export default ComboGrid;
