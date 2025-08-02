'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
	BookOpen,
	Clock,
	CheckCircle,
	ChevronRight,
	Search,
	Calendar,
	Award,
	ArrowUpRight,
	BookOpenCheck,
	FilterX,
} from 'lucide-react';

import EnrollmentService, { Enrollment } from '@/services/enrollment-service';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyCoursesPage() {
	const router = useRouter();
	const params = useParams();
	const lang = (params.lang as string) || 'vi';

	// Dictionary for multilingual support
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

	// Fetch enrollments
	const {
		data: enrollments,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['my-enrollments'],
		queryFn: EnrollmentService.getMyEnrollments,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// State for search and filter
	const [searchQuery, setSearchQuery] = useState('');
	const [currentTab, setCurrentTab] = useState('all');

	// Format date based on language
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(lang === 'jp' ? 'ja-JP' : 'vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(date);
	};

	// Filter enrollments based on search query and active tab
	const filteredEnrollments = enrollments?.filter((enrollment) => {
		const matchesSearch =
			enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			enrollment.course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			enrollment.course.tutor.fullName.toLowerCase().includes(searchQuery.toLowerCase());

		if (currentTab === 'all') return matchesSearch;
		if (currentTab === 'inProgress') return matchesSearch && !enrollment.completed;
		if (currentTab === 'completed') return matchesSearch && enrollment.completed;

		return matchesSearch;
	});

	// Derived data
	const totalCourses = enrollments?.length || 0;
	const completedCourses = enrollments?.filter((e) => e.completed).length || 0;
	const inProgressCourses = totalCourses - completedCourses;

	// Loading state
	if (isLoading || isDictLoading) {
		return <LoadingState />;
	}

	// Error state
	if (error) {
		return (
			<div className='container-lg py-12'>
				<div className='bg-red-50 rounded-lg p-6 text-center'>
					<h2 className='text-xl font-bold text-red-700 mb-2'>
						{dict?.myCourses?.errorTitle || 'Error Loading Courses'}
					</h2>
					<p className='text-red-600 mb-4'>
						{dict?.myCourses?.errorDescription ||
							'There was an error loading your courses. Please try again.'}
					</p>
					<Button onClick={() => refetch()}>{dict?.myCourses?.retry || 'Retry'}</Button>
				</div>
			</div>
		);
	}

	// Empty state
	if (!enrollments || enrollments.length === 0) {
		return <EmptyState lang={lang} dict={dict} />;
	}

	return (
		<div className='container-lg py-8'>
			{/* Page header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 mb-2'>{dict?.myCourses?.title || 'My Learning'}</h1>
				<p className='text-gray-600'>
					{dict?.myCourses?.subtitle || 'Track your progress and continue learning'}
				</p>
			</div>

			{/* Stats cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
				<StatsCard
					title={dict?.myCourses?.totalCourses || 'Total Courses'}
					value={totalCourses.toString()}
					icon={<BookOpen className='h-5 w-5 text-blue-500' />}
					color='blue'
				/>
				<StatsCard
					title={dict?.myCourses?.inProgress || 'In Progress'}
					value={inProgressCourses.toString()}
					icon={<Clock className='h-5 w-5 text-amber-500' />}
					color='amber'
				/>
				<StatsCard
					title={dict?.myCourses?.completed || 'Completed'}
					value={completedCourses.toString()}
					icon={<CheckCircle className='h-5 w-5 text-green-500' />}
					color='green'
				/>
			</div>

			{/* Search and filters */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
				<div className='relative w-full md:w-72'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
					<Input
						type='text'
						placeholder={dict?.myCourses?.searchPlaceholder || 'Search your courses...'}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-10'
					/>
				</div>

				{searchQuery && (
					<button
						onClick={() => setSearchQuery('')}
						className='flex items-center text-primary hover:text-primary-dark text-sm'
					>
						<FilterX className='h-4 w-4 mr-1' />
						{dict?.myCourses?.clearSearch || 'Clear search'}
					</button>
				)}
			</div>

			{/* Tabs */}
			<Tabs defaultValue='all' className='mb-8' onValueChange={setCurrentTab}>
				<TabsList className='mb-4'>
					<TabsTrigger value='all'>
						{dict?.myCourses?.allCourses || 'All Courses'} ({totalCourses})
					</TabsTrigger>
					<TabsTrigger value='inProgress'>
						{dict?.myCourses?.inProgress || 'In Progress'} ({inProgressCourses})
					</TabsTrigger>
					<TabsTrigger value='completed'>
						{dict?.myCourses?.completed || 'Completed'} ({completedCourses})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='all' className='space-y-6'>
					{filteredEnrollments?.length === 0 ? (
						<NoResultsFound searchQuery={searchQuery} dict={dict} onClear={() => setSearchQuery('')} />
					) : (
						filteredEnrollments?.map((enrollment) => (
							<CourseCard
								key={enrollment.id}
								enrollment={enrollment}
								formatDate={formatDate}
								dict={dict}
								lang={lang}
							/>
						))
					)}
				</TabsContent>

				<TabsContent value='inProgress' className='space-y-6'>
					{filteredEnrollments?.length === 0 ? (
						<NoResultsFound searchQuery={searchQuery} dict={dict} onClear={() => setSearchQuery('')} />
					) : (
						filteredEnrollments?.map((enrollment) => (
							<CourseCard
								key={enrollment.id}
								enrollment={enrollment}
								formatDate={formatDate}
								dict={dict}
								lang={lang}
							/>
						))
					)}
				</TabsContent>

				<TabsContent value='completed' className='space-y-6'>
					{filteredEnrollments?.length === 0 ? (
						<NoResultsFound searchQuery={searchQuery} dict={dict} onClear={() => setSearchQuery('')} />
					) : (
						filteredEnrollments?.map((enrollment) => (
							<CourseCard
								key={enrollment.id}
								enrollment={enrollment}
								formatDate={formatDate}
								dict={dict}
								lang={lang}
							/>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Stats Card Component
const StatsCard = ({
	title,
	value,
	icon,
	color,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	color: 'blue' | 'green' | 'amber';
}) => {
	const bgColor = {
		blue: 'bg-blue-50',
		green: 'bg-green-50',
		amber: 'bg-amber-50',
	}[color];

	return (
		<div className='bg-white rounded-xl border p-6 flex items-center justify-between'>
			<div>
				<h3 className='text-sm font-medium text-gray-500 mb-1'>{title}</h3>
				<p className='text-3xl font-bold text-gray-900'>{value}</p>
			</div>
			<div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
		</div>
	);
};

// Course Card Component
const CourseCard = ({
	enrollment,
	formatDate,
	dict,
	lang,
}: {
	enrollment: Enrollment;
	formatDate: (date: string) => string;
	dict: any;
	lang: string;
}) => {
	const course = enrollment.course;
	return (
		<div className='bg-white rounded-xl border overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow'>
			{/* Course thumbnail */}
			<div className='relative w-full md:w-2/5 h-40 md:h-auto flex-shrink-0'>
				<Image
					src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
					alt={course.title}
					fill
					className='object-cover'
				/>
				{enrollment.completed && (
					<div className='absolute top-4 right-4'>
						<Badge className='bg-green-500 hover:bg-green-600'>
							<CheckCircle className='h-3 w-3 mr-1' />
							{dict?.myCourses?.completedTag || 'Completed'}
						</Badge>
					</div>
				)}
			</div>

			{/* Course details */}
			<div className='flex-1 p-6 flex flex-col'>
				<div className='flex-1'>
					<div className='flex items-center mb-2'>
						<Badge variant='outline' className='bg-primary/10 text-primary border-none mr-2'>
							{course.level.name}
						</Badge>
						<span className='text-xs text-gray-500 flex items-center'>
							<Calendar className='h-3 w-3 mr-1' />
							{dict?.myCourses?.enrolled || 'Enrolled'}: {formatDate(enrollment.enrolledAt)}
						</span>
					</div>

					<h2 className='text-xl font-bold text-gray-900 mb-2'>{course.title}</h2>
					<p className='text-gray-600 mb-4 line-clamp-2'>{course.description}</p>

					<div className='grid grid-cols-2 gap-y-2 mb-4'>
						<div className='flex items-center text-sm text-gray-500'>
							<Clock className='h-4 w-4 mr-2 text-gray-400' />
							<span>{formatDuration(course.durationInMinutes, dict)}</span>
						</div>
						<div className='flex items-center text-sm text-gray-500'>
							<BookOpen className='h-4 w-4 mr-2 text-gray-400' />
							<span>
								{course.lessonCount} {dict?.courses?.lessons || 'lessons'}
							</span>
						</div>
						<div className='flex items-center text-sm text-gray-500'>
							<Award className='h-4 w-4 mr-2 text-gray-400' />
							<span>
								{dict?.myCourses?.tutor || 'Tutor'}: {course.tutor.fullName}
							</span>
						</div>
						{enrollment.certificateUrl && (
							<div className='flex items-center text-sm text-primary'>
								<Award className='h-4 w-4 mr-2' />
								<a href={enrollment.certificateUrl} target='_blank' rel='noopener noreferrer'>
									{dict?.myCourses?.viewCertificate || 'View Certificate'}
								</a>
							</div>
						)}
					</div>
				</div>

				{/* Progress bar */}
				<div className='mt-2'>
					<div className='flex justify-between text-sm mb-1'>
						<span className='text-gray-700 font-medium'>
							{dict?.myCourses?.progress || 'Progress'}: {enrollment.progressPercentage}%
						</span>
						<span className='text-gray-500'>
							{enrollment.completedLessons}/{course.lessonCount}{' '}
							{dict?.myCourses?.lessonsCompleted || 'lessons completed'}
						</span>
					</div>
					<div className='w-full bg-gray-200 rounded-full h-2.5'>
						<div
							className='bg-primary h-2.5 rounded-full'
							style={{ width: `${enrollment.progressPercentage}%` }}
						></div>
					</div>
				</div>

				{/* Actions */}
				<div className='mt-5 flex flex-col sm:flex-row gap-3'>
					<Button asChild className='flex-1'>
						<Link href={`/${lang}/learning/courses/${course.id}`}>
							{enrollment.completed ? (
								<>
									<BookOpenCheck className='h-4 w-4 mr-2' />
									{dict?.myCourses?.reviewCourse || 'Review Course'}
								</>
							) : enrollment.lastAccessedLessonId ? (
								<>
									<ArrowUpRight className='h-4 w-4 mr-2' />
									{dict?.myCourses?.continueLearning || 'Continue Learning'}
								</>
							) : (
								<>
									<BookOpen className='h-4 w-4 mr-2' />
									{dict?.myCourses?.startLearning || 'Start Learning'}
								</>
							)}
						</Link>
					</Button>
					<Button variant='superOutline' asChild>
						<Link href={`/${lang}/courses/${course.id}`}>
							{dict?.myCourses?.courseDetails || 'Course Details'}
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

// Empty State Component
const EmptyState = ({ lang, dict }: { lang: string; dict: any }) => {
	return (
		<div className='container-lg py-16'>
			<div className='max-w-md mx-auto text-center'>
				<div className='bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6'>
					<BookOpen className='h-10 w-10 text-primary' />
				</div>
				<h2 className='text-2xl font-bold text-gray-900 mb-3'>
					{dict?.myCourses?.noCoursesTitle || 'No Courses Yet'}
				</h2>
				<p className='text-gray-600 mb-8'>
					{dict?.myCourses?.noCoursesDescription ||
						"You haven't enrolled in any courses yet. Explore our catalog to start your learning journey."}
				</p>
				<Button asChild>
					<Link href={`/${lang}/courses`}>{dict?.myCourses?.exploreCourses || 'Explore Courses'}</Link>
				</Button>
			</div>
		</div>
	);
};

// No Results Component
const NoResultsFound = ({ searchQuery, dict, onClear }: { searchQuery: string; dict: any; onClear: () => void }) => {
	return (
		<div className='py-12 text-center'>
			<div className='bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
				<Search className='h-8 w-8 text-gray-400' />
			</div>
			<h3 className='text-xl font-medium text-gray-700 mb-2'>
				{dict?.myCourses?.noResults || 'No courses found'}
			</h3>
			<p className='text-gray-500 mb-6'>
				{searchQuery
					? dict?.myCourses?.noSearchResults || `No courses found for "${searchQuery}"`
					: dict?.myCourses?.noFilterResults || 'No courses match the current filter'}
			</p>
			{searchQuery && (
				<Button variant='superOutline' onClick={onClear}>
					{dict?.myCourses?.clearSearch || 'Clear search'}
				</Button>
			)}
		</div>
	);
};

// Loading State Component
const LoadingState = () => {
	return (
		<div className='container-lg py-8'>
			<div className='mb-8'>
				<Skeleton className='h-10 w-72 mb-2' />
				<Skeleton className='h-5 w-96' />
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
				{[...Array(3)].map((_, i) => (
					<Skeleton key={i} className='h-32 rounded-xl' />
				))}
			</div>

			<Skeleton className='h-12 w-72 mb-6' />

			<div className='mb-8'>
				<div className='flex gap-4 mb-6'>
					{[...Array(3)].map((_, i) => (
						<Skeleton key={i} className='h-10 w-32' />
					))}
				</div>

				<div className='space-y-6'>
					{[...Array(3)].map((_, i) => (
						<Skeleton key={i} className='h-64 rounded-xl' />
					))}
				</div>
			</div>
		</div>
	);
};
