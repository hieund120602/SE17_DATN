import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CourseOverview = ({ course }: any) => {
	if (!course) return null;

	return (
		<div className='space-y-6'>
			{/* Course description */}
			<Card>
				<CardContent className='pt-6'>
					<h3 className='text-lg font-semibold text-emerald-800 mb-2'>Mô tả</h3>
					<div className='text-gray-700 whitespace-pre-line'>{course.description}</div>
				</CardContent>
			</Card>

			{/* Course overview */}
			{course.courseOverview && (
				<Card>
					<CardContent className='pt-6'>
						<h3 className='text-lg font-semibold text-emerald-800 mb-2'>Tổng quan khóa học</h3>
						<p
							className='whitespace-pre-line text-gray-700'
							dangerouslySetInnerHTML={{
								__html: course.courseOverview || 'Không có tổng quan',
							}}
						></p>
					</CardContent>
				</Card>
			)}

			{/* Course content */}
			{course.courseContent && (
				<Card>
					<CardContent className='pt-6'>
						<h3 className='text-lg font-semibold text-emerald-800 mb-2'>Nội dung khóa học</h3>
						<p
							className='whitespace-pre-line text-gray-700'
							dangerouslySetInnerHTML={{
								__html: course.includesDescription || 'Không có thông tin về nội dung bao gồm',
							}}
						></p>
					</CardContent>
				</Card>
			)}

			{/* Includes description */}
			{course.includesDescription && (
				<Card>
					<CardContent className='pt-6'>
						<h3 className='text-lg font-semibold text-emerald-800 mb-2'>Khóa học bao gồm</h3>
						<p
							className='whitespace-pre-line text-gray-700'
							dangerouslySetInnerHTML={{
								__html: course.includesDescription || 'Không có thông tin về nội dung bao gồm',
							}}
						></p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default CourseOverview;
