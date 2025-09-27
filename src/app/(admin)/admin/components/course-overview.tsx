import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CourseOverview = ({ course }: any) => {
	return (
		<>
			<div className='grid grid-cols-1 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle className='text-lg text-emerald-800'>Mô tả khóa học</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='whitespace-pre-line text-gray-700'>{course.description || 'Không có mô tả'}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='text-lg text-emerald-800'>Tổng quan khóa học</CardTitle>
					</CardHeader>
					<CardContent>
						<p
							className='whitespace-pre-line text-gray-700'
							dangerouslySetInnerHTML={{
								__html: course.courseOverview || 'Không có tổng quan',
							}}
						></p>
					</CardContent>
				</Card>
			</div>

			<Card className='mt-6'>
				<CardHeader>
					<CardTitle className='text-lg text-emerald-800'>Nội dung bao gồm</CardTitle>
				</CardHeader>
				<CardContent>
					<p
						className='whitespace-pre-line text-gray-700'
						dangerouslySetInnerHTML={{
							__html: course.includesDescription || 'Không có thông tin về nội dung bao gồm',
						}}
					></p>
				</CardContent>
			</Card>

			<Card className='mt-6'>
				<CardHeader>
					<CardTitle className='text-lg text-emerald-800'>Chi tiết nội dung</CardTitle>
				</CardHeader>
				<CardContent>
					<p
						className='whitespace-pre-line text-gray-700'
						dangerouslySetInnerHTML={{
							__html: course.courseContent || 'Không có thông tin chi tiết nội dung',
						}}
					></p>
				</CardContent>
			</Card>
		</>
	);
};

export default CourseOverview;
