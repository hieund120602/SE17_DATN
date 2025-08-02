'use client';
import CourseService from '@/services/course-service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
	Play,
	Check,
	ChevronDown,
	ChevronUp,
	ChevronRight,
	ArrowLeft,
	Book,
	FileText,
	PenTool,
	Download,
} from 'lucide-react';
import SpeechExerciseComponent from '@/components/speech-exercise';
import FillInTheBlankExercise from '@/components/fill-in-the-blank-exercise';
import ResultModal from '@/components/result-modal';
import DiscussionService from '@/services/discussion-service';
import DiscussionList from '@/components/discussion/discussion-list';

// Import types from CourseService
import type {
	Lesson as ApiLesson,
	Module as ApiModule,
	TutorInfo,
	LearningCourse,
	StudentProgress as ApiStudentProgress,
	Level,
	Resource,
	Exercise,
	Question,
	QuestionOption,
} from '@/services/course-service';

// Extended types for the learning interface
interface LearningLesson extends Omit<ApiLesson, 'content' | 'createdAt' | 'updatedAt'> {
	completedAt: string | null;
	completed: boolean;
	resources: Resource[];
	exercises: Exercise[];
}

interface LearningModule extends Omit<ApiModule, 'lessons' | 'createdAt' | 'updatedAt'> {
	lessons: LearningLesson[];
}

interface FormattedCourseData {
	id: number;
	title: string;
	description: string;
	durationInMinutes: number;
	level: string;
	courseOverview: string;
	courseContent: string;
	thumbnailUrl: string;
	tutor: TutorInfo;
	enrollmentId: number;
	progressPercentage: number;
	completedLessons: number;
	lastAccessedLessonId: number | null;
	enrolledAt: string;
	completedAt: string | null;
	modules: LearningModule[];
	completed: boolean;
}

interface Params {
	id: string;
	lang: string;
}

const LearningPage: React.FC = () => {
	const params = useParams() as unknown as Params;
	const courseId = parseInt(params.id, 10);
	const lang = params.lang || 'vi';
	const router = useRouter();
	const queryClient = useQueryClient();

	// Audio refs for sound effects
	const correctAudioRef = useRef<HTMLAudioElement | null>(null);
	const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);

	// Initialize audio objects
	useEffect(() => {
		correctAudioRef.current = new Audio('/images/correct.mp3');
		incorrectAudioRef.current = new Audio('/images/incorrect.mp3');

		// Set volume (optional)
		if (correctAudioRef.current) correctAudioRef.current.volume = 0.7;
		if (incorrectAudioRef.current) incorrectAudioRef.current.volume = 0.7;

		// Cleanup function
		return () => {
			if (correctAudioRef.current) {
				correctAudioRef.current.pause();
				correctAudioRef.current = null;
			}
			if (incorrectAudioRef.current) {
				incorrectAudioRef.current.pause();
				incorrectAudioRef.current = null;
			}
		};
	}, []);

	// Fetch dictionary
	const { data: dict, isLoading: isDictLoading } = useQuery({
		queryKey: ['dictionary', lang],
		queryFn: async () => {
			const response = await fetch(`/api/dictionary?lang=${lang}`);
			if (!response.ok) {
				throw new Error('Failed to fetch dictionary');
			}
			return response.json();
		},
	});

	const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
	const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
	const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
	const [activeTab, setActiveTab] = useState<'video' | 'resources' | 'exercises' | 'discussions'>('video');
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
	const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

	// Fetch course data
	const {
		data: course,
		isLoading: isCourseLoading,
		isError,
	} = useQuery<any>({
		queryKey: ['learningData', courseId],
		queryFn: () => CourseService.getCourseForLearning(courseId),
		enabled: !!courseId,
	});

	// Mark lesson as completed mutation
	const markAsCompletedMutation = useMutation({
		mutationFn: ({ lessonId, courseId }: { lessonId: number; courseId: number }) =>
			CourseService.markLessonAsCompleted(lessonId, courseId),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['learningData', courseId] });
		},
	});

	// State for result modal
	const [resultModalOpen, setResultModalOpen] = useState(false);
	const [exerciseResult, setExerciseResult] = useState<any>(null);

	// Set initial lesson and module on data load
	useEffect(() => {
		if (course) {
			// Initialize expanded modules
			const initialExpandedState: Record<number, boolean> = {};
			course.modules.forEach((module: any) => {
				initialExpandedState[module.id] = true;
			});
			setExpandedModules(initialExpandedState);

			// Set initial active module
			if (course.modules.length > 0 && !activeModuleId) {
				setActiveModuleId(course.modules[0].id);
			}

			// Set initial lesson (last accessed or first lesson)
			if (!currentLessonId) {
				if (course.lastAccessedLessonId) {
					setCurrentLessonId(course.lastAccessedLessonId);

					// Find and set the module containing this lesson
					course.modules.forEach((module: any) => {
						const lessonExists = module.lessons.some(
							(lesson: any) => lesson.id === course.lastAccessedLessonId
						);
						if (lessonExists) {
							setActiveModuleId(module.id);
						}
					});
				} else if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
					setCurrentLessonId(course.modules[0].lessons[0].id);
				}
			}
		}
	}, [course, activeModuleId, currentLessonId]);

	// Add a timer to mark lessons as completed after some time has passed
	useEffect(() => {
		if (currentLessonId && activeTab === 'video' && !markAsCompletedMutation.isPending) {
			// Get the current lesson to check if it's already completed
			const currentLesson = getCurrentLesson();

			// Set a timer to mark the lesson as completed after 10 seconds of viewing
			// This simulates the student having spent enough time on the lesson
			if (currentLesson && !currentLesson.completed) {
				const timer = setTimeout(() => {
					markAsCompletedMutation.mutate({ lessonId: currentLessonId, courseId });
				}, 10000); // 10 seconds

				return () => clearTimeout(timer);
			}
		}
	}, [currentLessonId, activeTab]);

	// Handle module toggle
	const toggleModule = (moduleId: number) => {
		setExpandedModules((prev) => ({
			...prev,
			[moduleId]: !prev[moduleId],
		}));
	};

	// Handle lesson selection and auto-mark as completed
	const selectLesson = (lessonId: number, moduleId: number) => {
		setCurrentLessonId(lessonId);
		setActiveModuleId(moduleId);

		// Get the selected lesson to check if it's already completed
		const selectedModule = course.modules.find((m: any) => m.id === moduleId);
		const selectedLesson = selectedModule?.lessons.find((l: any) => l.id === lessonId);

		// If lesson exists and is not already completed, mark it as completed
		if (selectedLesson && !selectedLesson.completed) {
			markAsCompletedMutation.mutate({ lessonId, courseId });
		}
	};

	// Lesson can be automatically marked as completed when viewed
	// This function is kept for reference but will no longer be used with buttons
	const markLessonCompleted = (lessonId: number, courseId: number) => {
		if (lessonId && courseId) {
			markAsCompletedMutation.mutate({ lessonId, courseId });
		}
	};

	// Get current lesson details
	const getCurrentLesson = () => {
		if (!course || !currentLessonId) return null;

		for (const module of course.modules) {
			const lesson = module.lessons.find((l: any) => l.id === currentLessonId);
			if (lesson) return lesson;
		}
		return null;
	};

	// Get next lesson (for navigation)
	const getNextLesson = (): { lessonId: number; moduleId: number } | null => {
		if (!course || !currentLessonId) return null;

		let foundCurrent = false;

		for (const module of course.modules) {
			for (let i = 0; i < module.lessons.length; i++) {
				const lesson = module.lessons[i];

				if (foundCurrent) {
					return { lessonId: lesson.id, moduleId: module.id };
				}

				if (lesson.id === currentLessonId) {
					foundCurrent = true;

					// If this is the last lesson in the module, check the next module
					if (i === module.lessons.length - 1) {
						const nextModuleIndex = course.modules.findIndex((m: any) => m.id === module.id) + 1;
						if (
							nextModuleIndex < course.modules.length &&
							course.modules[nextModuleIndex].lessons.length > 0
						) {
							return {
								lessonId: course.modules[nextModuleIndex].lessons[0].id,
								moduleId: course.modules[nextModuleIndex].id,
							};
						}
					}
				}
			}
		}

		return null;
	};

	// Calculate progress
	const calculateProgress = (): number => {
		if (!course) return 0;
		if (course.progressPercentage) return course.progressPercentage;

		return 0;
	};

	// Play audio feedback
	const playAudioFeedback = (isCorrect: boolean, accuracyScore?: number) => {
		try {
			// Nếu điểm chính xác là 100%, luôn phát âm thanh correct.mp3
			const shouldPlayCorrectSound = isCorrect || (accuracyScore && accuracyScore >= 100);

			if (shouldPlayCorrectSound && correctAudioRef.current) {
				correctAudioRef.current.currentTime = 0; // Reset to start
				correctAudioRef.current.play().catch((error) => {
					console.log('Could not play correct audio:', error);
				});
			} else if (!shouldPlayCorrectSound && incorrectAudioRef.current) {
				incorrectAudioRef.current.currentTime = 0; // Reset to start
				incorrectAudioRef.current.play().catch((error) => {
					console.log('Could not play incorrect audio:', error);
				});
			}
		} catch (error) {
			console.log('Audio playback error:', error);
		}
	};

	// Handle option selection in exercises
	const handleOptionSelect = (questionId: number, optionId: number) => {
		// Check if this question has already been answered
		if (questionId in selectedOptions) {
			return; // Don't allow changing answer
		}

		// Set the selected option
		setSelectedOptions((prev) => ({
			...prev,
			[questionId]: optionId,
		}));

		// Check if the answer is correct and play appropriate sound
		const isCorrect = isOptionCorrect(questionId, optionId);

		// Small delay to ensure state is updated before playing sound
		setTimeout(() => {
			playAudioFeedback(isCorrect, isCorrect ? 100 : 0);
		}, 100);
	};

	// Check if option is correct
	const isOptionCorrect = (questionId: number, optionId: number): boolean => {
		const currentLesson = getCurrentLesson();
		if (!currentLesson || !currentLesson.exercises || currentLesson.exercises.length === 0) return false;

		const currentExercise = currentLesson.exercises[currentExerciseIndex];
		if (!currentExercise || !currentExercise.questions) return false;

		const question = currentExercise.questions.find((q: any) => q.id === questionId);
		if (!question || !question.options) return false;

		const option = question.options.find((o: any) => o.id === optionId);
		return option?.correct || false;
	};

	// Get file type icon
	const getFileTypeIcon = (fileType: string) => {
		if (fileType.includes('pdf')) return '📄';
		if (fileType.includes('doc')) return '📝';
		if (fileType.includes('image')) return '🖼️';
		if (fileType.includes('audio')) return '🔊';
		if (fileType.includes('video')) return '🎬';
		return '📁';
	};

	// Check if exercise is a speech exercise
	const isSpeechExercise = (exerciseType: string) => {
		return ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'].includes(exerciseType);
	};

	// Check if URL is a YouTube video
	const isYouTubeUrl = (url: string): boolean => {
		if (!url) return false;
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
		return youtubeRegex.test(url);
	};

	// Extract YouTube video ID from URL
	const getYouTubeVideoId = (url: string): string | null => {
		if (!url) return null;

		// Match YouTube URL patterns
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);

		return match && match[2].length === 11 ? match[2] : null;
	};

	// Handle speech exercise completion
	const handleSpeechExerciseComplete = (result: any) => {
		console.log('✅ Speech exercise completed and saved to database:', result);

		// Đảm bảo kết quả có điểm chính xác 100% luôn được đánh giá là đạt
		const isPassed = result.accuracyScore >= 100 ? true : result.isPassed;

		// Play audio feedback with accuracy score
		playAudioFeedback(isPassed, result.accuracyScore);

		// Set result data and open modal
		setExerciseResult({
			id: result.id,
			exerciseId: currentExercise?.id,
			targetText: result.targetText,
			recognizedText: result.recognizedText,
			accuracyScore: result.accuracyScore,
			confidenceScore: result.confidenceScore,
			isPassed: isPassed, // Sử dụng giá trị đã được kiểm tra
			attemptNumber: result.attemptNumber || 1,
			timeSpentSeconds: result.timeSpentSeconds,
			pronunciationFeedback: result.pronunciationFeedback || '',
		});
		setResultModalOpen(true);

		// If passed, user can navigate to next exercise after closing modal
	};

	// Handle next exercise navigation
	const handleNextExercise = () => {
		if (currentExerciseIndex < currentLesson.exercises.length - 1) {
			setCurrentExerciseIndex(currentExerciseIndex + 1);
			setCurrentQuestionIndex(0);
		} else {
			// All exercises completed, maybe show completion message
			console.log('All exercises completed!');
		}
	};

	const currentLesson = getCurrentLesson();
	// Define next lesson and progress outside render for better performance
	const nextLesson = useMemo(() => getNextLesson, [getNextLesson]);
	const progress = useMemo(() => calculateProgress, [calculateProgress]);

	// Get current exercise and question
	const currentExercise = useMemo(() => {
		if (!currentLesson || !currentLesson.exercises || currentLesson.exercises.length === 0) return null;
		return currentLesson.exercises[currentExerciseIndex];
	}, [currentLesson, currentExerciseIndex]);

	const currentQuestion = useMemo(() => {
		if (!currentExercise || !currentExercise.questions || currentExercise.questions.length === 0) return null;
		return currentExercise.questions[currentQuestionIndex];
	}, [currentExercise, currentQuestionIndex]);

	// Loading state
	if (isDictLoading || isCourseLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	// Error state
	if (isError || !course || !dict) {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen p-4'>
				<h1 className='text-xl font-semibold text-red-500 mb-2'>{dict?.learning?.error || 'Đã xảy ra lỗi'}</h1>
				<p className='text-gray-600 mb-4'>
					{dict?.learning?.errorMessage || 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.'}
				</p>
				<button
					onClick={() => router.push(`/${lang}/courses`)}
					className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition'
				>
					{dict?.learning?.returnToCourseList || 'Quay lại danh sách khóa học'}
				</button>
			</div>
		);
	}

	return (
		<div className='sec-com'>
			<div className='flex flex-col lg:flex-row gap-4 relative container-lg'>
				{/* Main content */}
				<div className='lg:w-2/3 relative'>
					{currentLesson ? (
						<div className='bg-white rounded-lg shadow-md p-4 lg:p-6'>
							<h2 className='text-xl font-bold text-gray-800 mb-4'>{currentLesson.title}</h2>

							{/* Tabs */}
							<div className='flex border-b mb-6'>
								<button
									onClick={() => setActiveTab('video')}
									className={`px-4 py-2 font-medium ${
										activeTab === 'video'
											? 'text-primary border-b-2 border-primary'
											: 'text-gray-500 hover:text-gray-700'
									}`}
								>
									{dict.learning.lesson}
								</button>
								{currentLesson.resources && currentLesson.resources.length > 0 && (
									<button
										onClick={() => setActiveTab('resources')}
										className={`px-4 py-2 font-medium ${
											activeTab === 'resources'
												? 'text-primary border-b-2 border-primary'
												: 'text-gray-500 hover:text-gray-700'
										}`}
									>
										{dict.learning.resources} ({currentLesson.resources.length})
									</button>
								)}
								{currentLesson.exercises && currentLesson.exercises.length > 0 && (
									<button
										onClick={() => setActiveTab('exercises')}
										className={`px-4 py-2 font-medium ${
											activeTab === 'exercises'
												? 'text-primary border-b-2 border-primary'
												: 'text-gray-500 hover:text-gray-700'
										}`}
									>
										{dict.learning.exercises} ({currentLesson.exercises.length})
									</button>
								)}
								<button
									onClick={() => setActiveTab('discussions')}
									className={`px-4 py-2 font-medium ${
										activeTab === 'discussions'
											? 'text-primary border-b-2 border-primary'
											: 'text-gray-500 hover:text-gray-700'
									}`}
								>
									{dict.learning.discussions}
								</button>
							</div>

							{/* Tab Content */}
							{activeTab === 'video' && (
								<>
									{/* Video Player */}
									<div className='relative pt-[56.25%] bg-black rounded-lg overflow-hidden mb-6'>
										{currentLesson.videoUrl ? (
											isYouTubeUrl(currentLesson.videoUrl) ? (
												// YouTube Embed
												<iframe
													className='absolute top-0 left-0 w-full h-full'
													src={`https://www.youtube.com/embed/${getYouTubeVideoId(
														currentLesson.videoUrl
													)}`}
													title='YouTube video player'
													frameBorder='0'
													allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
													allowFullScreen
												></iframe>
											) : (
												// Direct video file
												<video
													className='absolute top-0 left-0 w-full h-full'
													src={currentLesson.videoUrl}
													controls
													poster={course.thumbnailUrl}
												/>
											)
										) : (
											<div className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800'>
												<p className='text-white'>{dict.learning.videoNotAvailable}</p>
											</div>
										)}
									</div>

									{/* Lesson description */}
									<div className='mb-6'>
										<h3 className='text-lg font-semibold text-gray-800 mb-2'>
											{dict.learning.lessonDescription}
										</h3>
										<p className='text-gray-600'>{currentLesson.description}</p>
									</div>
								</>
							)}

							{activeTab === 'resources' && currentLesson.resources && (
								<div className='mb-6'>
									<h3 className='text-lg font-semibold text-gray-800 mb-4'>
										{dict.learning.studyMaterials}
									</h3>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{currentLesson.resources.map((resource: Resource) => (
											<div key={resource.id} className='border rounded-lg p-4 flex flex-col'>
												<div className='flex items-start'>
													<div className='text-2xl mr-3'>
														{getFileTypeIcon(resource.fileType)}
													</div>
													<div className='flex-1'>
														<h4 className='font-medium text-gray-800'>{resource.title}</h4>
														<p className='text-sm text-gray-600 mb-2'>
															{resource.description}
														</p>
													</div>
												</div>
												<div className='mt-auto'>
													<a
														href={resource.fileUrl}
														target='_blank'
														rel='noopener noreferrer'
														className='flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800'
													>
														<Download size={16} className='mr-1' />
														{dict.learning.download}
													</a>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{activeTab === 'exercises' && currentExercise && (
								<div className='mb-6'>
									<div className='flex justify-between items-center mb-4'>
										<h3 className='text-lg font-semibold text-gray-800'>{currentExercise.title}</h3>
										<span className='text-sm text-gray-500'>
											{dict.learning.exercise} {currentExerciseIndex + 1}/
											{currentLesson.exercises.length}
											{!isSpeechExercise(currentExercise.type) &&
												currentExercise.type !== 'FILL_IN_BLANK' &&
												currentQuestion && (
													<>
														{' '}
														- {dict.learning.question} {currentQuestionIndex + 1}/
														{currentExercise.questions.length}
													</>
												)}
										</span>
									</div>

									{/* Render Different Exercise Types */}
									{isSpeechExercise(currentExercise.type) ? (
										<>
											{/* Database Integration Status */}
											<div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
												<div className='flex items-center text-green-800'>
													<span className='text-lg mr-2'>🔗</span>
													<span className='font-medium'>Database Integration Active</span>
												</div>
												<div className='text-sm text-green-700 mt-1'>
													Kết quả sẽ được lưu vào database với Exercise ID:{' '}
													{currentExercise.id}
												</div>
											</div>

											<SpeechExerciseComponent
												exercise={{
													id: currentExercise.id,
													title: currentExercise.title,
													description: currentExercise.description,
													type: currentExercise.type as any,
													targetText: currentExercise.targetText || '',
													targetAudioUrl: currentExercise.targetAudioUrl,
													difficultyLevel: currentExercise.difficultyLevel || 'BEGINNER',
													speechRecognitionLanguage:
														currentExercise.speechRecognitionLanguage || 'ja-JP',
													minimumAccuracyScore: currentExercise.minimumAccuracyScore || 80,
												}}
												onComplete={handleSpeechExerciseComplete}
												onNext={handleNextExercise}
												dict={dict}
												demoMode={false} // ENABLE REAL DATABASE MODE
											/>
										</>
									) : currentExercise.type === 'FILL_IN_BLANK' ? (
										/* Fill-in-the-Blank Exercise */
										<>
											<div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
												<div className='flex items-center text-blue-800'>
													<span className='text-lg mr-2'>📝</span>
													<span className='font-medium'>Fill-in-the-Blank Exercise</span>
												</div>
												<div className='text-sm text-blue-700 mt-1'>
													Bài tập điền từ vào chỗ trống - Exercise ID: {currentExercise.id}
												</div>
											</div>
											<FillInTheBlankExercise
												exercise={currentExercise}
												onComplete={(result) => {
													console.log('Fill-in-the-blank exercise completed:', result);
													// Play audio feedback
													playAudioFeedback(result.passed, result.score);
													// Only proceed to next exercise if truly completed all questions
													if (
														result.passed &&
														result.correctAnswers === result.totalQuestions
													) {
														console.log(
															'✅ All questions completed, proceeding to next exercise'
														);
														handleNextExercise();
													} else {
														console.log('⚠️ Not all questions completed or not passed');
													}
												}}
												onNext={handleNextExercise}
											/>
										</>
									) : (
										/* Traditional Exercise Interface */
										currentQuestion && (
											<>
												<p className='text-gray-600 mb-4'>{currentExercise.description}</p>

												<div className='bg-gray-50 rounded-lg p-4 mb-4'>
													<h4 className='font-medium text-gray-800 mb-3'>
														{currentQuestion.content}
													</h4>

													{currentQuestion.hint && (
														<p className='text-sm text-gray-600 italic mb-3'>
															{dict.learning.hint}: {currentQuestion.hint}
														</p>
													)}

													<div className='space-y-2 mt-4'>
														{currentQuestion.options.map((option: QuestionOption) => {
															const isSelected =
																selectedOptions[currentQuestion.id] === option.id;
															const hasAnswered = currentQuestion.id in selectedOptions;
															const isCorrect = isOptionCorrect(
																currentQuestion.id,
																option.id
															);

															let optionClass =
																'border rounded-md p-3 cursor-pointer transition-all duration-200';

															if (!hasAnswered) {
																optionClass += isSelected
																	? ' border-blue-500 bg-blue-50 transform scale-[1.02]'
																	: ' hover:bg-gray-100 hover:border-gray-300';
															} else {
																if (isSelected) {
																	optionClass += isCorrect
																		? ' border-green-500 bg-green-50 text-green-800 transform scale-[1.02]'
																		: ' border-red-500 bg-red-50 text-red-800 transform scale-[1.02]';
																} else if (isCorrect) {
																	optionClass +=
																		' border-green-500 bg-green-50 text-green-800';
																} else {
																	optionClass += ' opacity-60';
																}
																optionClass += ' cursor-default';
															}

															return (
																<div
																	key={option.id}
																	className={optionClass}
																	onClick={() => {
																		if (!hasAnswered) {
																			handleOptionSelect(
																				currentQuestion.id,
																				option.id
																			);
																		}
																	}}
																>
																	<div className='flex items-center'>
																		{hasAnswered && isSelected && (
																			<span className='mr-2 text-lg'>
																				{isCorrect ? '✅' : '❌'}
																			</span>
																		)}
																		{hasAnswered && !isSelected && isCorrect && (
																			<span className='mr-2 text-lg'>✅</span>
																		)}
																		<span className='flex-1'>{option.content}</span>
																	</div>
																</div>
															);
														})}
													</div>

													{currentQuestion.id in selectedOptions && (
														<div className='mt-4'>
															<div
																className={`p-3 rounded-md transition-all duration-300 ${
																	isOptionCorrect(
																		currentQuestion.id,
																		selectedOptions[currentQuestion.id]
																	)
																		? 'bg-green-50 text-green-800 border border-green-200'
																		: 'bg-red-50 text-red-800 border border-red-200'
																}`}
															>
																<p className='font-medium mb-1 flex items-center'>
																	<span className='mr-2 text-lg'>
																		{isOptionCorrect(
																			currentQuestion.id,
																			selectedOptions[currentQuestion.id]
																		)
																			? '🎉'
																			: '💭'}
																	</span>
																	{isOptionCorrect(
																		currentQuestion.id,
																		selectedOptions[currentQuestion.id]
																	)
																		? dict.learning.correct
																		: dict.learning.incorrect}
																</p>
																<p className='text-sm'>
																	{currentQuestion.answerExplanation}
																</p>
															</div>

															<div className='flex justify-between mt-4'>
																<button
																	onClick={() => {
																		if (currentQuestionIndex > 0) {
																			setCurrentQuestionIndex(
																				currentQuestionIndex - 1
																			);
																		} else if (currentExerciseIndex > 0) {
																			setCurrentExerciseIndex(
																				currentExerciseIndex - 1
																			);
																			const prevExercise =
																				currentLesson.exercises[
																					currentExerciseIndex - 1
																				];
																			setCurrentQuestionIndex(
																				prevExercise.questions.length - 1
																			);
																		}
																	}}
																	disabled={
																		currentQuestionIndex === 0 &&
																		currentExerciseIndex === 0
																	}
																	className='px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
																>
																	{dict.learning.previousQuestion}
																</button>

																<button
																	onClick={() => {
																		if (
																			currentQuestionIndex <
																			currentExercise.questions.length - 1
																		) {
																			setCurrentQuestionIndex(
																				currentQuestionIndex + 1
																			);
																		} else if (
																			currentExerciseIndex <
																			currentLesson.exercises.length - 1
																		) {
																			setCurrentExerciseIndex(
																				currentExerciseIndex + 1
																			);
																			setCurrentQuestionIndex(0);
																		}
																	}}
																	disabled={
																		currentQuestionIndex ===
																			currentExercise.questions.length - 1 &&
																		currentExerciseIndex ===
																			currentLesson.exercises.length - 1
																	}
																	className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
																>
																	{dict.learning.nextQuestion}
																</button>
															</div>
														</div>
													)}
												</div>
											</>
										)
									)}
								</div>
							)}

							{activeTab === 'discussions' && (
								<div className='mb-6'>
									<DiscussionList lessonId={currentLesson.id} lang={lang} dict={dict} />
								</div>
							)}

							{/* Action buttons */}
							<div className='flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t'>
								<div className='flex items-center'>
									<div
										className={`flex items-center px-4 py-2 rounded-md ${
											currentLesson.completed
												? 'bg-green-100 text-green-700'
												: 'bg-gray-100 text-gray-500'
										}`}
									>
										{currentLesson.completed ? (
											<>
												<Check size={18} className='mr-2' />
												{dict.learning.completed}
											</>
										) : markAsCompletedMutation.isPending ? (
											<>
												<div className='animate-spin h-4 w-4 border-t-2 border-gray-500 rounded-full mr-2'></div>
												{dict.learning.updating}
											</>
										) : (
											<>
												<Check size={18} className='mr-2' />
												{dict.learning.autoMarkComplete}
											</>
										)}
									</div>
								</div>

								{/* Next lesson button */}
								{getNextLesson() && (
									<button
										onClick={() => {
											const next = getNextLesson();
											if (next) {
												selectLesson(next.lessonId, next.moduleId);
											}
										}}
										className='flex items-center px-4 py-2 bg-primary text-white rounded-md'
									>
										<Play size={18} className='mr-2' />
										{dict.learning.nextLesson}
									</button>
								)}
							</div>
						</div>
					) : (
						<div className='flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-lg shadow-md p-6'>
							<Book size={48} className='text-blue-500 mb-4' />
							<h2 className='text-xl font-bold text-gray-800 mb-2'>{dict.learning.noLessonSelected}</h2>
							<p className='text-gray-600 mb-4'>{dict.learning.selectLessonPrompt}</p>
						</div>
					)}

					{/* Course Overview */}
					<div className='mt-6 bg-white rounded-lg shadow-md p-4 lg:p-6'>
						<h2 className='text-xl font-bold text-gray-800 mb-4'>{dict.learning.courseOverview}</h2>
						<div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: course.courseOverview }} />
					</div>
				</div>

				{/* Left sidebar - Course structure */}
				<div className='lg:w-2/6 bg-white shadow-md sticky rounded-md top-24 right-0 h-fit p-4'>
					<div className='flex items-center mb-6'>
						<button
							onClick={() => router.push(`/${lang}/courses`)}
							className='flex items-center text-primary transition'
						>
							<ArrowLeft size={18} className='mr-1' />
							<span>{dict.learning.backToCourses}</span>
						</button>
					</div>

					<div className='mb-6'>
						<h1 className='text-xl font-bold text-gray-800 mb-2'>{course.title}</h1>
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<span className='bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded'>
									{dict.learning.level}: {course.level}
								</span>
							</div>
							<div className='text-sm text-gray-500'>
								{course.completedLessons}/
								{course.modules.reduce((total: any, module: any) => total + module.lessons.length, 0)}{' '}
								{dict.learning.ofLessons}
							</div>
						</div>
						<div className='w-full bg-gray-200 rounded-full h-2.5 mt-3'>
							<div className='bg-primary h-2.5 rounded-full' style={{ width: `${progress()}%` }}></div>
						</div>
					</div>

					<div className='divide-y divide-gray-200'>
						{course.modules.map((module: any) => (
							<div key={module.id} className='py-2'>
								<div
									className='flex items-center justify-between py-2 cursor-pointer'
									onClick={() => toggleModule(module.id)}
								>
									<h3 className='text-md font-medium text-gray-700'>{module.title}</h3>
									<div className='flex items-center'>
										<span className='text-xs text-gray-500 mr-2'>
											{module.durationInMinutes} {dict.learning.minutes}
										</span>
										{expandedModules[module.id] ? (
											<ChevronUp size={18} />
										) : (
											<ChevronDown size={18} />
										)}
									</div>
								</div>

								{expandedModules[module.id] && (
									<div className='ml-4 space-y-2 mt-2'>
										{module.lessons.map((lesson: any) => (
											<div
												key={lesson.id}
												onClick={() => selectLesson(lesson.id, module.id)}
												className={`flex items-center p-2 rounded-md cursor-pointer ${
													currentLessonId === lesson.id
														? 'bg-blue-50 text-blue-700'
														: 'hover:bg-gray-50'
												}`}
											>
												{lesson.completed ? (
													<Check size={16} className='text-green-500 mr-2 flex-shrink-0' />
												) : (
													<ChevronRight size={16} className='mr-2 flex-shrink-0' />
												)}
												<div className='flex-1'>
													<p
														className={`text-sm ${
															lesson.completed
																? 'font-medium text-green-700'
																: 'font-normal'
														}`}
													>
														{lesson.title}
													</p>
													<div className='flex items-center text-xs text-gray-500'>
														<span className='mr-1'>
															{lesson.durationInMinutes} {dict.learning.minutes}
														</span>
														{lesson.resources && lesson.resources.length > 0 && (
															<span className='mx-1 flex items-center'>
																<FileText size={12} className='mr-1' />
																{lesson.resources.length}
															</span>
														)}
														{lesson.exercises && lesson.exercises.length > 0 && (
															<span className='mx-1 flex items-center'>
																<PenTool size={12} className='mr-1' />
																{lesson.exercises.length}
															</span>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Result Modal */}
				<ResultModal
					isOpen={resultModalOpen}
					onClose={() => setResultModalOpen(false)}
					result={exerciseResult}
					onNext={exerciseResult?.isPassed ? handleNextExercise : undefined}
				/>
			</div>
		</div>
	);
};

export default LearningPage;
