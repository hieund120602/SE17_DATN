import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
	Plus,
	Trash2,
	Video,
	X,
	Loader2,
	Film,
	FileText,
	FileUp,
	HelpCircle,
	FileQuestion,
	Link,
	Upload,
} from 'lucide-react';
import FileUploadService from '@/services/file-upload-service';
import { toast } from 'sonner';
import ResourceItem from '@/app/(tutor)/tutor/components/resource-item';
import ExerciseItem from '@/app/(tutor)/tutor/components/exercise-item';
import { Progress } from '@/components/ui/progress';

const LessonItem = ({ form, moduleIndex, lessonIndex, currentUploadTasks, setCurrentUploadTasks }: any) => {
	// Setup field arrays for resources and exercises
	const resourcesArray: any = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons.${lessonIndex}.resources`,
	});

	const exercisesArray: any = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons.${lessonIndex}.exercises`,
	});

	// Get the lessons array for this module to handle removal
	const { remove: removeLessonAtIndex } = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons`,
	});

	// Add upload progress state
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	// Video input method state
	const [videoInputMethod, setVideoInputMethod] = useState<'upload' | 'url'>('upload');

	// Handle video upload for lessons
	const handleVideoUpload = async (event: any) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file type
		const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Chỉ chấp nhận file video (MP4, WEBM, OGG)', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		// Check file size (100MB max)
		if (file.size > 100 * 1024 * 1024) {
			toast.error('Kích thước video không được vượt quá 100MB', {
				style: { background: '#FF4B4B', color: 'white' },
			});
			return;
		}

		try {
			// Start upload tracking
			const taskId = `video-${moduleIndex}-${lessonIndex}`;
			setCurrentUploadTasks((prev: any) => ({ ...prev, [taskId]: true }));
			setIsUploading(true);
			setUploadProgress(0);

			// Simulate upload progress - in a real implementation,
			// this would be replaced with actual progress from your upload service
			const progressInterval = setInterval(() => {
				setUploadProgress((prevProgress) => {
					// If we're at 90%, wait for the actual upload to complete
					if (prevProgress >= 90) {
						return prevProgress;
					}
					return prevProgress + Math.floor(Math.random() * 5) + 1;
				});
			}, 300);

			// Upload to server
			const response = await FileUploadService.uploadVideo(file);

			// Clear interval and set to 100% when upload is complete
			clearInterval(progressInterval);
			setUploadProgress(100);

			// Short delay to show 100% before resetting
			setTimeout(() => {
				setIsUploading(false);
			}, 500);

			form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`, response.url);
			form.trigger(`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`);

			toast.success('Tải lên video thành công!', {
				style: { background: '#58CC02', color: 'white' },
			});
		} catch (error) {
			// If there's an error, clear the interval and reset progress
			setIsUploading(false);
			console.error('Error uploading video:', error);
			toast.error('Tải lên video thất bại. Vui lòng thử lại.', {
				style: { background: '#FF4B4B', color: 'white' },
			});
		} finally {
			// Remove upload task
			const taskId = `video-${moduleIndex}-${lessonIndex}`;
			setCurrentUploadTasks((prev: any) => {
				const newTasks = { ...prev };
				delete newTasks[taskId];
				return newTasks;
			});
		}
	};

	// Validate video URL
	const isValidVideoUrl = (url: string) => {
		if (!url) return true; // Empty URL is valid (optional field)

		// YouTube URL patterns
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&.*)?$/;
		// Vimeo URL patterns
		const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+(\?.*)?$/;
		// Direct video file URLs
		const directVideoRegex = /^https?:\/\/.*\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i;
		// Generic URL pattern
		const genericUrlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

		return (
			youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url) || genericUrlRegex.test(url)
		);
	};

	// Add a new resource to a lesson
	const addResource = () => {
		resourcesArray.append({
			title: '',
			description: '',
			fileUrl: '',
			fileType: '',
		});
	};

	// Add a new exercise to a lesson
	const addExercise = () => {
		exercisesArray.append({
			title: '',
			description: '',
			type: 'MULTIPLE_CHOICE',
			questions: [], // Start with empty questions array
		});
	};

	// Remove this lesson from the module - FIXED to avoid using hooks inside functions
	const removeLesson = () => {
		// Use the pre-defined remove function
		removeLessonAtIndex(lessonIndex);
	};

	return (
		<div className='border border-gray-200 rounded-lg p-4'>
			<Accordion type='single' collapsible className='w-full'>
				<AccordionItem value='lesson'>
					<AccordionTrigger className='hover:no-underline py-2'>
						<div className='flex items-center space-x-2 text-left'>
							<span className='text-gray-500'>Bài {lessonIndex + 1}:</span>
							<span className='font-medium text-emerald-700'>
								{form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.title`) || 'Bài học mới'}
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className='pt-4 pb-2'>
						<div className='space-y-6 px-1'>
							{/* Lesson Title */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tiêu đề bài học</FormLabel>
										<FormControl>
											<Input placeholder='Nhập tiêu đề bài học' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Lesson Description */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.description`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mô tả bài học</FormLabel>
										<FormControl>
											<Textarea placeholder='Mô tả ngắn gọn về bài học' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Lesson Duration */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationInMinutes`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Thời lượng (phút)</FormLabel>
										<FormControl>
											<Input
												type='number'
												min='1'
												placeholder='Nhập thời lượng bài học (phút)'
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Video Upload/URL */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Video bài học</FormLabel>
										<div className='flex flex-col space-y-4'>
											{/* Video Input Method Selector */}
											<div className='flex gap-2 p-1 bg-gray-100 rounded-lg w-fit'>
												<Button
													type='button'
													variant={videoInputMethod === 'upload' ? 'default' : 'ghost'}
													size='sm'
													onClick={() => setVideoInputMethod('upload')}
													className='px-3 py-1.5 text-xs'
												>
													<Upload className='h-3 w-3 mr-1' />
													Tải lên
												</Button>
												<Button
													type='button'
													variant={videoInputMethod === 'url' ? 'default' : 'ghost'}
													size='sm'
													onClick={() => setVideoInputMethod('url')}
													className='px-3 py-1.5 text-xs'
												>
													<Link className='h-3 w-3 mr-1' />
													URL
												</Button>
											</div>

											<FormControl>
												<Input type='hidden' {...field} />
											</FormControl>

											{/* Current Video Display */}
											{field.value && (
												<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200'>
													<Video className='h-5 w-5 text-emerald-600 flex-shrink-0' />
													<div className='flex-1 min-w-0'>
														<p className='text-sm text-gray-700 truncate'>
															{field.value.includes('youtube.com') ||
															field.value.includes('youtu.be')
																? 'YouTube Video'
																: field.value.includes('vimeo.com')
																? 'Vimeo Video'
																: field.value.split('/').pop() || 'Video'}
														</p>
														<p className='text-xs text-gray-500 truncate'>{field.value}</p>
													</div>
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() => {
															form.setValue(
																`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`,
																''
															);
															form.trigger(
																`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`
															);
														}}
														className='text-gray-500 hover:text-red-500 hover:bg-red-50 p-1 h-8 w-8 flex-shrink-0'
													>
														<X className='h-4 w-4' />
													</Button>
												</div>
											)}

											{/* Upload Method */}
											{videoInputMethod === 'upload' && (
												<div className='space-y-3'>
													<Button
														type='button'
														variant='superOutline'
														onClick={() =>
															document
																.getElementById(
																	`video-upload-${moduleIndex}-${lessonIndex}`
																)
																?.click()
														}
														disabled={
															isUploading ||
															!!currentUploadTasks[`video-${moduleIndex}-${lessonIndex}`]
														}
														className='w-full border-dashed border-2 h-12 bg-gray-50 hover:bg-gray-100'
													>
														{isUploading ? (
															<>
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																Đang tải lên...
															</>
														) : (
															<>
																<Film className='mr-2 h-4 w-4' />
																{field.value ? 'Thay đổi video' : 'Chọn video từ máy'}
															</>
														)}
													</Button>
													<Input
														id={`video-upload-${moduleIndex}-${lessonIndex}`}
														type='file'
														accept='video/*'
														className='hidden'
														onChange={handleVideoUpload}
														disabled={
															isUploading ||
															!!currentUploadTasks[`video-${moduleIndex}-${lessonIndex}`]
														}
													/>
													<p className='text-xs text-gray-500 text-center'>
														Định dạng: MP4, WEBM, OGG. Tối đa 100MB.
													</p>

													{/* Upload Progress Bar */}
													{isUploading && (
														<div className='w-full space-y-2'>
															<div className='flex justify-between text-xs'>
																<span>Đang tải lên...</span>
																<span>{uploadProgress}%</span>
															</div>
															<Progress value={uploadProgress} className='h-2' />
														</div>
													)}
												</div>
											)}

											{/* URL Method */}
											{videoInputMethod === 'url' && (
												<div className='space-y-3'>
													<div className='space-y-2'>
														<Input
															placeholder='Nhập URL video (YouTube, Vimeo, hoặc link trực tiếp)'
															value={field.value || ''}
															onChange={(e) => {
																field.onChange(e.target.value);
																form.trigger(
																	`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`
																);
															}}
															className={`${
																field.value && !isValidVideoUrl(field.value)
																	? 'border-red-300 focus:border-red-500'
																	: ''
															}`}
														/>
														{field.value && !isValidVideoUrl(field.value) && (
															<p className='text-xs text-red-500'>
																URL không hợp lệ. Vui lòng nhập URL video hợp lệ.
															</p>
														)}
													</div>
													<div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
														<p className='text-xs text-blue-700 font-medium mb-1'>
															Các định dạng URL được hỗ trợ:
														</p>
														<ul className='text-xs text-blue-600 space-y-0.5'>
															<li>• YouTube: https://youtube.com/watch?v=...</li>
															<li>• Vimeo: https://vimeo.com/...</li>
															<li>• Link trực tiếp: https://example.com/video.mp4</li>
														</ul>
													</div>
												</div>
											)}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Lesson Content */}
							<FormField
								control={form.control}
								name={`modules.${moduleIndex}.lessons.${lessonIndex}.content`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nội dung bài học</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Nội dung chi tiết của bài học'
												className='min-h-[200px]'
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Cung cấp nội dung chi tiết của bài học, có thể sử dụng Markdown
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Resources */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-medium'>Tài liệu bổ sung</Label>
									<Button type='button' variant='secondary' size='sm' onClick={addResource}>
										<Plus className='h-4 w-4 mr-1' />
										Thêm tài liệu
									</Button>
								</div>

								{resourcesArray.fields.length === 0 ? (
									<div className='text-center py-4 border border-dashed border-gray-200 rounded-md'>
										<FileText className='h-8 w-8 text-gray-300 mx-auto mb-2' />
										<p className='text-sm text-gray-500'>Chưa có tài liệu bổ sung</p>
									</div>
								) : (
									<div className='space-y-4'>
										{resourcesArray.fields.map((resource: any, resourceIndex: any) => (
											<ResourceItem
												key={resource.id}
												form={form}
												moduleIndex={moduleIndex}
												lessonIndex={lessonIndex}
												resourceIndex={resourceIndex}
												resourcesArray={resourcesArray}
												currentUploadTasks={currentUploadTasks}
												setCurrentUploadTasks={setCurrentUploadTasks}
											/>
										))}
									</div>
								)}
							</div>

							{/* Exercises */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-medium'>Bài tập</Label>
									<Button type='button' variant='secondary' size='sm' onClick={addExercise}>
										<Plus className='h-4 w-4 mr-1' />
										Thêm bài tập
									</Button>
								</div>

								{exercisesArray.fields.length === 0 ? (
									<div className='text-center py-4 border border-dashed border-gray-200 rounded-md'>
										<FileQuestion className='h-8 w-8 text-gray-300 mx-auto mb-2' />
										<p className='text-sm text-gray-500'>Chưa có bài tập</p>
									</div>
								) : (
									<div className='space-y-4'>
										{exercisesArray.fields.map((exercise: any, exerciseIndex: any) => (
											<ExerciseItem
												key={exercise.id}
												form={form}
												moduleIndex={moduleIndex}
												lessonIndex={lessonIndex}
												exerciseIndex={exerciseIndex}
												exercisesArray={exercisesArray}
											/>
										))}
									</div>
								)}
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className='flex justify-end mt-2'>
				{form.watch(`modules.${moduleIndex}.lessons`).length > 1 && (
					<Button type='button' variant='danger' size='sm' onClick={removeLesson}>
						<Trash2 className='h-4 w-4 mr-1' />
						Xóa bài học
					</Button>
				)}
			</div>
		</div>
	);
};

export default LessonItem;
