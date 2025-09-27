'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Upload, Video, Clock, FileText, Award, Eye, Save, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import LessonService, { LessonResponse } from '@/services/lesson-service';
import { toast } from '@/hooks/use-toast';

export default function TutorLessonManagementPage() {
	const params = useParams();
	const router = useRouter();
	const lessonId = parseInt(params.id as string);

	const [lesson, setLesson] = useState<LessonResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [showUploadDialog, setShowUploadDialog] = useState(false);

	useEffect(() => {
		if (lessonId) {
			loadLesson();
		}
	}, [lessonId]);

	const loadLesson = async () => {
		try {
			setLoading(true);
			const data = await LessonService.getLessonById(lessonId);
			setLesson(data);
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể tải thông tin bài học',
				variant: 'destructive',
			});
			router.push('/tutor/course');
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
			if (!allowedTypes.includes(file.type)) {
				toast({
					title: 'Lỗi',
					description: 'Chỉ hỗ trợ file video MP4, AVI, MOV, WMV',
					variant: 'destructive',
				});
				return;
			}

			// Validate file size (max 500MB)
			if (file.size > 500 * 1024 * 1024) {
				toast({
					title: 'Lỗi',
					description: 'Kích thước file không được vượt quá 500MB',
					variant: 'destructive',
				});
				return;
			}

			setSelectedFile(file);
			setShowUploadDialog(true);
		}
	};

	const handleUploadVideo = async () => {
		if (!selectedFile) return;

		try {
			setUploading(true);
			await LessonService.uploadLessonVideo(lessonId, selectedFile);

			toast({
				title: 'Thành công',
				description: 'Đã tải lên video bài học thành công',
			});

			setSelectedFile(null);
			setShowUploadDialog(false);
			loadLesson();
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể tải lên video bài học',
				variant: 'destructive',
			});
		} finally {
			setUploading(false);
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDuration = (minutes: number) => {
		if (minutes < 60) {
			return `${minutes} phút`;
		}
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	if (!lesson) {
		return (
			<div className='text-center py-8'>
				<p>Không tìm thấy bài học</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button variant='ghost' onClick={() => router.push('/tutor/course')} className='p-2'>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>{lesson.title}</h1>
						<p className='text-gray-600'>Quản lý nội dung bài học</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<Badge variant='outline'>{lesson.courseName}</Badge>
					<Button variant='superOutline' size='sm'>
						<Eye className='h-4 w-4 mr-2' />
						Xem trước
					</Button>
				</div>
			</div>

			{/* Lesson Info */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<FileText className='h-5 w-5' />
						Thông Tin Bài Học
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div className='flex items-center gap-2'>
							<Clock className='h-4 w-4 text-gray-500' />
							<span className='text-sm'>Thời lượng: {formatDuration(lesson.duration)}</span>
						</div>
						<div className='flex items-center gap-2'>
							<Award className='h-4 w-4 text-gray-500' />
							<span className='text-sm'>Bài tập: {lesson.exercises.length}</span>
						</div>
						<div className='flex items-center gap-2'>
							<FileText className='h-4 w-4 text-gray-500' />
							<span className='text-sm'>Tài liệu: {lesson.resources.length}</span>
						</div>
					</div>

					<div>
						<h4 className='font-medium mb-2'>Mô tả:</h4>
						<p className='text-gray-600'>{lesson.description}</p>
					</div>
				</CardContent>
			</Card>

			{/* Content Tabs */}
			<Tabs defaultValue='video' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='video'>Video Bài Giảng</TabsTrigger>
					<TabsTrigger value='content'>Nội Dung</TabsTrigger>
					<TabsTrigger value='exercises'>Bài Tập ({lesson.exercises.length})</TabsTrigger>
					<TabsTrigger value='resources'>Tài Liệu ({lesson.resources.length})</TabsTrigger>
				</TabsList>

				{/* Video Tab */}
				<TabsContent value='video'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Video className='h-5 w-5' />
								Video Bài Giảng
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Current Video */}
							{lesson.videoUrl ? (
								<div className='space-y-4'>
									<div className='aspect-video bg-black rounded-lg overflow-hidden'>
										<video controls className='w-full h-full' src={lesson.videoUrl}>
											Trình duyệt không hỗ trợ video.
										</video>
									</div>

									<div className='flex items-center justify-between p-4 bg-green-50 rounded-lg'>
										<div className='flex items-center gap-2'>
											<CheckCircle className='h-5 w-5 text-green-600' />
											<span className='font-medium text-green-900'>Video đã được tải lên</span>
										</div>
										<Button variant='superOutline' size='sm'>
											Thay thế video
										</Button>
									</div>
								</div>
							) : (
								<div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
									<Video className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có video bài giảng</h3>
									<p className='text-gray-500 mb-4'>
										Tải lên video để học viên có thể xem bài giảng của bạn
									</p>
								</div>
							)}

							{/* Upload Section */}
							<div className='border-t pt-6'>
								<h4 className='font-medium mb-4'>Tải Lên Video Mới</h4>
								<div className='space-y-4'>
									<div className='grid w-full max-w-sm items-center gap-1.5'>
										<Label htmlFor='video'>Chọn file video</Label>
										<Input
											id='video'
											type='file'
											accept='.mp4,.avi,.mov,.wmv'
											onChange={handleFileSelect}
											disabled={uploading}
										/>
										<p className='text-xs text-gray-500'>
											Hỗ trợ MP4, AVI, MOV, WMV (tối đa 500MB)
										</p>
									</div>

									<div className='p-4 bg-yellow-50 rounded-lg'>
										<div className='flex items-start gap-2'>
											<AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
											<div className='text-sm text-yellow-800'>
												<p className='font-medium mb-1'>Lưu ý quan trọng:</p>
												<ul className='list-disc list-inside space-y-1'>
													<li>Video sẽ được xử lý và nén để tối ưu hóa tốc độ tải</li>
													<li>
														Quá trình upload có thể mất vài phút tùy thuộc kích thước file
													</li>
													<li>Đảm bảo kết nối internet ổn định trong quá trình upload</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Content Tab */}
				<TabsContent value='content'>
					<Card>
						<CardHeader>
							<CardTitle>Nội Dung Bài Học</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='prose max-w-none'>
								<div dangerouslySetInnerHTML={{ __html: lesson.content }} />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Exercises Tab */}
				<TabsContent value='exercises'>
					<Card>
						<CardHeader>
							<CardTitle>Bài Tập</CardTitle>
						</CardHeader>
						<CardContent>
							{lesson.exercises.length === 0 ? (
								<div className='text-center py-8'>
									<Award className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>Chưa có bài tập nào cho bài học này</p>
								</div>
							) : (
								<div className='space-y-4'>
									{lesson.exercises.map((exercise) => (
										<div key={exercise.id} className='border rounded-lg p-4'>
											<div className='flex items-center justify-between mb-2'>
												<h4 className='font-medium'>{exercise.title}</h4>
												<Badge variant='outline'>{exercise.type}</Badge>
											</div>
											<p className='text-gray-600 mb-3'>{exercise.description}</p>
											<div className='flex items-center gap-4 text-sm text-gray-500'>
												<span>{exercise.questions.length} câu hỏi</span>
												<span>Điểm qua: {exercise.passingScore}%</span>
												{exercise.timeLimit && (
													<span>Thời gian: {exercise.timeLimit} phút</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Resources Tab */}
				<TabsContent value='resources'>
					<Card>
						<CardHeader>
							<CardTitle>Tài Liệu</CardTitle>
						</CardHeader>
						<CardContent>
							{lesson.resources.length === 0 ? (
								<div className='text-center py-8'>
									<FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>Chưa có tài liệu nào cho bài học này</p>
								</div>
							) : (
								<div className='space-y-4'>
									{lesson.resources.map((resource) => (
										<div key={resource.id} className='border rounded-lg p-4'>
											<div className='flex items-center justify-between'>
												<div>
													<h4 className='font-medium'>{resource.name}</h4>
													<p className='text-sm text-gray-500'>{resource.description}</p>
												</div>
												<Badge variant='outline'>{resource.type}</Badge>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Upload Confirmation Dialog */}
			<AlertDialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận tải lên video</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className='space-y-3'>
								<p>Bạn có chắc chắn muốn tải lên video này?</p>
								{selectedFile && (
									<div className='p-3 bg-gray-50 rounded'>
										<p>
											<strong>Tên file:</strong> {selectedFile.name}
										</p>
										<p>
											<strong>Kích thước:</strong> {formatFileSize(selectedFile.size)}
										</p>
										<p>
											<strong>Loại:</strong> {selectedFile.type}
										</p>
									</div>
								)}
								<p className='text-sm text-yellow-600'>
									⚠️ Video cũ (nếu có) sẽ bị thay thế bằng video mới.
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={uploading}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleUploadVideo} disabled={uploading}>
							{uploading ? 'Đang tải lên...' : 'Tải lên'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
