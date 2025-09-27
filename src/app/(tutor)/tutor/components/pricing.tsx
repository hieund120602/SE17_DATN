'use client';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { CourseFormValues } from '@/schemas/course-schema';

interface PricingTabProps {
	form: UseFormReturn<CourseFormValues>;
	navigateToTab: (tab: string) => void;
}

const PricingTab: React.FC<PricingTabProps> = ({ form, navigateToTab }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-xl text-emerald-700'>Định giá khóa học</CardTitle>
				<CardDescription>Thiết lập giá của khóa học</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<FormField
					control={form.control}
					name='price'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Giá (VNĐ)</FormLabel>
							<FormControl>
								<Input
									type='number'
									min='0'
									placeholder='Nhập giá khóa học'
									{...field}
									onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
								/>
							</FormControl>
							<FormDescription>Nhập giá khóa học bằng VNĐ. Nhập 0 nếu khóa học miễn phí.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
					<div className='flex items-start'>
						<AlertCircle className='h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0' />
						<div>
							<h3 className='text-sm font-medium text-amber-800'>Chính sách định giá</h3>
							<p className='text-sm text-amber-700 mt-1'>
								Khi thiết lập giá khóa học, hãy cân nhắc các yếu tố sau:
							</p>
							<ul className='list-disc list-inside text-sm text-amber-700 mt-2 space-y-1'>
								<li>Phí nền tảng: 15% trên mỗi đơn hàng</li>
								<li>Độ dài và chất lượng nội dung khóa học</li>
								<li>Giá trị kiến thức mang lại cho học viên</li>
								<li>Mức giá cạnh tranh so với các khóa học tương tự</li>
							</ul>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className='flex justify-between'>
				<Button type='button' variant='superOutline' onClick={() => navigateToTab('modules')}>
					Quay lại
				</Button>
				<Button type='button' onClick={() => navigateToTab('preview')} variant='primary'>
					Tiếp theo
				</Button>
			</CardFooter>
		</Card>
	);
};

export default PricingTab;
