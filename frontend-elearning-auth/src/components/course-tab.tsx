'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course } from '@/services/course-service';
import { CheckCircle, BookOpen, Award, BookCheck, Gift } from 'lucide-react';

interface CourseTabsProps {
	course: Course;
	dictionary: any;
	lang: string;
}

const CourseTabs = ({ course, dictionary, lang }: CourseTabsProps) => {
	// Phân tích includesDescription để hiển thị tốt hơn
	const includesItems = course.includesDescription
		? course.includesDescription
				.split(/,|•/)
				.map((item) => item.trim())
				.filter((item) => item.length > 0)
		: [];

	return (
		<Tabs defaultValue='overview' className='bg-white rounded-2xl shadow-xl'>
			<div className='bg-gray-50 rounded-t-2xl border-b'>
				<TabsList className='w-full p-0 h-auto bg-transparent'>
					<div className='flex overflow-x-auto hide-scrollbar'>
						<TabsTrigger
							value='overview'
							className='flex items-center rounded-none rounded-tl-2xl py-4 px-6 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary'
						>
							<BookOpen className='h-5 w-5 mr-2 hidden sm:inline-block' />
							{dictionary.courses.overview}
						</TabsTrigger>

						<TabsTrigger
							value='content'
							className='flex items-center rounded-none py-4 px-6 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary'
						>
							<BookCheck className='h-5 w-5 mr-2 hidden sm:inline-block' />
							{dictionary.courses.content}
						</TabsTrigger>

						<TabsTrigger
							value='includes'
							className='flex items-center rounded-none py-4 px-6 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary'
						>
							<Gift className='h-5 w-5 mr-2 hidden sm:inline-block' />
							{dictionary.courses.includes}
						</TabsTrigger>
					</div>
				</TabsList>
			</div>

			<TabsContent value='overview' className='p-6 md:p-8'>
				<div
					className='prose prose-lg max-w-none prose-headings:text-primary prose-strong:text-gray-900 prose-img:rounded-xl prose-a:text-primary'
					dangerouslySetInnerHTML={{ __html: course.courseOverview }}
				/>
			</TabsContent>

			<TabsContent value='content' className='p-6 md:p-8'>
				<div
					className='prose prose-lg max-w-none prose-headings:text-primary prose-strong:text-gray-900 prose-img:rounded-xl prose-a:text-primary'
					dangerouslySetInnerHTML={{ __html: course.courseContent }}
				/>
			</TabsContent>

			<TabsContent value='includes' className='p-6 md:p-8'>
				<div
					className='prose prose-lg max-w-none prose-headings:text-primary prose-strong:text-gray-900 prose-img:rounded-xl prose-a:text-primary mb-8'
					dangerouslySetInnerHTML={{ __html: course.includesDescription }}
				/>

				<div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{includesItems.map((item, index) => (
						<div
							key={index}
							className='flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors'
						>
							<CheckCircle className='h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0' />
							<span className='text-gray-800'>{item}</span>
						</div>
					))}
				</div>

				<div className='mt-8 bg-primary/10 p-6 rounded-xl border border-primary/20'>
					<h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
						<Award className='h-6 w-6 text-primary mr-2' />
						{dictionary.courses.certificate}
					</h3>
					<p className='text-gray-700'>{dictionary.courses.certificateDescription}</p>
				</div>
			</TabsContent>
		</Tabs>
	);
};

export default CourseTabs;
