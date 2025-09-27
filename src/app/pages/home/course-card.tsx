import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { safeString, safeImageUrl, formatDuration } from '@/lib/utils';

interface CourseCardProps {
	course: any;
	index: number;
	dictionary: any;
	currentLocale: string;
}

const CourseCard = ({ course, index, dictionary = {}, currentLocale }: CourseCardProps) => {
	// Ensure dictionary and courses exist to prevent errors
	const dict = dictionary || {};
	const courseDict = dict.courses || {};

	return (
		<div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary/20 transform hover:-translate-y-2 h-full flex flex-col'>
			{/* Course Image - Fixed Height */}
			<Link href={`/${currentLocale}/courses/${course.id}`}>
				<div className='relative h-48 overflow-hidden cursor-pointer flex-shrink-0'>
					<Image
						src={safeImageUrl(course.imageUrl || course.thumbnailUrl, '/images/default-course.jpg')}
						alt={safeString(course.title, 'Course')}
						fill
						className='object-cover group-hover:scale-110 transition-transform duration-500'
					/>

					{/* Overlay */}
					<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

					{/* Level Badge */}
					<div className='absolute top-4 left-4'>
						<span className='px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-lg'>
							{safeString(course.level, 'Beginner')}
						</span>
					</div>

					{/* Price Badge */}
					<div className='absolute top-4 right-4'>
						<div className='bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg'>
							<span className='text-primary font-bold text-sm'>{course.price > 0 ? 'Paid' : 'Free'}</span>
						</div>
					</div>

					{/* Quick Action Button */}
					<div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
						<div className='bg-white text-primary p-2 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors duration-200'>
							<BookOpen className='w-5 h-5' />
						</div>
					</div>
				</div>
			</Link>

			{/* Course Content - Flexible Height */}
			<div className='p-6 flex flex-col flex-grow'>
				{/* Course Title - Fixed Height */}
				<Link href={`/${currentLocale}/courses/${course.id}`}>
					<h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200 cursor-pointer min-h-[3.5rem] flex items-start'>
						{safeString(course.title, 'Course Title')}
					</h3>
				</Link>

				{/* Course Description - Fixed Height */}
				<p className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed min-h-[4.5rem] flex items-start'>
					{safeString(
						course.description,
						'Comprehensive Japanese course designed to help you master the language effectively.'
					)}
				</p>

				{/* Course Stats - Fixed Height */}
				<div className='flex items-center justify-between mb-6 text-sm text-gray-500 h-5'>
					<div className='flex items-center gap-1'>
						<Clock className='w-4 h-4' />
						<span>{formatDuration(course.duration || course.durationInMinutes || 120)}</span>
					</div>

					<div className='flex items-center gap-1'>
						<Users className='w-4 h-4' />
						<span>{course.enrolledCount || 0} students</span>
					</div>

					<div className='flex items-center gap-1'>
						<Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
						<span>{course.rating || '4.8'}</span>
					</div>
				</div>

				{/* Instructor - Fixed Height */}
				<div className='mb-6 h-16 flex items-center'>
					{course.instructor || course.tutor ? (
						<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-full'>
							<div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
								<span className='text-primary font-semibold text-sm'>
									{safeString(course.instructor || course.tutor, 'T')
										.charAt(0)
										.toUpperCase()}
								</span>
							</div>
							<div className='min-w-0 flex-1'>
								<p className='text-sm font-medium text-gray-900 truncate'>
									{safeString(course.instructor || course.tutor, 'Instructor')}
								</p>
								<p className='text-xs text-gray-500'>Instructor</p>
							</div>
						</div>
					) : (
						<div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-full opacity-50'>
							<div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0'>
								<span className='text-gray-400 font-semibold text-sm'>T</span>
							</div>
							<div className='min-w-0 flex-1'>
								<p className='text-sm font-medium text-gray-400 truncate'>TBA</p>
								<p className='text-xs text-gray-400'>Instructor</p>
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons - Fixed at Bottom */}
				<div className='flex gap-3 mt-auto'>
					<Link href={`/${currentLocale}/courses/${course.id}`} className='flex-1'>
						<Button
							className='w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'
							variant='primary'
						>
							<span className='flex items-center justify-center gap-2'>
								{courseDict.enrollNow || 'Enroll Now'}
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 7l5 5m0 0l-5 5m5-5H6'
									/>
								</svg>
							</span>
						</Button>
					</Link>

					{/* <Link href={`/${currentLocale}/courses/${course.id}`}>
						<Button
							className='px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300'
							variant='ghost'
						>
							<span className='flex items-center gap-2'>
								{courseDict.viewDetails || 'Details'}
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 5l7 7-7 7'
									/>
								</svg>
							</span>
						</Button>
					</Link> */}
				</div>
			</div>

			{/* Bottom Accent */}
			<div className='h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
		</div>
	);
};

export default CourseCard;
