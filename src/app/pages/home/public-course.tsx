import Image from 'next/image';
import React from 'react';
import CourseCard from '@/app/pages/home/course-card';
import { API_BASE_URL } from '@/lib/api';
import ClientOnly from '@/components/client-only';
import CourseSkeleton from '@/app/pages/home/course-skeleton';

interface PublicCourseProps {
	dictionary: any;
	currentLocale: string;
}

// Server-side data fetching
async function getPublicCourses() {
	try {
		const response = await fetch(`${API_BASE_URL}/courses?page=0&size=6`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			console.error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
			return [];
		}

		const data = await response.json();
		return data.content || [];
	} catch (error) {
		console.error('Error fetching public courses:', error);
		return [];
	}
}

const PublicCourse = async ({ dictionary, currentLocale }: PublicCourseProps) => {
	const courses = await getPublicCourses();
	// Ensure dictionary and courses exist to prevent errors
	const dict = dictionary || {};
	const courseDict = dict.courses || {};

	return (
		<div className='sec-com'>
			<div className='relative container-lg'>
				{/* Decorative Elements */}
				<div className='absolute -top-10 left-0 w-20 h-20 bg-primary/5 rounded-full blur-xl'></div>
				<div className='absolute -top-5 right-10 w-16 h-16 bg-secondary/5 rounded-full blur-lg'></div>

				<div className='relative'>
					{/* Section Header */}
					<div className='text-center mb-16'>
						<div className='inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6'>
							<span className='text-primary font-medium text-sm'>
								{courseDict.badge || 'Featured Courses'}
							</span>
						</div>

						<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
							{courseDict.onlineCourses || 'Online Courses'}
						</h2>

						<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
							{courseDict.description ||
								'Discover high-quality Japanese courses designed by top instructors to help you achieve fluency faster'}
						</p>

						{/* Decorative Line */}
						<div className='flex justify-center mt-8'>
							<div className='w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full'></div>
						</div>
					</div>

					{/* Courses Grid */}
					<ClientOnly
						fallback={
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
								{[1, 2, 3].map((i) => (
									<CourseSkeleton key={i} />
								))}
							</div>
						}
					>
						{courses.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch'>
								{courses.map((course: any, index: number) => (
									<CourseCard
										key={course.id}
										course={course}
										index={index}
										dictionary={dictionary}
										currentLocale={currentLocale}
									/>
								))}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-20'>
								<div className='w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
									<svg
										className='w-16 h-16 text-gray-400'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={1.5}
											d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
										/>
									</svg>
								</div>
								<h3 className='text-2xl font-semibold text-gray-700 mb-3'>
									{courseDict.noCourses || 'No courses available'}
								</h3>
								<p className='text-gray-500 text-center max-w-md leading-relaxed'>
									{courseDict.noCoursesMessage ||
										'We are working hard to bring you amazing courses. Please check back soon!'}
								</p>
							</div>
						)}
					</ClientOnly>

					{/* View All Button */}
					{courses.length > 0 && (
						<div className='text-center'>
							<a
								href={`/${currentLocale}/courses`}
								className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300'
							>
								<span>{courseDict.viewAll || 'View All Courses'}</span>
								<svg className='w-5 h-5 ml-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 7l5 5m0 0l-5 5m5-5H6'
									/>
								</svg>
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PublicCourse;
