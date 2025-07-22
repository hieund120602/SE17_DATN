'use client';
import CourseCard from '@/app/pages/home/course-card';
import CourseCardSkeleton from '@/app/pages/home/course-skeleton';
import React from 'react';
import Link from 'next/link';

interface CourseGridProps {
	courses: any[];
	isLoading: boolean;
	isFetching: boolean;
	dictionary: any;
	hasMore: boolean;
	loadingMore: boolean;
	currentLocale: string;
	onLoadMore?: () => void; // Made optional since we won't use it anymore
}

const CourseGrid = ({
	courses,
	isLoading,
	isFetching,
	dictionary,
	hasMore,
	loadingMore,
	currentLocale,
}: CourseGridProps) => {
	return (
		<>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{isLoading
					? // Show skeletons while loading initial data
					  Array(6)
							.fill(0)
							.map((_, index) => <CourseCardSkeleton key={index} />)
					: courses.map((course: any, index: number) => (
							<CourseCard
								key={course.id}
								course={course}
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
							<CourseCardSkeleton key={`loading-more-${index}`} />
						))}
				</div>
			)}

			{!isLoading && courses.length > 0 && (
				<div className='mt-12 flex justify-center'>
					{courses.length >= 6 && (
						<Link href={`/${currentLocale}/courses`}>
							<button className='px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors flex items-center'>
								{dictionary.courses?.viewAllCourses || 'View All Courses'}
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
										d='M14 5l7 7m0 0l-7 7m7-7H3'
									/>
								</svg>
							</button>
						</Link>
					)}
				</div>
			)}

			{/* No courses message */}
			{!isLoading && courses.length === 0 && (
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
					<h3 className='text-xl font-medium text-gray-700'>{dictionary.courses.noCourses}</h3>
					<p className='text-gray-500 mt-2 text-center max-w-md'>{dictionary.courses.noCoursesMessage}</p>
				</div>
			)}
		</>
	);
};

export default CourseGrid;
