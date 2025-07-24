'use client';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import FileUploadService from '@/services/file-upload-service';
import { toast } from 'sonner';
import { CourseFormValues, Level } from '@/schemas/course-schema';

interface BasicInfoTabProps {
	form: UseFormReturn<CourseFormValues>;
	uploadingThumbnail: boolean;
	setUploadingThumbnail: React.Dispatch<React.SetStateAction<boolean>>;
	imagePreview: string;
	setImagePreview: React.Dispatch<React.SetStateAction<string>>;
	navigateToTab: (tab: string) => void;
	router: AppRouterInstance;
	levels: Level[] | undefined;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
	form,
	uploadingThumbnail,
	setUploadingThumbnail,
	imagePreview,
	setImagePreview,
	navigateToTab,
	router,
	levels,
}) => {
	// Sắp xếp levels theo thứ tự N1, N2, N3, N4, N5,...
	const sortedLevels = React.useMemo(() => {
		if (!levels) return [];

		return [...levels].sort((a, b) => {
			// Giả sử name có dạng "N1", "N2", etc.
			// Trích xuất số từ tên level
			const numA = parseInt(a.name.replace(/\D/g, ''));
			const numB = parseInt(b.name.replace(/\D/g, ''));

			return numA - numB;
		});
	}, [levels]);

	// Handle thumbnail upload
	const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		// Check file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Kích thước hình ảnh không được vượt quá 5MB', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		try {
			setUploadingThumbnail(true);

			// Create image preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			// Upload to server
			const response = await FileUploadService.uploadImage(file);
			form.setValue('thumbnailUrl', response.url);
			form.trigger('thumbnailUrl');

			toast.success('Tải lên hình ảnh thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
		} catch (error) {
			console.error('Error uploading thumbnail:', error);
			toast.error('Tải lên hình ảnh thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
		} finally {
			setUploadingThumbnail(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-xl text-emerald-700'>Thông tin cơ bản</CardTitle>
				<CardDescription>Nhập thông tin cơ bản về khóa học của bạn</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Title */}
				<FormField
					control={form.control}
					name='title'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tiêu đề khóa học</FormLabel>
							<FormControl>
								<Input placeholder='Nhập tiêu đề khóa học' {...field} />
							</FormControl>
							<FormDescription>Tiêu đề nên ngắn gọn và mô tả chính xác nội dung khóa học</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Description */}
				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mô tả ngắn</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Mô tả ngắn gọn về khóa học'
									className='min-h-[100px]'
									{...field}
								/>
							</FormControl>
							<FormDescription>Mô tả ngắn gọn giúp học viên hiểu khóa học của bạn là gì</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Level */}
				<FormField
					control={form.control}
					name='levelId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cấp độ</FormLabel>
							<Select
								onValueChange={(value) => field.onChange(parseInt(value))}
								defaultValue={field.value?.toString()}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Chọn cấp độ khóa học' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{sortedLevels.map((level) => (
										<SelectItem key={level.id} value={level.id.toString()}>
											{level.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormDescription>
								Cấp độ khóa học giúp học viên đánh giá mức độ phù hợp với họ
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Thumbnail */}
				<FormField
					control={form.control}
					name='thumbnailUrl'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Hình thu nhỏ khóa học</FormLabel>
							<div className='flex flex-col space-y-4'>
								<div className='flex items-center gap-4'>
									<FormControl>
										<Input type='hidden' {...field} />
									</FormControl>
									<div className='relative'>
										<div className='h-36 w-64 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center'>
											{imagePreview || field.value ? (
												<img
													src={imagePreview || field.value}
													alt='Thumbnail preview'
													className='h-full w-full object-cover'
												/>
											) : (
												<ImageIcon className='h-12 w-12 text-gray-300' />
											)}
										</div>
									</div>
									<div className='flex-1'>
										<Label htmlFor='thumbnailUpload' className='mb-2 block'>
											Tải lên hình ảnh
										</Label>
										<div className='flex items-center gap-3'>
											<Button
												type='button'
												variant='superOutline'
												onClick={() => document.getElementById('thumbnailUpload')?.click()}
												disabled={uploadingThumbnail}
												className='w-fit'
											>
												{uploadingThumbnail ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Đang tải lên...
													</>
												) : (
													<>
														<Upload className='mr-2 h-4 w-4' />
														Chọn hình ảnh
													</>
												)}
											</Button>
											<Input
												id='thumbnailUpload'
												type='file'
												accept='image/*'
												className='hidden'
												onChange={handleThumbnailUpload}
												disabled={uploadingThumbnail}
											/>
										</div>
										<p className='text-xs text-gray-500 mt-2'>
											Định dạng: JPG, PNG, GIF, WEBP. Tối đa 5MB.
										</p>
									</div>
								</div>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
			<CardFooter className='flex justify-between'>
				<Button type='button' variant='superOutline' onClick={() => router.push('/tutor/course')}>
					Hủy
				</Button>
				<Button type='button' onClick={() => navigateToTab('content')} variant='primary'>
					Tiếp theo
				</Button>
			</CardFooter>
		</Card>
	);
};

export default BasicInfoTab;
