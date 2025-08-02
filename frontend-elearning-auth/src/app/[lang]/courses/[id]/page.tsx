'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import CourseService, { Course } from '@/services/course-service';
import { notFound, useParams } from 'next/navigation';
import { formatDuration, formatPrice } from '@/lib/utils';
import { Clock, BookOpen, Award, CheckCircle, Star, Users, ChevronRight } from 'lucide-react';
import EnrollButton from '@/components/enroll-button';
import CourseTabs from '@/components/course-tab';
import CourseContent from '@/components/course-content';
import { useQuery } from '@tanstack/react-query';
import useEnrollments from '@/hooks/use-my-enrollments';

// Type for dictionary
type Dictionary = {
	common: {
		home: string;
	};
	courses: {
		pageTitle: string;
		instructor: string;
		lastUpdated: string;
		rating: string;
		reviews: string;
		bestSeller: string;
		off: string;
		duration: string;
		lessons: string;
		lessonsCount: string;
		level: string;
		access: string;
		fullLifetimeAccess: string;
		moneyBackGuarantee: string;
		courseContent: string;
		students: string;
		overview: string;
		content: string;
		includes: string;
		certificate: string;
		certificateDescription: string;
	};
};

export default function CoursePage() {
	const params = useParams();
	const lang = params.lang as string;
	const courseId = parseInt(params.id as string);

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

	const { data: course, isLoading: isCourseLoading } = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => CourseService.getCoursePublicId(courseId),
		throwOnError: false,
	});

	if (isDictLoading || isCourseLoading) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
			</div>
		);
	}

	// Handle not found
	if (!course) {
		notFound();
		return null;
	}

	// Format the date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(lang === 'jp' ? 'ja-JP' : 'vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(date);
	};

	return (
		<div className='bg-gradient-to-b from-gray-50 to-white'>
			{/* Breadcrumb */}
			<div className='border-b py-3'>
				<div className='container-lg'>
					<div className='flex items-center text-sm text-gray-600'>
						<a href={`/${lang}`} className='hover:text-primary transition-colors'>
							{dict?.common.home}
						</a>
						<ChevronRight className='h-4 w-4 mx-2' />
						<a href={`/${lang}/courses`} className='hover:text-primary transition-colors'>
							{dict?.courses.pageTitle}
						</a>
						<ChevronRight className='h-4 w-4 mx-2' />
						<span className='text-gray-900 font-medium truncate max-w-[200px]'>{course.title}</span>
					</div>
				</div>
			</div>

			{/* Hero section with course overview */}
			<div className='bg-gradient-to-r from-primary via-primary-dark to-primary-dark text-white relative overflow-hidden'>
				{/* Background pattern */}
				<div className='absolute inset-0 opacity-10'>
					<svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
						<defs>
							<pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'>
								<path d='M 10 0 L 0 0 0 10' fill='none' stroke='white' strokeWidth='0.5' />
							</pattern>
						</defs>
						<rect width='100%' height='100%' fill='url(#grid)' />
					</svg>
				</div>

				<div className='sec-com'>
					<div className='container-lg z-10'>
						<div className='grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12'>
							{/* Course info - Takes 3 columns on large screens */}
							<div className='lg:col-span-3 space-y-6'>
								<div className='flex flex-wrap items-center gap-2'>
									<span className='bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm'>
										{course.level.name}
									</span>
									<span className='bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm'>
										{formatDuration(course.durationInMinutes, dict)}
									</span>
									<span className='bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center'>
										<Users className='h-4 w-4 mr-1' />
										{course.countBuy}
									</span>
								</div>

								<h1 className='text-3xl sm:text-4xl md:text-5xl font-bold leading-tight'>
									{course.title}
								</h1>
								<p className='text-white/90 text-lg md:text-xl max-w-3xl'>{course.description}</p>

								<div className='flex flex-wrap gap-6'>
									<div className='flex items-center'>
										<div className='w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-lg'>
											<Image
												src={course.tutor.avatarUrl || '/images/avatar-placeholder.png'}
												alt={course.tutor.fullName}
												width={48}
												height={48}
												className='object-cover w-full h-full'
											/>
										</div>
										<div className='ml-3'>
											<p className='text-sm font-medium text-white/80'>
												{dict?.courses.instructor}
											</p>
											<p className='text-lg font-semibold'>{course.tutor.fullName}</p>
										</div>
									</div>

									<div className='flex items-center'>
										<div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center'>
											<Clock className='h-6 w-6' />
										</div>
										<div className='ml-3'>
											<p className='text-sm font-medium text-white/80'>
												{dict?.courses.lastUpdated}
											</p>
											<p className='text-lg font-semibold'>{formatDate(course.updatedAt)}</p>
										</div>
									</div>

									<div className='flex items-center'>
										<div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center'>
											<Star className='h-6 w-6 fill-yellow-300 text-yellow-300' />
										</div>
										<div className='ml-3'>
											<p className='text-sm font-medium text-white/80'>{dict?.courses.rating}</p>
											<p className='text-lg font-semibold'>4.9 (120 {dict?.courses.reviews})</p>
										</div>
									</div>
								</div>
							</div>

							{/* Course thumbnail and enrollment - Takes 2 columns on large screens */}
							<div className='lg:col-span-2'>
								<div className='bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:translate-y-[-5px] transition-all duration-300'>
									<div className='relative aspect-video group'>
										<Image
											src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
											alt={course.title}
											fill
											className='object-cover'
										/>
										{!course.enrolled && (
											<div className='absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium'>
												{dict?.courses.bestSeller}
											</div>
										)}
									</div>

									<div className='p-4 flex flex-col gap-4'>
										<div className='flex justify-between items-center'>
											<div className='flex flex-col'>
												<span className='text-3xl font-bold text-primary'>
													{formatPrice(
														course.price,
														lang === 'jp' ? 'ja-JP' : 'vi-VN',
														lang === 'jp' ? 'JPY' : 'VND'
													)}
												</span>
												{!course.enrolled && (
													<span className='text-gray-500 line-through text-sm'>
														{formatPrice(
															course.price * 1.2,
															lang === 'jp' ? 'ja-JP' : 'vi-VN',
															lang === 'jp' ? 'JPY' : 'VND'
														)}
													</span>
												)}
											</div>
											{!course.enrolled && (
												<span className='bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium'>
													20% {dict?.courses.off}
												</span>
											)}
										</div>

										<EnrollButton
											courseId={course.id}
											isEnrolled={course.enrolled}
											dictionary={dict}
											price={course.price}
										/>

										<div className='grid grid-cols-2 gap-4'>
											<div className='flex items-start'>
												<div className='mt-1 bg-primary/10 p-2 rounded-full'>
													<Clock className='h-5 w-5 text-primary' />
												</div>
												<div className='ml-3'>
													<h4 className='font-semibold text-gray-900'>
														{dict?.courses.duration}
													</h4>
													<p className='text-gray-600'>
														{formatDuration(course.durationInMinutes, dict)}
													</p>
												</div>
											</div>

											<div className='flex items-start'>
												<div className='mt-1 bg-primary/10 p-2 rounded-full'>
													<BookOpen className='h-5 w-5 text-primary' />
												</div>
												<div className='ml-3'>
													<h4 className='font-semibold text-gray-900'>
														{dict?.courses.lessons}
													</h4>
													<p className='text-gray-600'>
														{course.lessonCount} {dict?.courses.lessonsCount}
													</p>
												</div>
											</div>

											<div className='flex items-start'>
												<div className='mt-1 bg-primary/10 p-2 rounded-full'>
													<Award className='h-5 w-5 text-primary' />
												</div>
												<div className='ml-3'>
													<h4 className='font-semibold text-gray-900'>
														{dict?.courses.level}
													</h4>
													<p className='text-gray-600'>{course.level.name}</p>
												</div>
											</div>

											<div className='flex items-start'>
												<div className='mt-1 bg-primary/10 p-2 rounded-full'>
													<CheckCircle className='h-5 w-5 text-primary' />
												</div>
												<div className='ml-3'>
													<h4 className='font-semibold text-gray-900'>
														{dict?.courses.access}
													</h4>
													<p className='text-gray-600'>{dict?.courses.fullLifetimeAccess}</p>
												</div>
											</div>
										</div>

										<div className='pt-4 border-t border-gray-200'>
											<p className='text-center text-gray-600 flex items-center justify-center'>
												<CheckCircle className='h-5 w-5 text-primary mr-2' />
												{dict?.courses.moneyBackGuarantee}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main content section */}
			<div className='sec-com'>
				<div className='container-lg'>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
						{/* Course content tabs - Takes 2 columns on large screens */}
						<div className='lg:col-span-2'>
							<CourseTabs course={course} dictionary={dict} lang={lang} />
						</div>

						{/* Sidebar with modules - Takes 1 column on large screens */}
						<div className='lg:col-span-1'>
							<div className='bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24'>
								<div className='p-6 bg-gradient-to-r from-primary to-primary-dark text-white'>
									<h3 className='text-xl font-bold'>{dict?.courses.courseContent}</h3>
									<div className='flex items-center mt-2 text-white/80'>
										<BookOpen className='h-5 w-5 mr-2' />
										<span>
											{course.lessonCount} {dict?.courses.lessonsCount}
										</span>
										<span className='mx-2'>•</span>
										<Clock className='h-5 w-5 mr-2' />
										<span>{formatDuration(course.durationInMinutes, dict)}</span>
									</div>
								</div>

								<CourseContent
									modules={course.modules}
									isEnrolled={course.enrolled}
									dictionary={dict}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
