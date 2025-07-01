'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ReviewStepProps {
	onContinue: () => void;
	onBack: () => void;
}

export default function ReviewStep({ onContinue, onBack }: ReviewStepProps) {
	const sections = [
		{
			title: 'Thông tin cá nhân',
			items: [
				{ label: 'Họ tên', value: 'Nguyen Van Toan' },
				{ label: 'Email', value: 'toannguyen@example.com' },
				{ label: 'Số điện thoại', value: '0912345678' },
			],
		},
		{
			title: 'Thông tin giảng dạy',
			items: [
				{ label: 'Trình độ học vấn', value: 'Đại học' },
				{ label: 'Kinh nghiệm', value: '3-5 năm' },
				{ label: 'Môn học', value: 'Toán học, Vật lý, Hóa học' },
				{ label: 'Thời gian có thể dạy', value: 'Buổi tối, Cuối tuần' },
			],
		},
		{
			title: 'Giấy tờ đã tải lên',
			items: [
				{ label: 'CMND/CCCD', value: 'Đã xác minh', verified: true },
				{ label: 'Bằng cấp', value: 'Đã xác minh', verified: true },
			],
		},
		{
			title: 'Thông tin thanh toán',
			items: [
				{ label: 'Phương thức', value: 'Tài khoản ngân hàng' },
				{ label: 'Ngân hàng', value: 'Vietcombank' },
				{ label: 'Số tài khoản', value: '••••••789' },
			],
		},
	];

	return (
		<div className='p-6 space-y-6'>
			<div className='text-center space-y-2'>
				<h2 className='text-2xl font-bold'>Xem lại thông tin</h2>
				<p className='text-gray-500'>Vui lòng kiểm tra lại thông tin trước khi hoàn tất</p>
			</div>

			<div className='space-y-6'>
				{sections.map((section, index) => (
					<div key={index} className='space-y-3'>
						<h3 className='font-medium text-lg'>{section.title}</h3>
						<div className='bg-gray-50 rounded-lg p-4 space-y-2'>
							{section.items.map((item: any, itemIndex) => (
								<div key={itemIndex} className='flex justify-between'>
									<span className='text-gray-600'>{item.label}</span>
									<span className='font-medium flex items-center gap-1'>
										{item.value}
										{item.verified && <Check className='h-4 w-4 text-green-500' />}
									</span>
								</div>
							))}
						</div>
					</div>
				))}

				<div className='pt-4 space-y-4'>
					<p className='text-sm text-gray-500 text-center'>
						Bằng cách nhấn "Hoàn tất", bạn đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của chúng
						tôi.
					</p>

					<div className='flex gap-3'>
						<Button type='button' variant='outline' className='flex-1' onClick={onBack}>
							Quay lại
						</Button>
						<Button className='flex-1 bg-orange-500 hover:bg-orange-600' onClick={onContinue}>
							Hoàn tất
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
