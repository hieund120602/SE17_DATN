'use client';
import React from 'react';
import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, X, Loader2, FileUp, Trash2 } from 'lucide-react';
import FileUploadService from '@/services/file-upload-service';
import { toast } from 'sonner';
import { CourseFormValues } from '@/schemas/course-schema';

interface ResourceItemProps {
	form: UseFormReturn<CourseFormValues>;
	moduleIndex: number;
	lessonIndex: number;
	resourceIndex: number;
	resourcesArray: UseFieldArrayReturn<CourseFormValues, `modules.${number}.lessons.${number}.resources`, 'id'>;
	currentUploadTasks: Record<string, boolean>;
	setCurrentUploadTasks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const ResourceItem: React.FC<ResourceItemProps> = ({
	form,
	moduleIndex,
	lessonIndex,
	resourceIndex,
	resourcesArray,
	currentUploadTasks,
	setCurrentUploadTasks,
}) => {
	// Handle document upload for resources
	const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file size (20MB max)
		if (file.size > 20 * 1024 * 1024) {
			toast.error('Kích thước tài liệu không được vượt quá 20MB', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		try {
			// Track upload task
			const taskId = `doc-${moduleIndex}-${lessonIndex}-${resourceIndex}`;
			setCurrentUploadTasks((prev) => ({ ...prev, [taskId]: true }));

			// Upload to server
			const response = await FileUploadService.uploadDocument(file);

			form.setValue(
				`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileUrl`,
				response.url
			);
			form.setValue(
				`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileType`,
				file.type
			);
			form.trigger(`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileUrl`);

			toast.success('Tải lên tài liệu thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
		} catch (error) {
			console.error('Error uploading document:', error);
			toast.error('Tải lên tài liệu thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
		} finally {
			// Remove upload task
			const taskId = `doc-${moduleIndex}-${lessonIndex}-${resourceIndex}`;
			setCurrentUploadTasks((prev) => {
				const newTasks = { ...prev };
				delete newTasks[taskId];
				return newTasks;
			});
		}
	};

	return (
		<div className='border border-gray-200 rounded-md p-4 bg-gray-50'>
			<div className='flex justify-between items-start mb-4'>
				<Label className='text-sm font-medium'>Tài liệu {resourceIndex + 1}</Label>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => resourcesArray.remove(resourceIndex)}
					className='text-red-500 hover:bg-red-50 hover:text-red-600 p-1 h-8 w-8'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</div>

			<div className='space-y-4'>
				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.title`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tiêu đề tài liệu</FormLabel>
							<FormControl>
								<Input placeholder='Nhập tiêu đề tài liệu' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.description`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mô tả tài liệu</FormLabel>
							<FormControl>
								<Textarea placeholder='Mô tả ngắn gọn về tài liệu' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileUrl`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tệp tài liệu</FormLabel>
							<div className='flex flex-col space-y-3'>
								<FormControl>
									<Input type='hidden' {...field} />
								</FormControl>

								{field.value && (
									<div className='flex items-center gap-2 p-2 bg-white rounded border border-gray-200'>
										<FileText className='h-5 w-5 text-emerald-600' />
										<span className='text-sm text-gray-700 flex-1 truncate'>
											{field.value.split('/').pop()}
										</span>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => {
												form.setValue(
													`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileUrl`,
													''
												);
												form.setValue(
													`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileType`,
													''
												);
												form.trigger(
													`modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.fileUrl`
												);
											}}
											className='text-gray-500 hover:text-red-500 hover:bg-red-50 p-1 h-8 w-8'
										>
											<X className='h-4 w-4' />
										</Button>
									</div>
								)}

								<div>
									<Button
										type='button'
										variant='superOutline'
										onClick={() =>
											document
												.getElementById(
													`resource-upload-${moduleIndex}-${lessonIndex}-${resourceIndex}`
												)
												?.click()
										}
										disabled={
											!!currentUploadTasks[`doc-${moduleIndex}-${lessonIndex}-${resourceIndex}`]
										}
										className='w-fit'
									>
										{!!currentUploadTasks[`doc-${moduleIndex}-${lessonIndex}-${resourceIndex}`] ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Đang tải lên...
											</>
										) : (
											<>
												<FileUp className='mr-2 h-4 w-4' />
												{field.value ? 'Thay đổi tài liệu' : 'Tải lên tài liệu'}
											</>
										)}
									</Button>
									<Input
										id={`resource-upload-${moduleIndex}-${lessonIndex}-${resourceIndex}`}
										type='file'
										className='hidden'
										onChange={handleDocumentUpload}
										disabled={
											!!currentUploadTasks[`doc-${moduleIndex}-${lessonIndex}-${resourceIndex}`]
										}
									/>
									<p className='text-xs text-gray-500 mt-1'>
										Tải lên tài liệu hỗ trợ như PDF, DOCX, PPTX... Tối đa 20MB.
									</p>
								</div>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
};

export default ResourceItem;
