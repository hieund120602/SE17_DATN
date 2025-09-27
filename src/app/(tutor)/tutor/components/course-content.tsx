'use client';
import React, { useState, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, SendHorizontal, Maximize2, Minimize2, BotMessageSquare } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { CourseFormValues } from '@/schemas/course-schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';

// Tải React Quill động để tránh lỗi SSR
const ReactQuill = dynamic(() => import('react-quill'), {
	ssr: false,
	loading: () => (
		<div className='h-[200px] w-full border rounded-md flex items-center justify-center'>
			Đang tải trình soạn thảo...
		</div>
	),
});
import 'react-quill/dist/quill.snow.css'; // Import CSS của Quill

// Cấu hình modules của Quill
const quillModules = {
	toolbar: [
		[{ header: [1, 2, 3, false] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		[{ color: [] }, { background: [] }],
		['link'],
		['clean'],
	],
};

const quillFormats = [
	'header',
	'bold',
	'italic',
	'underline',
	'strike',
	'list',
	'bullet',
	'color',
	'background',
	'link',
];

interface CourseContentTabProps {
	form: UseFormReturn<CourseFormValues>;
	navigateToTab: (tab: string) => void;
}

const CourseContentTab: React.FC<CourseContentTabProps> = ({ form, navigateToTab }: any) => {
	const [loading, setLoading] = useState<{ [key: string]: boolean }>({
		courseOverview: false,
		courseContent: false,
		includesDescription: false,
	});
	const [error, setError] = useState<string | null>(null);
	const [aiPromptOpen, setAiPromptOpen] = useState(false);
	const [userPrompt, setUserPrompt] = useState('');
	const [currentField, setCurrentField] = useState<string>('');
	const [quillLoaded, setQuillLoaded] = useState(false);
	const [fullscreenField, setFullscreenField] = useState<string | null>(null);

	// Không cần sử dụng ref trực tiếp cho ReactQuill nữa
	const fullscreenContainerRef = useRef<HTMLDivElement>(null);

	// Đặt trạng thái quillLoaded = true sau khi component đã mount
	useEffect(() => {
		setQuillLoaded(true);
	}, []);

	// Xử lý phím Esc khi đang ở chế độ fullscreen
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && fullscreenField) {
				setFullscreenField(null);
			}
		};
		window.addEventListener('keydown', handleEsc);
		return () => {
			window.removeEventListener('keydown', handleEsc);
		};
	}, [fullscreenField]);

	// Function to generate AI content based on user's direct prompt
	const generateAiContent = async () => {
		if (!userPrompt.trim()) {
			setError('Vui lòng nhập nội dung yêu cầu.');
			return;
		}

		setLoading((prev) => ({ ...prev, [currentField]: true }));
		setError(null);

		try {
			// Call AI API with the user's exact prompt
			const response = await fetch('/api/ai-suggestions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt: userPrompt }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Không thể tạo nội dung. Vui lòng thử lại sau.');
			}

			// Kiểm tra xem kết quả có trống không
			if (!data.suggestion || data.suggestion.trim() === '') {
				throw new Error('API trả về kết quả trống. Vui lòng thử lại với yêu cầu khác.');
			}

			// Chuyển đổi Markdown thành HTML
			const htmlContent = convertMarkdownToHTML(data.suggestion);

			// Update form with AI response (HTML format for Quill)
			form.setValue(currentField, htmlContent, { shouldDirty: true, shouldTouch: true });

			// Close dialog and reset prompt
			setAiPromptOpen(false);
			setUserPrompt('');
		} catch (err) {
			console.error('Error generating AI content:', err);
			setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo nội dung.');
		} finally {
			setLoading((prev) => ({ ...prev, [currentField]: false }));
		}
	};

	// Hàm đơn giản để chuyển đổi Markdown thành HTML
	const convertMarkdownToHTML = (markdown: string): string => {
		// Chuyển đổi tiêu đề
		let html = markdown
			.replace(/# (.*$)/gm, '<h1>$1</h1>')
			.replace(/## (.*$)/gm, '<h2>$1</h2>')
			.replace(/### (.*$)/gm, '<h3>$1</h3>')
			.replace(/#### (.*$)/gm, '<h4>$1</h4>');

		// Chuyển đổi in đậm và in nghiêng
		html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');

		// Chuyển đổi danh sách có thứ tự
		html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
		html = html.replace(/<li>(.*)<\/li>/gm, '<ol><li>$1</li></ol>');

		// Chuyển đổi danh sách không thứ tự
		html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
		html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
		html = html.replace(/<li>(.*)<\/li>/gm, '<ul><li>$1</li></ul>');

		// Chuyển đổi đoạn văn
		html = html.replace(/^(?!<h|<ul|<ol)(.+)/gm, '<p>$1</p>');

		// Chuyển đổi xuống dòng
		html = html.replace(/\n/g, '<br>');

		return html;
	};

	// Function to open AI prompt dialog
	const openAiPrompt = (field: string) => {
		setCurrentField(field);

		// Thiết lập giá trị mặc định cho prompt dựa vào trường
		let defaultPrompt = '';
		switch (field) {
			case 'courseOverview':
				const title = form.getValues('title') || '';
				const category = form.getValues('category') || '';
				defaultPrompt = `Viết tổng quan cho khóa học ${title} ${category ? `về ${category}` : ''}`;
				break;
			case 'courseContent':
				defaultPrompt = `Viết nội dung chi tiết cho khóa học ${form.getValues('title') || ''}`;
				break;
			case 'includesDescription':
				defaultPrompt = `Liệt kê những tài nguyên và tiện ích được bao gồm trong khóa học ${
					form.getValues('title') || ''
				}`;
				break;
		}

		setUserPrompt(defaultPrompt);
		setAiPromptOpen(true);
	};

	// Xử lý khi nhấp vào nút fullscreen
	const toggleFullscreen = (field: string) => {
		if (fullscreenField === field) {
			setFullscreenField(null);
		} else {
			setFullscreenField(field);
		}
	};

	const QuillEditor = ({
		field,
		name,
		label,
		placeholder,
		description,
		minHeight,
	}: {
		field: any;
		name: string;
		label: string;
		placeholder: string;
		description: string;
		minHeight: string;
	}) => {
		// Kiểm tra xem trường này có đang ở chế độ fullscreen không
		const isFullscreen = fullscreenField === name;

		return (
			<FormItem>
				<div className='flex justify-between items-center'>
					<FormLabel>{label}</FormLabel>
					<div className='flex space-x-2'>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type='button'
										variant='superOutline'
										size='sm'
										className='h-8 px-2 flex items-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50'
										onClick={() => toggleFullscreen(name)}
									>
										{isFullscreen ? (
											<Minimize2 className='h-4 w-4' />
										) : (
											<Maximize2 className='h-4 w-4' />
										)}
										<span className='sr-only'>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{isFullscreen ? 'Thu nhỏ' : 'Xem toàn màn hình'}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type='button'
										variant='superOutline'
										size='sm'
										className='h-8 px-3 flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50'
										onClick={() => openAiPrompt(name)}
										disabled={loading[name]}
									>
										{loading[name] ? (
											<div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
										) : (
											<BotMessageSquare className='h-4 w-4' />
										)}
										<span>Nhờ AI viết</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Nhờ AI tạo nội dung dựa trên yêu cầu của bạn</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
				<FormControl>
					{quillLoaded ? (
						<div
							className={
								isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 flex flex-col' : `min-h-[${minHeight}]`
							}
							ref={isFullscreen ? fullscreenContainerRef : null}
						>
							{isFullscreen && (
								<div className='flex justify-between items-center mb-4 p-2 bg-gray-100 rounded'>
									<h3 className='text-lg font-medium'>{label}</h3>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => setFullscreenField(null)}
										className='hover:bg-gray-200'
									>
										<X className='h-5 w-5' />
										<span className='ml-1'>Đóng</span>
									</Button>
								</div>
							)}
							<ReactQuill
								theme='snow'
								value={field.value || ''}
								onChange={field.onChange}
								modules={quillModules}
								formats={quillFormats}
								placeholder={placeholder}
								className={isFullscreen ? 'flex-grow' : 'h-full'}
								style={{
									minHeight: isFullscreen ? 'calc(100vh - 10rem)' : minHeight,
									maxHeight: isFullscreen ? 'calc(100vh - 10rem)' : 'none',
								}}
							/>
						</div>
					) : (
						<div
							className={`min-h-[${minHeight}] w-full border rounded-md flex items-center justify-center`}
						>
							Đang tải trình soạn thảo...
						</div>
					)}
				</FormControl>
				{!isFullscreen && <FormDescription>{description}</FormDescription>}
				{!isFullscreen && <FormMessage />}
			</FormItem>
		);
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className='text-xl text-emerald-700'>Nội dung khóa học</CardTitle>
					<CardDescription>Mô tả chi tiết về nội dung khóa học của bạn</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Course Overview */}
					<FormField
						control={form.control}
						name='courseOverview'
						render={({ field }) => (
							<QuillEditor
								field={field}
								name='courseOverview'
								label='Tổng quan khóa học'
								placeholder='Tổng quan về những gì học viên sẽ học được'
								description='Mô tả tổng quan về những kiến thức và kỹ năng mà học viên sẽ đạt được'
								minHeight='200px'
							/>
						)}
					/>

					{/* Course Content */}
					<FormField
						control={form.control}
						name='courseContent'
						render={({ field }) => (
							<QuillEditor
								field={field}
								name='courseContent'
								label='Nội dung chi tiết'
								placeholder='Mô tả chi tiết nội dung khóa học'
								description='Cung cấp chi tiết về các chủ đề và kỹ năng mà khóa học của bạn bao gồm'
								minHeight='200px'
							/>
						)}
					/>

					{/* Includes Description */}
					<FormField
						control={form.control}
						name='includesDescription'
						render={({ field }) => (
							<QuillEditor
								field={field}
								name='includesDescription'
								label='Khóa học bao gồm'
								placeholder='Liệt kê những gì được bao gồm trong khóa học'
								description='Liệt kê các tài nguyên và tiện ích mà học viên sẽ được tiếp cận (ví dụ: video, tài liệu, bài tập, hỗ trợ...)'
								minHeight='200px'
							/>
						)}
					/>
				</CardContent>
				<CardFooter className='flex justify-between'>
					<Button type='button' variant='superOutline' onClick={() => navigateToTab('basic-info')}>
						Quay lại
					</Button>
					<Button type='button' onClick={() => navigateToTab('modules')} variant='primary'>
						Tiếp theo
					</Button>
				</CardFooter>
			</Card>

			{/* AI Prompt Dialog */}
			<Dialog open={aiPromptOpen} onOpenChange={setAiPromptOpen}>
				<DialogContent className='sm:max-w-[500px]'>
					<DialogHeader>
						<DialogTitle>Nhờ AI viết nội dung</DialogTitle>
					</DialogHeader>
					<div className='py-4'>
						<div className='space-y-4'>
							<FormLabel>Yêu cầu của bạn</FormLabel>
							<Textarea
								value={userPrompt}
								onChange={(e) => setUserPrompt(e.target.value)}
								placeholder='Ví dụ: Viết nội dung chi tiết về khóa học lập trình Python cho người mới bắt đầu, bao gồm 5 phần...'
								className='min-h-[150px]'
							/>
							<FormDescription>
								Hãy mô tả cụ thể nội dung bạn muốn. Càng chi tiết, kết quả càng phù hợp với mong muốn
								của bạn.
							</FormDescription>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='superOutline'
							onClick={() => setAiPromptOpen(false)}
							disabled={loading[currentField]}
						>
							<X className='h-4 w-4 mr-1' /> Hủy
						</Button>
						<Button
							onClick={generateAiContent}
							disabled={loading[currentField]}
							className='bg-blue-600 hover:bg-blue-700 text-white'
						>
							{loading[currentField] ? (
								<div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2' />
							) : (
								<SendHorizontal className='h-4 w-4 mr-2' />
							)}
							Tạo nội dung
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default CourseContentTab;
