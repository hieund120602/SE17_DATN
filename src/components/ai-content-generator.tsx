'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen, Headphones, FileText, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import AiContentService, {
	ExerciseGenerationRequest,
	ListeningExerciseRequest,
	GeneratedExerciseResponse,
	GeneratedListeningExerciseResponse,
	GeneratedContentResponse,
} from '@/services/ai-content-service';

interface AiContentGeneratorProps {
	onContentGenerated?: (content: any, type: 'exercise' | 'listening' | 'lesson') => void;
}

export default function AiContentGenerator({ onContentGenerated }: AiContentGeneratorProps) {
	const [activeTab, setActiveTab] = useState('exercise');
	const [exerciseRequest, setExerciseRequest] = useState<ExerciseGenerationRequest>({
		topic: '',
		level: 'BEGINNER',
		exerciseType: 'MULTIPLE_CHOICE',
		questionCount: 5,
		instructions: '',
	});
	const [listeningRequest, setListeningRequest] = useState<ListeningExerciseRequest>({
		topic: '',
		level: 'BEGINNER',
		duration: 60,
		speakingSpeed: 'NORMAL',
		includeScript: true,
		instructions: '',
	});
	const [lessonTopic, setLessonTopic] = useState('');
	const [lessonLevel, setLessonLevel] = useState('BEGINNER');

	// Generated content states
	const [generatedExercise, setGeneratedExercise] = useState<GeneratedExerciseResponse | null>(null);
	const [generatedListening, setGeneratedListening] = useState<GeneratedListeningExerciseResponse | null>(null);
	const [generatedLesson, setGeneratedLesson] = useState<GeneratedContentResponse | null>(null);

	// Mutations
	const exerciseMutation = useMutation({
		mutationFn: (request: ExerciseGenerationRequest) => AiContentService.generateExercise(request),
		onSuccess: (data) => {
			setGeneratedExercise(data);
			toast({
				title: 'Tạo bài tập thành công!',
				description: 'Bài tập đã được tạo bằng AI.',
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi khi tạo bài tập',
				description: error.response?.data?.message || 'Đã xảy ra lỗi không mong muốn',
			});
		},
	});

	const listeningMutation = useMutation({
		mutationFn: (request: ListeningExerciseRequest) => AiContentService.generateListeningExercise(request),
		onSuccess: (data) => {
			setGeneratedListening(data);
			toast({
				title: 'Tạo bài nghe thành công!',
				description: 'Bài tập nghe đã được tạo bằng AI.',
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi khi tạo bài nghe',
				description: error.response?.data?.message || 'Đã xảy ra lỗi không mong muốn',
			});
		},
	});

	const lessonMutation = useMutation({
		mutationFn: ({ topic, level }: { topic: string; level: string }) =>
			AiContentService.generateLessonContent(topic, level),
		onSuccess: (data) => {
			setGeneratedLesson(data);
			toast({
				title: 'Tạo nội dung bài học thành công!',
				description: 'Nội dung bài học đã được tạo bằng AI.',
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi khi tạo nội dung bài học',
				description: error.response?.data?.message || 'Đã xảy ra lỗi không mong muốn',
			});
		},
	});

	const handleGenerateExercise = () => {
		if (!exerciseRequest.topic.trim()) {
			toast({
				variant: 'destructive',
				title: 'Thiếu thông tin',
				description: 'Vui lòng nhập chủ đề cho bài tập',
			});
			return;
		}
		exerciseMutation.mutate(exerciseRequest);
	};

	const handleGenerateListening = () => {
		if (!listeningRequest.topic.trim()) {
			toast({
				variant: 'destructive',
				title: 'Thiếu thông tin',
				description: 'Vui lòng nhập chủ đề cho bài nghe',
			});
			return;
		}
		listeningMutation.mutate(listeningRequest);
	};

	const handleGenerateLesson = () => {
		if (!lessonTopic.trim()) {
			toast({
				variant: 'destructive',
				title: 'Thiếu thông tin',
				description: 'Vui lòng nhập chủ đề cho bài học',
			});
			return;
		}
		lessonMutation.mutate({ topic: lessonTopic, level: lessonLevel });
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: 'Đã sao chép!',
				description: 'Nội dung đã được sao chép vào clipboard',
			});
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Lỗi sao chép',
				description: 'Không thể sao chép nội dung',
			});
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='superOutline' className='gap-2'>
					<Sparkles className='h-4 w-4' />
					Tạo nội dung bằng AI
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Sparkles className='h-5 w-5 text-purple-600' />
						Trình tạo nội dung AI
					</DialogTitle>
					<DialogDescription>
						Sử dụng trí tuệ nhân tạo để tạo bài tập, bài nghe và nội dung bài học tiếng Nhật
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger value='exercise' className='gap-2'>
							<BookOpen className='h-4 w-4' />
							Bài tập
						</TabsTrigger>
						<TabsTrigger value='listening' className='gap-2'>
							<Headphones className='h-4 w-4' />
							Bài nghe
						</TabsTrigger>
						<TabsTrigger value='lesson' className='gap-2'>
							<FileText className='h-4 w-4' />
							Nội dung bài học
						</TabsTrigger>
					</TabsList>

					{/* Exercise Generation Tab */}
					<TabsContent value='exercise' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Input Form */}
							<Card>
								<CardHeader>
									<CardTitle>Tạo bài tập</CardTitle>
									<CardDescription>Nhập thông tin để tạo bài tập tiếng Nhật</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label htmlFor='exercise-topic'>Chủ đề</Label>
										<Input
											id='exercise-topic'
											value={exerciseRequest.topic}
											onChange={(e) =>
												setExerciseRequest({ ...exerciseRequest, topic: e.target.value })
											}
											placeholder='VD: Hiragana cơ bản, Ngữ pháp N5...'
										/>
									</div>

									<div>
										<Label htmlFor='exercise-level'>Trình độ</Label>
										<Select
											value={exerciseRequest.level}
											onValueChange={(value: any) =>
												setExerciseRequest({ ...exerciseRequest, level: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='BEGINNER'>Người mới bắt đầu</SelectItem>
												<SelectItem value='ELEMENTARY'>Cơ bản</SelectItem>
												<SelectItem value='INTERMEDIATE'>Trung cấp</SelectItem>
												<SelectItem value='ADVANCED'>Nâng cao</SelectItem>
												<SelectItem value='EXPERT'>Chuyên gia</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor='exercise-type'>Loại bài tập</Label>
										<Select
											value={exerciseRequest.exerciseType}
											onValueChange={(value: any) =>
												setExerciseRequest({ ...exerciseRequest, exerciseType: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='MULTIPLE_CHOICE'>Trắc nghiệm</SelectItem>
												<SelectItem value='FILL_IN_THE_BLANK'>Điền từ vào chỗ trống</SelectItem>
												<SelectItem value='MATCHING'>Nối từ</SelectItem>
												<SelectItem value='LISTENING'>Nghe</SelectItem>
												<SelectItem value='SPEAKING'>Nói</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor='question-count'>Số câu hỏi</Label>
										<Input
											id='question-count'
											type='number'
											min='1'
											max='20'
											value={exerciseRequest.questionCount}
											onChange={(e) =>
												setExerciseRequest({
													...exerciseRequest,
													questionCount: parseInt(e.target.value),
												})
											}
										/>
									</div>

									<div>
										<Label htmlFor='exercise-instructions'>Hướng dẫn (tùy chọn)</Label>
										<Textarea
											id='exercise-instructions'
											value={exerciseRequest.instructions}
											onChange={(e) =>
												setExerciseRequest({ ...exerciseRequest, instructions: e.target.value })
											}
											placeholder='Hướng dẫn đặc biệt cho bài tập...'
										/>
									</div>

									<Button
										onClick={handleGenerateExercise}
										disabled={exerciseMutation.isPending}
										className='w-full'
									>
										{exerciseMutation.isPending ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Đang tạo...
											</>
										) : (
											<>
												<Sparkles className='mr-2 h-4 w-4' />
												Tạo bài tập
											</>
										)}
									</Button>
								</CardContent>
							</Card>

							{/* Generated Exercise Display */}
							<Card>
								<CardHeader>
									<CardTitle>Kết quả</CardTitle>
									<CardDescription>Bài tập được tạo bởi AI</CardDescription>
								</CardHeader>
								<CardContent>
									{generatedExercise ? (
										<div className='space-y-4'>
											<div>
												<h3 className='font-semibold text-lg'>{generatedExercise.title}</h3>
												<p className='text-gray-600'>{generatedExercise.description}</p>
												<Badge variant='secondary' className='mt-2'>
													{generatedExercise.difficulty} • {generatedExercise.estimatedTime}{' '}
													phút
												</Badge>
											</div>

											<div>
												<Label>Hướng dẫn:</Label>
												<p className='text-sm bg-gray-50 p-3 rounded-md'>
													{generatedExercise.instructions}
												</p>
											</div>

											<div>
												<Label>Câu hỏi ({generatedExercise.questions.length}):</Label>
												<div className='space-y-3 mt-2'>
													{generatedExercise.questions.map((question, index) => (
														<div key={index} className='border rounded-lg p-3'>
															<p className='font-medium'>
																{index + 1}. {question.question}
															</p>
															{question.options && (
																<div className='mt-2 space-y-1'>
																	{question.options.map((option, optionIndex) => (
																		<p key={optionIndex} className='text-sm ml-4'>
																			{String.fromCharCode(65 + optionIndex)}.{' '}
																			{option}
																		</p>
																	))}
																</div>
															)}
															<div className='mt-2 text-sm'>
																<p>
																	<strong>Đáp án:</strong> {question.correctAnswer}
																</p>
																<p>
																	<strong>Giải thích:</strong> {question.explanation}
																</p>
																<p>
																	<strong>Điểm:</strong> {question.points}
																</p>
															</div>
														</div>
													))}
												</div>
											</div>

											<div className='flex space-x-2'>
												<Button
													variant='superOutline'
													onClick={() =>
														copyToClipboard(JSON.stringify(generatedExercise, null, 2))
													}
													className='gap-2'
												>
													<Copy className='h-4 w-4' />
													Sao chép JSON
												</Button>
												{onContentGenerated && (
													<Button
														onClick={() =>
															onContentGenerated(generatedExercise, 'exercise')
														}
														className='gap-2'
													>
														<CheckCircle className='h-4 w-4' />
														Sử dụng bài tập này
													</Button>
												)}
											</div>
										</div>
									) : (
										<div className='text-center text-gray-500 py-8'>
											<BookOpen className='h-16 w-16 mx-auto mb-4 text-gray-300' />
											<p>Bài tập sẽ hiển thị ở đây sau khi tạo</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Listening Exercise Tab */}
					<TabsContent value='listening' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Input Form */}
							<Card>
								<CardHeader>
									<CardTitle>Tạo bài nghe</CardTitle>
									<CardDescription>Tạo bài tập nghe với audio được tạo bởi AI</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label htmlFor='listening-topic'>Chủ đề</Label>
										<Input
											id='listening-topic'
											value={listeningRequest.topic}
											onChange={(e) =>
												setListeningRequest({ ...listeningRequest, topic: e.target.value })
											}
											placeholder='VD: Giới thiệu bản thân, Mua sắm...'
										/>
									</div>

									<div>
										<Label htmlFor='listening-level'>Trình độ</Label>
										<Select
											value={listeningRequest.level}
											onValueChange={(value: any) =>
												setListeningRequest({ ...listeningRequest, level: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='BEGINNER'>Người mới bắt đầu</SelectItem>
												<SelectItem value='ELEMENTARY'>Cơ bản</SelectItem>
												<SelectItem value='INTERMEDIATE'>Trung cấp</SelectItem>
												<SelectItem value='ADVANCED'>Nâng cao</SelectItem>
												<SelectItem value='EXPERT'>Chuyên gia</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor='duration'>Thời lượng (giây)</Label>
										<Input
											id='duration'
											type='number'
											min='30'
											max='300'
											value={listeningRequest.duration}
											onChange={(e) =>
												setListeningRequest({
													...listeningRequest,
													duration: parseInt(e.target.value),
												})
											}
										/>
									</div>

									<div>
										<Label htmlFor='speaking-speed'>Tốc độ nói</Label>
										<Select
											value={listeningRequest.speakingSpeed}
											onValueChange={(value: any) =>
												setListeningRequest({ ...listeningRequest, speakingSpeed: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='SLOW'>Chậm</SelectItem>
												<SelectItem value='NORMAL'>Bình thường</SelectItem>
												<SelectItem value='FAST'>Nhanh</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className='flex items-center space-x-2'>
										<input
											type='checkbox'
											id='include-script'
											checked={listeningRequest.includeScript}
											onChange={(e) =>
												setListeningRequest({
													...listeningRequest,
													includeScript: e.target.checked,
												})
											}
										/>
										<Label htmlFor='include-script'>Bao gồm bản script</Label>
									</div>

									<div>
										<Label htmlFor='listening-instructions'>Hướng dẫn (tùy chọn)</Label>
										<Textarea
											id='listening-instructions'
											value={listeningRequest.instructions}
											onChange={(e) =>
												setListeningRequest({
													...listeningRequest,
													instructions: e.target.value,
												})
											}
											placeholder='Hướng dẫn đặc biệt cho bài nghe...'
										/>
									</div>

									<Button
										onClick={handleGenerateListening}
										disabled={listeningMutation.isPending}
										className='w-full'
									>
										{listeningMutation.isPending ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Đang tạo...
											</>
										) : (
											<>
												<Headphones className='mr-2 h-4 w-4' />
												Tạo bài nghe
											</>
										)}
									</Button>
								</CardContent>
							</Card>

							{/* Generated Listening Display */}
							<Card>
								<CardHeader>
									<CardTitle>Kết quả</CardTitle>
									<CardDescription>Bài nghe được tạo bởi AI</CardDescription>
								</CardHeader>
								<CardContent>
									{generatedListening ? (
										<div className='space-y-4'>
											<div>
												<h3 className='font-semibold text-lg'>{generatedListening.title}</h3>
												<p className='text-gray-600'>{generatedListening.description}</p>
												<Badge variant='secondary' className='mt-2'>
													{generatedListening.difficulty} • {generatedListening.duration}s
												</Badge>
											</div>

											<div>
												<Label>Audio:</Label>
												<audio controls className='w-full mt-2'>
													<source src={generatedListening.audioUrl} type='audio/mpeg' />
													Trình duyệt không hỗ trợ audio
												</audio>
											</div>

											{generatedListening.script && (
												<div>
													<Label>Script:</Label>
													<p className='text-sm bg-gray-50 p-3 rounded-md'>
														{generatedListening.script}
													</p>
												</div>
											)}

											<div>
												<Label>Câu hỏi ({generatedListening.questions.length}):</Label>
												<div className='space-y-3 mt-2'>
													{generatedListening.questions.map((question, index) => (
														<div key={index} className='border rounded-lg p-3'>
															<p className='font-medium'>
																{index + 1}. {question.question}
															</p>
															{question.options && (
																<div className='mt-2 space-y-1'>
																	{question.options.map((option, optionIndex) => (
																		<p key={optionIndex} className='text-sm ml-4'>
																			{String.fromCharCode(65 + optionIndex)}.{' '}
																			{option}
																		</p>
																	))}
																</div>
															)}
															<div className='mt-2 text-sm'>
																<p>
																	<strong>Đáp án:</strong> {question.correctAnswer}
																</p>
																<p>
																	<strong>Giải thích:</strong> {question.explanation}
																</p>
															</div>
														</div>
													))}
												</div>
											</div>

											<div className='flex space-x-2'>
												<Button
													variant='superOutline'
													onClick={() =>
														copyToClipboard(JSON.stringify(generatedListening, null, 2))
													}
													className='gap-2'
												>
													<Copy className='h-4 w-4' />
													Sao chép JSON
												</Button>
												{onContentGenerated && (
													<Button
														onClick={() =>
															onContentGenerated(generatedListening, 'listening')
														}
														className='gap-2'
													>
														<CheckCircle className='h-4 w-4' />
														Sử dụng bài nghe này
													</Button>
												)}
											</div>
										</div>
									) : (
										<div className='text-center text-gray-500 py-8'>
											<Headphones className='h-16 w-16 mx-auto mb-4 text-gray-300' />
											<p>Bài nghe sẽ hiển thị ở đây sau khi tạo</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Lesson Content Tab */}
					<TabsContent value='lesson' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Input Form */}
							<Card>
								<CardHeader>
									<CardTitle>Tạo nội dung bài học</CardTitle>
									<CardDescription>
										Tạo nội dung bài học hoàn chỉnh với từ vựng và ngữ pháp
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label htmlFor='lesson-topic'>Chủ đề bài học</Label>
										<Input
											id='lesson-topic'
											value={lessonTopic}
											onChange={(e) => setLessonTopic(e.target.value)}
											placeholder='VD: Chào hỏi cơ bản, Gia đình...'
										/>
									</div>

									<div>
										<Label htmlFor='lesson-level'>Trình độ</Label>
										<Select value={lessonLevel} onValueChange={setLessonLevel}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='BEGINNER'>Người mới bắt đầu</SelectItem>
												<SelectItem value='ELEMENTARY'>Cơ bản</SelectItem>
												<SelectItem value='INTERMEDIATE'>Trung cấp</SelectItem>
												<SelectItem value='ADVANCED'>Nâng cao</SelectItem>
												<SelectItem value='EXPERT'>Chuyên gia</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<Button
										onClick={handleGenerateLesson}
										disabled={lessonMutation.isPending}
										className='w-full'
									>
										{lessonMutation.isPending ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Đang tạo...
											</>
										) : (
											<>
												<FileText className='mr-2 h-4 w-4' />
												Tạo nội dung bài học
											</>
										)}
									</Button>
								</CardContent>
							</Card>

							{/* Generated Lesson Display */}
							<Card>
								<CardHeader>
									<CardTitle>Kết quả</CardTitle>
									<CardDescription>Nội dung bài học được tạo bởi AI</CardDescription>
								</CardHeader>
								<CardContent>
									{generatedLesson ? (
										<div className='space-y-4'>
											<div>
												<h3 className='font-semibold text-lg'>{generatedLesson.title}</h3>
											</div>

											<div>
												<Label>Nội dung bài học:</Label>
												<div className='text-sm bg-gray-50 p-4 rounded-md whitespace-pre-wrap'>
													{generatedLesson.content}
												</div>
											</div>

											<div>
												<Label>Điểm chính:</Label>
												<ul className='list-disc list-inside space-y-1 mt-2'>
													{generatedLesson.keyPoints.map((point, index) => (
														<li key={index} className='text-sm'>
															{point}
														</li>
													))}
												</ul>
											</div>

											<div>
												<Label>Từ vựng:</Label>
												<div className='grid grid-cols-1 gap-2 mt-2'>
													{generatedLesson.vocabulary.map((vocab, index) => (
														<div key={index} className='border rounded p-2'>
															<p className='font-medium'>{vocab.word}</p>
															<p className='text-sm text-gray-600'>{vocab.reading}</p>
															<p className='text-sm'>{vocab.meaning}</p>
														</div>
													))}
												</div>
											</div>

											<div>
												<Label>Ngữ pháp:</Label>
												<div className='space-y-3 mt-2'>
													{generatedLesson.grammar.map((grammar, index) => (
														<div key={index} className='border rounded-lg p-3'>
															<p className='font-medium'>{grammar.pattern}</p>
															<p className='text-sm text-gray-600 mb-2'>
																{grammar.explanation}
															</p>
															<div>
																<Label className='text-xs'>Ví dụ:</Label>
																<ul className='list-disc list-inside'>
																	{grammar.examples.map((example, exampleIndex) => (
																		<li key={exampleIndex} className='text-sm'>
																			{example}
																		</li>
																	))}
																</ul>
															</div>
														</div>
													))}
												</div>
											</div>

											<div className='flex space-x-2'>
												<Button
													variant='superOutline'
													onClick={() =>
														copyToClipboard(JSON.stringify(generatedLesson, null, 2))
													}
													className='gap-2'
												>
													<Copy className='h-4 w-4' />
													Sao chép JSON
												</Button>
												{onContentGenerated && (
													<Button
														onClick={() => onContentGenerated(generatedLesson, 'lesson')}
														className='gap-2'
													>
														<CheckCircle className='h-4 w-4' />
														Sử dụng nội dung này
													</Button>
												)}
											</div>
										</div>
									) : (
										<div className='text-center text-gray-500 py-8'>
											<FileText className='h-16 w-16 mx-auto mb-4 text-gray-300' />
											<p>Nội dung bài học sẽ hiển thị ở đây sau khi tạo</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
