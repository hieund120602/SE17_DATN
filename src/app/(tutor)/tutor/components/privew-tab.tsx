import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UseMutationResult } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Save, Send, Loader2, Clock, ImageIcon } from 'lucide-react';
import { CourseFormValues, CreateCourseResponse, Level } from '@/schemas/course-schema';

interface PreviewTabProps {
	form: UseFormReturn<CourseFormValues>;
	navigateToTab: (tab: string) => void;
	formatDuration: (minutes: number) => string;
	saveDraft: () => void;
	createCourseMutation: any;
	setIsSubmitConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
	levels: Level[] | undefined;
}

const PreviewTab: React.FC<PreviewTabProps> = ({
	form,
	navigateToTab,
	formatDuration,
	saveDraft,
	createCourseMutation,
	setIsSubmitConfirmOpen,
	levels,
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-xl text-emerald-700'>Xem trước & hoàn tất</CardTitle>
				<CardDescription>Xem lại thông tin và nộp khóa học</CardDescription>
			</CardHeader>
			<CardContent className='space-y-8'>
				<div className='space-y-6'>
					{/* Basic Information Preview */}
					<div>
						<h3 className='text-base font-medium text-gray-700 mb-2'>Thông tin cơ bản</h3>
						<div className='bg-gray-50 rounded-lg p-4'>
							<div className='flex flex-col md:flex-row gap-4'>
								<div className='w-full md:w-1/4'>
									<div className='h-36 w-full rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center'>
										{form.watch('thumbnailUrl') ? (
											<img
												src={form.watch('thumbnailUrl')}
												alt='Thumbnail preview'
												className='h-full w-full object-cover'
											/>
										) : (
											<ImageIcon className='h-12 w-12 text-gray-300' />
										)}
									</div>
								</div>
								<div className='w-full md:w-3/4 space-y-3'>
									<div>
										<Label className='text-xs text-gray-500'>Tiêu đề</Label>
										<p className='text-base font-medium'>
											{form.watch('title') || 'Chưa có tiêu đề'}
										</p>
									</div>
									<div>
										<Label className='text-xs text-gray-500'>Mô tả</Label>
										<p className='text-sm'>{form.watch('description') || 'Chưa có mô tả'}</p>
									</div>
									<div>
										<Label className='text-xs text-gray-500'>Cấp độ</Label>
										<p className='text-sm'>
											{levels?.find((level) => level.id === form.watch('levelId'))?.name ||
												'Chưa chọn cấp độ'}
										</p>
									</div>
									<div>
										<Label className='text-xs text-gray-500'>Giá</Label>
										<p className='text-sm font-medium'>
											{form.watch('price') > 0
												? new Intl.NumberFormat('vi-VN', {
														style: 'currency',
														currency: 'VND',
												  }).format(form.watch('price'))
												: 'Miễn phí'}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Modules Preview */}
					<div>
						<h3 className='text-base font-medium text-gray-700 mb-2'>Nội dung khóa học</h3>
						<div className='bg-gray-50 rounded-lg p-4'>
							<div className='space-y-4'>
								{form.watch('modules').map((module, index) => (
									<div key={index} className='border border-gray-200 rounded-md p-3 bg-white'>
										<h4 className='font-medium'>{module.title}</h4>
										<div className='mt-2 text-sm text-gray-600'>
											<div className='flex items-center'>
												<Clock className='h-4 w-4 mr-1.5 text-emerald-600' />
												{formatDuration(
													module.lessons.reduce(
														(sum, lesson) => sum + (lesson.durationInMinutes || 0),
														0
													)
												)}
											</div>
											<p className='mt-1'>{module.lessons.length} bài học</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Submit section */}
					<div className='bg-emerald-50 border border-emerald-200 rounded-lg p-4'>
						<div className='flex items-start'>
							<Check className='h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0' />
							<div>
								<h3 className='text-sm font-medium text-emerald-800'>Sẵn sàng đăng tải?</h3>
								<p className='text-sm text-emerald-700 mt-1'>
									Khóa học của bạn sẽ được lưu dưới dạng bản nháp. Bạn có thể:
								</p>
								<ul className='list-disc list-inside text-sm text-emerald-700 mt-2 space-y-1'>
									<li>Lưu lại và tiếp tục chỉnh sửa sau</li>
									<li>Gửi khóa học để được phê duyệt và đăng tải</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className='flex justify-between'>
				<Button type='button' variant='superOutline' onClick={() => navigateToTab('pricing')}>
					Quay lại
				</Button>
				<div className='flex gap-2'>
					<Button
						type='submit'
						variant='secondary'
						onClick={saveDraft}
						disabled={createCourseMutation.isPending}
					>
						{createCourseMutation.isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang lưu...
							</>
						) : (
							<>
								<Save className='mr-2 h-4 w-4' />
								Lưu bản nháp
							</>
						)}
					</Button>
					<Button
						type='button'
						onClick={() => setIsSubmitConfirmOpen(true)}
						disabled={createCourseMutation.isPending}
						variant='primary'
					>
						<Send className='mr-2 h-4 w-4' />
						Gửi phê duyệt
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
};

export default PreviewTab;
