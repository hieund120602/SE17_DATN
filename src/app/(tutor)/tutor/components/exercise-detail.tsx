import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mic, Volume2, Settings, Target, Play } from 'lucide-react';

const ExerciseDetailDialog = ({ exercise, isOpen, onClose }: any) => {
	if (!isOpen || !exercise) return null;

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

	const getDifficultyLabel = (level: any) => {
		switch (level) {
			case 'BEGINNER':
				return 'Người mới bắt đầu';
			case 'ELEMENTARY':
				return 'Sơ cấp';
			case 'INTERMEDIATE':
				return 'Trung cấp';
			case 'ADVANCED':
				return 'Nâng cao';
			case 'EXPERT':
				return 'Chuyên gia';
			default:
				return level;
		}
	};

	const getLanguageLabel = (lang: any) => {
		switch (lang) {
			case 'ja-JP':
				return 'Tiếng Nhật (日本語)';
			case 'en-US':
				return 'Tiếng Anh (English)';
			case 'vi-VN':
				return 'Tiếng Việt';
			default:
				return lang;
		}
	};

	// Check if this is a speech exercise
	const isSpeechExercise = ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'].includes(exercise.type);

	const getExerciseIcon = () => {
		if (['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'].includes(exercise.type)) {
			return <Mic className='h-5 w-5' />;
		}
		return null;
	};

	const getBadgeColor = () => {
		if (isSpeechExercise) {
			return 'bg-blue-100 text-blue-800 border-blue-200';
		}
		return 'bg-purple-100 text-purple-800 border-purple-200';
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[650px] max-h-[85vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex items-center'>
						<Badge className={`mr-2 ${getBadgeColor()}`}>
							<div className='flex items-center gap-1'>
								{getExerciseIcon()}
								{getExerciseTypeLabel(exercise.type)}
							</div>
						</Badge>
						<DialogTitle>{exercise.title}</DialogTitle>
					</div>
					<DialogDescription>Chi tiết bài tập</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					{exercise.description && (
						<div className={`p-4 rounded-lg ${isSpeechExercise ? 'bg-blue-50' : 'bg-purple-50'}`}>
							<h4
								className={`font-medium mb-2 ${isSpeechExercise ? 'text-blue-800' : 'text-purple-800'}`}
							>
								Mô tả bài tập
							</h4>
							<p
								className={`text-sm whitespace-pre-line ${
									isSpeechExercise ? 'text-blue-700' : 'text-purple-700'
								}`}
							>
								{exercise.description}
							</p>
						</div>
					)}

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<h4 className='text-sm font-medium text-gray-500 mb-1'>Loại bài tập</h4>
							<p className='font-medium'>{getExerciseTypeLabel(exercise.type)}</p>
						</div>
						<div>
							<h4 className='text-sm font-medium text-gray-500 mb-1'>
								{isSpeechExercise ? 'Nội dung' : 'Số câu hỏi'}
							</h4>
							<p className='font-medium'>
								{isSpeechExercise ? 'Bài tập Speech' : `${exercise.questions?.length || 0} câu`}
							</p>
						</div>
					</div>

					{/* Speech Exercise Fields */}
					{isSpeechExercise && (
						<div className='space-y-4'>
							<h4 className='font-medium text-blue-800 border-b pb-2'>Thông tin bài tập Speech</h4>

							{/* Target Text */}
							{exercise.targetText && (
								<div className='bg-blue-50 p-4 rounded-lg'>
									<div className='flex items-center gap-2 mb-2'>
										<Target className='h-5 w-5 text-blue-600' />
										<h5 className='text-sm font-medium text-blue-700'>
											Nội dung mục tiêu (tiếng Nhật):
										</h5>
									</div>
									<p className='text-lg font-mono text-blue-900 bg-white p-3 rounded border'>
										{exercise.targetText}
									</p>
								</div>
							)}

							{/* Target Audio URL */}
							{exercise.targetAudioUrl && (
								<div className='bg-blue-50 p-4 rounded-lg'>
									<div className='flex items-center gap-2 mb-2'>
										<Volume2 className='h-5 w-5 text-blue-600' />
										<h5 className='text-sm font-medium text-blue-700'>Audio mục tiêu:</h5>
									</div>
									<div className='flex items-center gap-2'>
										<a
											href={exercise.targetAudioUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='text-sm text-blue-600 hover:underline flex items-center gap-1'
										>
											<Play className='h-4 w-4' />
											Nghe audio mẫu
										</a>
									</div>
								</div>
							)}

							{/* Speech Exercise Settings */}
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{exercise.difficultyLevel && (
									<div className='bg-white p-3 rounded-lg border'>
										<h5 className='text-xs font-medium text-gray-500 mb-1'>Cấp độ khó</h5>
										<p className='font-medium text-gray-900'>
											{getDifficultyLabel(exercise.difficultyLevel)}
										</p>
									</div>
								)}

								{exercise.speechRecognitionLanguage && (
									<div className='bg-white p-3 rounded-lg border'>
										<h5 className='text-xs font-medium text-gray-500 mb-1'>Ngôn ngữ nhận dạng</h5>
										<p className='font-medium text-gray-900'>
											{getLanguageLabel(exercise.speechRecognitionLanguage)}
										</p>
									</div>
								)}

								{exercise.minimumAccuracyScore && (
									<div className='bg-white p-3 rounded-lg border'>
										<h5 className='text-xs font-medium text-gray-500 mb-1'>Điểm tối thiểu</h5>
										<p className='font-medium text-gray-900'>{exercise.minimumAccuracyScore}%</p>
									</div>
								)}
							</div>

							{/* Instructions for Speech Exercise */}
							<div className='bg-green-50 p-4 rounded-lg border border-green-200'>
								<h5 className='text-sm font-medium text-green-700 mb-2'>Hướng dẫn cho học viên:</h5>
								<ul className='text-sm text-green-600 space-y-1'>
									<li>• Đảm bảo microphone hoạt động tốt</li>
									<li>• Nói rõ ràng và với tốc độ vừa phải</li>
									<li>• Thực hiện trong môi trường yên tĩnh</li>
									<li>• Có thể thử nhiều lần để đạt điểm tối thiểu</li>
								</ul>
							</div>
						</div>
					)}

					{/* Traditional Exercise Questions */}
					{!isSpeechExercise && exercise.questions && exercise.questions.length > 0 && (
						<div>
							<h4 className='font-medium mt-4 mb-3 text-purple-800 border-b pb-2'>Danh sách câu hỏi</h4>
							<Accordion type='single' collapsible className='space-y-3'>
								{exercise.questions.map((question: any, index: any) => (
									<AccordionItem
										key={question.id}
										value={`question-${question.id}`}
										className='bg-white border rounded-lg overflow-hidden'
									>
										<AccordionTrigger className='px-4 py-3 hover:bg-gray-50'>
											<div className='flex items-center text-left'>
												<span className='font-medium'>Câu {index + 1}:</span>
												<span className='ml-2 text-gray-800'>
													{question.content.length > 60
														? `${question.content.substring(0, 60)}...`
														: question.content}
												</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className='px-4 pb-4 pt-2'>
											<div className='space-y-4'>
												<div>
													<h5 className='text-sm font-medium text-gray-600 mb-1'>
														Nội dung câu hỏi:
													</h5>
													<p className='text-gray-900'>{question.content}</p>
												</div>

												{question.hint && (
													<div>
														<h5 className='text-sm font-medium text-amber-600 mb-1'>
															Gợi ý:
														</h5>
														<p className='text-gray-800 text-sm'>{question.hint}</p>
													</div>
												)}

												{exercise.type === 'MULTIPLE_CHOICE' && question.options && (
													<div>
														<h5 className='text-sm font-medium text-gray-600 mb-2'>
															Các lựa chọn:
														</h5>
														<RadioGroup defaultValue='' className='space-y-2'>
															{question.options.map((option: any) => (
																<div
																	key={option.id}
																	className={`flex items-center space-x-2 p-2 rounded-md ${
																		option.correct
																			? 'bg-green-50 border border-green-200'
																			: ''
																	}`}
																>
																	<RadioGroupItem
																		value={`option-${option.id}`}
																		id={`option-${option.id}`}
																		disabled
																		checked={option.correct}
																	/>
																	<Label
																		htmlFor={`option-${option.id}`}
																		className={`flex-1 ${
																			option.correct
																				? 'font-medium text-green-700'
																				: ''
																		}`}
																	>
																		{option.content}
																	</Label>
																	{option.correct && (
																		<Badge className='bg-green-100 text-green-800 border-green-200'>
																			Đáp án đúng
																		</Badge>
																	)}
																</div>
															))}
														</RadioGroup>
													</div>
												)}

												{question.correctAnswer && (
													<div>
														<h5 className='text-sm font-medium text-green-600 mb-1'>
															Đáp án đúng:
														</h5>
														<p className='text-green-700 font-medium'>
															{question.correctAnswer}
														</p>
													</div>
												)}

												{question.answerExplanation && (
													<div className='bg-blue-50 p-3 rounded-md'>
														<h5 className='text-sm font-medium text-blue-700 mb-1'>
															Giải thích:
														</h5>
														<p className='text-sm text-blue-800'>
															{question.answerExplanation}
														</p>
													</div>
												)}

												<div className='flex justify-between text-sm'>
													<span className='text-gray-500'>
														Điểm:{' '}
														<span className='font-medium text-gray-700'>
															{question.points || 1}
														</span>
													</span>
													<span className='text-gray-500'>ID: {question.id}</span>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					)}

					{/* Show message if no content */}
					{!isSpeechExercise && (!exercise.questions || exercise.questions.length === 0) && (
						<div className='text-center py-8 text-gray-500'>
							<p>Bài tập này chưa có câu hỏi nào.</p>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant='secondary' onClick={onClose}>
						Đóng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ExerciseDetailDialog;
