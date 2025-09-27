import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const RejectionFeedback = ({ feedback }: any) => {
	return (
		<Card className='border-red-200'>
			<CardContent className='pt-6'>
				<div className='flex items-start gap-3'>
					<AlertTriangle className='h-6 w-6 text-red-500 flex-shrink-0 mt-1' />
					<div>
						<h3 className='text-lg font-semibold text-red-800 mb-2'>Phản hồi từ quản trị viên</h3>
						{feedback ? (
							<div className='text-gray-700 whitespace-pre-line'>{feedback}</div>
						) : (
							<p className='text-gray-500 italic'>Không có phản hồi cụ thể từ quản trị viên.</p>
						)}
						<div className='mt-4 bg-orange-50 p-4 rounded-md border border-orange-200'>
							<p className='text-orange-800 text-sm'>
								Lưu ý: Vui lòng xem xét phản hồi trên và chỉnh sửa khóa học của bạn trước khi gửi lại để
								phê duyệt.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default RejectionFeedback;
