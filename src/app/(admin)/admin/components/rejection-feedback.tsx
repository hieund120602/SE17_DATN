import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RejectionFeedback = ({ feedback }: any) => {
	return (
		<Card className='border-red-200'>
			<CardHeader className='bg-red-50'>
				<CardTitle className='text-lg text-red-800'>Phản hồi từ chối</CardTitle>
			</CardHeader>
			<CardContent>
				{feedback ? (
					<p className='whitespace-pre-line text-gray-700'>{feedback}</p>
				) : (
					<p className='text-gray-500'>Không có phản hồi từ chối nào được ghi lại</p>
				)}
			</CardContent>
		</Card>
	);
};

export default RejectionFeedback;
