import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileQuestion, File, FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

const VideoPopup = ({ isOpen, onClose, videoUrl, title }: any) => {
	if (!videoUrl) return null;

	// Extract video ID if it's a YouTube URL
	const getYouTubeEmbedUrl = (url: any) => {
		if (url.includes('youtube.com/watch?v=')) {
			const videoId = url.split('v=')[1].split('&')[0];
			return `https://www.youtube.com/embed/${videoId}`;
		} else if (url.includes('youtu.be/')) {
			const videoId = url.split('youtu.be/')[1].split('?')[0];
			return `https://www.youtube.com/embed/${videoId}`;
		}
		// If not YouTube or can't parse, return original URL
		return url;
	};

	const embedUrl = getYouTubeEmbedUrl(videoUrl);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-3xl'>
				<DialogHeader>
					<DialogTitle>{title || 'Video bài học'}</DialogTitle>
				</DialogHeader>
				<div className='aspect-video w-full h-full'>
					<iframe
						src={embedUrl}
						className='w-full h-full border-0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
						allowFullScreen
						title='Embedded Video'
					></iframe>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const LessonDetail = ({ lesson, onResourceClick, onExerciseClick }: any) => {
	const [videoPopupOpen, setVideoPopupOpen] = useState(false);

	// Helpers
	const getFileTypeIcon = (fileType: any) => {
		if (!fileType) return <File className='h-5 w-5 text-blue-500' />;

		const type = fileType.toLowerCase();
		if (type.includes('pdf')) {
			return <FileText className='h-5 w-5 text-red-500' />;
		} else if (type.includes('doc') || type.includes('word')) {
			return <FileText className='h-5 w-5 text-blue-500' />;
		} else if (type.includes('xls') || type.includes('sheet')) {
			return <FileText className='h-5 w-5 text-green-500' />;
		} else if (type.includes('ppt') || type.includes('presentation')) {
			return <FileText className='h-5 w-5 text-orange-500' />;
		} else {
			return <File className='h-5 w-5 text-gray-500' />;
		}
	};

	const getExerciseTypeLabel = (type: any) => {
		switch (type) {
			case 'MULTIPLE_CHOICE':
				return 'Trắc nghiệm';
			case 'FILL_IN_THE_BLANK':
				return 'Điền vào chỗ trống';
			case 'MATCHING':
				return 'Ghép cặp';
			case 'LISTENING':
				return 'Bài tập Nghe';
			case 'SPEAKING':
				return 'Bài tập Nói';
			case 'SPEECH_RECOGNITION':
				return 'Nhận dạng Giọng nói';
			case 'PRONUNCIATION':
				return 'Luyện Phát âm';
			default:
				return type;
		}
	};

	const isSpeechExercise = (type: any) => {
		return ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'].includes(type);
	};

	const getExerciseDescription = (exercise: any) => {
		if (isSpeechExercise(exercise.type)) {
			// For speech exercises, show target text or type description
			if (exercise.targetText) {
				return `${exercise.targetText} • ${exercise.difficultyLevel || 'BEGINNER'}`;
			}
			return `Bài tập Speech • ${exercise.difficultyLevel || 'BEGINNER'}`;
		} else {
			// For traditional exercises, show question count
			return `${exercise.questions?.length || 0} câu hỏi`;
		}
	};

	const handleVideoClick = (e: any) => {
		e.preventDefault();
		setVideoPopupOpen(true);
	};

	return (
		<div className='mt-4 ml-5 space-y-4'>
			{/* Video Popup */}
			<VideoPopup
				isOpen={videoPopupOpen}
				onClose={() => setVideoPopupOpen(false)}
				videoUrl={lesson.videoUrl}
				title={`Video: ${lesson.title || 'Bài học'}`}
			/>

			{/* Lesson content */}
			{lesson.content && (
				<div className='bg-gray-100 p-3 rounded-md'>
					<h5 className='text-sm font-medium text-gray-700 mb-2'>Nội dung bài học:</h5>
					<p className='text-sm text-gray-600 whitespace-pre-line'>{lesson.content}</p>
				</div>
			)}

			{/* Lesson Video URL */}
			{lesson.videoUrl && (
				<div className='bg-gray-100 p-3 rounded-md'>
					<h5 className='text-sm font-medium text-gray-700 mb-2'>Video bài học:</h5>
					<a
						href={lesson.videoUrl}
						onClick={handleVideoClick}
						className='text-sm text-blue-600 hover:underline flex items-center'
					>
						<Eye className='h-4 w-4 mr-1' />
						Xem video
					</a>
				</div>
			)}

			{/* Resources */}
			{lesson.resources && lesson.resources.length > 0 && (
				<div>
					<h5 className='text-sm font-medium text-gray-700 mb-2'>Tài liệu:</h5>
					<div className='space-y-2'>
						{lesson.resources.map((resource: any) => (
							<div
								key={resource.id}
								className='bg-blue-50 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors'
								onClick={() => onResourceClick(resource)}
							>
								<div className='flex items-center'>
									{getFileTypeIcon(resource.fileType)}
									<span className='ml-2 text-sm font-medium text-blue-800'>{resource.title}</span>
								</div>
								<Button variant='superOutline' size='sm' className='bg-white text-blue-600'>
									<Eye className='h-3.5 w-3.5 mr-1' />
									Chi tiết
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Exercises */}
			{lesson.exercises && lesson.exercises.length > 0 && (
				<div>
					<h5 className='text-sm font-medium text-gray-700 mb-2'>Bài tập:</h5>
					<div className='space-y-2'>
						{lesson.exercises.map((exercise: any) => (
							<div
								key={exercise.id}
								className='bg-purple-50 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-colors'
								onClick={() => onExerciseClick(exercise)}
							>
								<div className='flex items-center'>
									<FileQuestion className='h-5 w-5 text-purple-600' />
									<div className='ml-2'>
										<span className='text-sm font-medium text-purple-800'>{exercise.title}</span>
										<div className='text-xs text-purple-600'>
											{getExerciseTypeLabel(exercise.type)} • {getExerciseDescription(exercise)}
										</div>
									</div>
								</div>
								<Button variant='superOutline' size='sm' className='bg-white text-purple-600'>
									<Eye className='h-3.5 w-3.5 mr-1' />
									Chi tiết
								</Button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default LessonDetail;
