'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
	id: number;
	content: string;
	hint?: string;
	correctAnswer?: string;
	answerExplanation?: string;
	points: number;
	options: Array<{
		id: number;
		content: string;
		correct: boolean;
	}>;
}

interface Exercise {
	id: number;
	title: string;
	description: string;
	type: string;
	questions: Question[];
}

interface FillInTheBlankExerciseProps {
	exercise: Exercise;
	onComplete: (result: any) => void;
	onNext?: () => void;
	className?: string;
}

export default function FillInTheBlankExercise({
	exercise,
	onComplete,
	onNext,
	className = '',
}: FillInTheBlankExerciseProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
	const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
	const [showHints, setShowHints] = useState<Record<number, boolean>>({});
	const [exerciseCompleted, setExerciseCompleted] = useState(false);
	const [startTime] = useState(Date.now());

	const currentQuestion = exercise.questions[currentQuestionIndex];

	// Debug logs
	useEffect(() => {
		console.log('🔍 Fill-in-the-blank Exercise Data:', {
			exercise,
			currentQuestion,
			currentQuestionIndex,
		});
	}, [exercise, currentQuestion, currentQuestionIndex]);

	// Function to get correct answer for a question
	const getCorrectAnswer = (question: Question): string => {
		// Ưu tiên sử dụng correctAnswer field từ backend
		if (question.correctAnswer && question.correctAnswer.trim()) {
			return question.correctAnswer.trim();
		}

		// Fallback: lấy từ options nếu có
		const correctOption = question.options?.find((opt) => opt.correct);
		if (correctOption?.content) {
			return correctOption.content.trim();
		}

		// Default fallback
		return 'あ';
	};

	// Enhanced function to parse content and create blanks
	const parseContentWithBlanks = (content: string) => {
		console.log('🔍 Parsing content:', content);

		// Multiple patterns to detect blanks
		const patterns = [
			/\[([^\]]+)\]/g, // [answer]
			/\{([^}]+)\}/g, // {answer}
			/_{3,}/g, // ____
			/【([^】]+)】/g, // 【answer】
			/\(\s*\)/g, // ( )
			/__+/g, // __ (2 or more underscores)
		];

		let foundBlanks = false;
		let parts = [];
		let lastIndex = 0;
		let blankIndex = 0;

		// Try each pattern
		for (const pattern of patterns) {
			const matches = Array.from(content.matchAll(pattern));
			if (matches.length > 0) {
				console.log('✅ Found matches with pattern:', pattern, matches);

				for (const match of matches) {
					// Add text before blank
					if (match.index! > lastIndex) {
						parts.push({
							type: 'text',
							content: content.substring(lastIndex, match.index),
						});
					}

					// Get answer (from capture group or use correctAnswer)
					let answer = match[1] || getCorrectAnswer(currentQuestion);

					parts.push({
						type: 'blank',
						answer: answer,
						index: blankIndex,
					});

					blankIndex++;
					lastIndex = match.index! + match[0].length;
					foundBlanks = true;
				}

				// Add remaining text
				if (lastIndex < content.length) {
					parts.push({
						type: 'text',
						content: content.substring(lastIndex),
					});
				}

				break; // Stop after first successful pattern
			}
		}

		// If no blanks found, create one at the end
		if (!foundBlanks) {
			console.log('⚠️ No blanks found, creating default blank');
			parts = [
				{
					type: 'text',
					content: content + ' ',
				},
				{
					type: 'blank',
					answer: getCorrectAnswer(currentQuestion),
					index: 0,
				},
			];
		}

		console.log('📝 Parsed parts:', parts);
		return parts;
	};

	// Handle input change for blanks
	const handleInputChange = (questionId: number, blankIndex: number, value: string) => {
		const key = `${questionId}_${blankIndex}`;
		setUserAnswers((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	// Enhanced answer checking
	const checkAnswer = (questionId: number, blankIndex: number, userAnswer: string, correctAnswer: string) => {
		const normalizedUser = userAnswer.toLowerCase().trim();
		const normalizedCorrect = correctAnswer.toLowerCase().trim();

		// Handle multiple correct answers separated by | or ,
		const correctAnswers = normalizedCorrect.split(/[|,]/).map((a) => a.trim());

		return correctAnswers.some((answer) => {
			// Exact match
			if (normalizedUser === answer) return true;
			// Partial match for Japanese characters
			if (answer.length <= 3 && normalizedUser.includes(answer)) return true;
			if (normalizedUser.length <= 3 && answer.includes(normalizedUser)) return true;
			return false;
		});
	};

	// Submit current question
	const submitQuestion = () => {
		if (submittedAnswers[currentQuestion.id]) return;

		const parts = parseContentWithBlanks(currentQuestion.content);
		const blanks = parts.filter((part) => part.type === 'blank');

		if (blanks.length === 0) {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: 'Không tìm thấy chỗ trống trong câu hỏi này!',
			});
			return;
		}

		let allCorrect = true;
		let hasAnswered = false;
		let correctCount = 0;

		blanks.forEach((blank: any) => {
			const key = `${currentQuestion.id}_${blank.index}`;
			const userAnswer = userAnswers[key] || '';

			if (userAnswer.trim()) {
				hasAnswered = true;
				if (checkAnswer(currentQuestion.id, blank.index, userAnswer, blank.answer)) {
					correctCount++;
				} else {
					allCorrect = false;
				}
			} else {
				allCorrect = false;
			}
		});

		if (!hasAnswered) {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: 'Vui lòng điền vào ít nhất một chỗ trống!',
			});
			return;
		}

		setSubmittedAnswers((prev) => ({
			...prev,
			[currentQuestion.id]: true,
		}));

		// Show results
		if (allCorrect) {
			toast({
				title: 'Chính xác! 🎉',
				description: `Bạn đã trả lời đúng ${correctCount}/${blanks.length} chỗ trống.`,
			});
		} else {
			toast({
				variant: 'destructive',
				title: 'Chưa chính xác',
				description: `Bạn trả lời đúng ${correctCount}/${blanks.length} chỗ trống. Hãy xem lại!`,
			});
		}
	};

	// Show hint
	const toggleHint = (questionId: number) => {
		setShowHints((prev) => ({
			...prev,
			[questionId]: !prev[questionId],
		}));
	};

	// Next question
	const nextQuestion = () => {
		if (currentQuestionIndex < exercise.questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			// Check if all questions have been answered before completing
			const allQuestionsAnswered = exercise.questions.every((q) => submittedAnswers[q.id]);

			if (allQuestionsAnswered) {
				completeExercise();
			} else {
				toast({
					variant: 'destructive',
					title: 'Chưa hoàn thành',
					description: 'Vui lòng trả lời tất cả câu hỏi trước khi hoàn thành bài tập!',
				});
			}
		}
	};

	// Complete exercise
	const completeExercise = () => {
		const timeSpent = Math.floor((Date.now() - startTime) / 1000);
		const totalQuestions = exercise.questions.length;
		const submittedQuestionsCount = Object.keys(submittedAnswers).length;

		// Calculate actual correct answers by checking each submitted answer
		let actualCorrectAnswers = 0;
		Object.keys(submittedAnswers).forEach((questionIdStr) => {
			const questionId = parseInt(questionIdStr);
			const question = exercise.questions.find((q) => q.id === questionId);
			if (question) {
				const parts = parseContentWithBlanks(question.content);
				const blanks = parts.filter((part) => part.type === 'blank');

				let questionAllCorrect = true;
				blanks.forEach((blank: any) => {
					const key = `${questionId}_${blank.index}`;
					const userAnswer = userAnswers[key] || '';
					if (!userAnswer.trim() || !checkAnswer(questionId, blank.index, userAnswer, blank.answer)) {
						questionAllCorrect = false;
					}
				});

				if (questionAllCorrect && blanks.length > 0) {
					actualCorrectAnswers++;
				}
			}
		});

		const score = Math.round((actualCorrectAnswers / totalQuestions) * 100);

		const result = {
			exerciseId: exercise.id,
			score: score,
			correctAnswers: actualCorrectAnswers,
			totalQuestions: totalQuestions,
			timeSpent: timeSpent,
			passed: score >= 70 && submittedQuestionsCount === totalQuestions, // Phải trả lời hết mới pass
			userAnswers: userAnswers,
		};

		console.log('🎯 Exercise completion:', {
			totalQuestions,
			submittedQuestionsCount,
			actualCorrectAnswers,
			score,
			passed: result.passed,
		});

		setExerciseCompleted(true);
		onComplete(result);

		toast({
			title: result.passed ? '🎉 Hoàn thành!' : '📚 Chưa đạt',
			description: `Bạn trả lời đúng ${actualCorrectAnswers}/${totalQuestions} câu (${score}%). ${
				submittedQuestionsCount < totalQuestions ? 'Vui lòng hoàn thành tất cả câu hỏi!' : ''
			}`,
		});
	};

	// Reset exercise
	const resetExercise = () => {
		setCurrentQuestionIndex(0);
		setUserAnswers({});
		setSubmittedAnswers({});
		setShowHints({});
		setExerciseCompleted(false);
	};

	// Render question content with blanks
	const renderQuestionContent = () => {
		const parts = parseContentWithBlanks(currentQuestion.content);

		return (
			<div className='text-lg leading-relaxed'>
				{parts.map((part: any, index: number) => {
					if (part.type === 'text') {
						return <span key={index}>{part.content}</span>;
					} else if (part.type === 'blank') {
						const key = `${currentQuestion.id}_${part.index}`;
						const userAnswer = userAnswers[key] || '';
						const isSubmitted = submittedAnswers[currentQuestion.id];
						const isCorrect =
							isSubmitted && checkAnswer(currentQuestion.id, part.index, userAnswer, part.answer);
						const isIncorrect = isSubmitted && userAnswer.trim() && !isCorrect;

						return (
							<span key={index} className='inline-block mx-1'>
								<Input
									value={userAnswer}
									onChange={(e) => handleInputChange(currentQuestion.id, part.index, e.target.value)}
									disabled={isSubmitted}
									className={`inline-block w-24 text-center ${
										isCorrect
											? 'border-green-500 bg-green-50 text-green-800'
											: isIncorrect
											? 'border-red-500 bg-red-50 text-red-800'
											: 'border-blue-300 focus:border-blue-500'
									}`}
									placeholder='?'
								/>
								{isSubmitted && (
									<span className='ml-1'>
										{isCorrect ? (
											<Check className='w-4 h-4 text-green-500 inline' />
										) : isIncorrect ? (
											<>
												<X className='w-4 h-4 text-red-500 inline' />
												<span className='text-xs text-green-600 ml-1'>({part.answer})</span>
											</>
										) : null}
									</span>
								)}
							</span>
						);
					}
					return null;
				})}
			</div>
		);
	};

	// Check if we have valid questions
	if (!exercise.questions || exercise.questions.length === 0) {
		return (
			<Card className={`${className}`}>
				<CardContent className='p-6 text-center'>
					<div className='text-gray-500'>
						<h3 className='text-lg font-medium mb-2'>Không có câu hỏi</h3>
						<p>Bài tập này chưa có câu hỏi nào.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (exerciseCompleted) {
		return (
			<Card className={`${className}`}>
				<CardContent className='p-6 text-center'>
					<div className='mb-4'>
						<Check className='w-16 h-16 text-green-500 mx-auto mb-4' />
						<h3 className='text-xl font-semibold text-green-700 mb-2'>🎉 Hoàn thành bài tập!</h3>
						<p className='text-gray-600'>Bạn đã hoàn thành bài tập điền từ vào chỗ trống.</p>
					</div>
					<div className='flex gap-2 justify-center'>
						<Button onClick={resetExercise} variant='secondary'>
							<RefreshCw className='w-4 h-4 mr-2' />
							Làm lại
						</Button>
						{onNext && <Button onClick={onNext}>Bài tiếp theo</Button>}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Exercise Header */}
			<div className='text-center'>
				<h2 className='text-2xl font-bold text-gray-800 mb-2'>{exercise.title}</h2>
				<p className='text-gray-600 mb-4'>{exercise.description}</p>
				<div className='flex justify-center items-center gap-4'>
					<Badge variant='secondary'>
						Câu {currentQuestionIndex + 1}/{exercise.questions.length}
					</Badge>
					<Badge variant='default'>📝 Điền từ vào chỗ trống</Badge>
				</div>
			</div>

			{/* Question Card */}
			<Card>
				<CardContent className='p-6'>
					<div className='space-y-4'>
						{/* Question Content */}
						<div className='p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
							{renderQuestionContent()}
						</div>

						{/* Hint */}
						{currentQuestion.hint && (
							<div className='space-y-2'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => toggleHint(currentQuestion.id)}
									className='text-amber-600 hover:text-amber-700'
								>
									<Lightbulb className='w-4 h-4 mr-2' />
									{showHints[currentQuestion.id] ? 'Ẩn gợi ý' : 'Hiển thị gợi ý'}
								</Button>
								{showHints[currentQuestion.id] && (
									<div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
										<p className='text-amber-800 text-sm'>💡 {currentQuestion.hint}</p>
									</div>
								)}
							</div>
						)}

						{/* Answer Explanation */}
						{submittedAnswers[currentQuestion.id] && currentQuestion.answerExplanation && (
							<div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
								<h4 className='font-medium text-gray-700 mb-2'>📚 Giải thích:</h4>
								<p className='text-gray-600 text-sm'>{currentQuestion.answerExplanation}</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className='flex justify-between items-center pt-4 border-t'>
							<div className='text-sm text-gray-500'>💎 Điểm: {currentQuestion.points}</div>
							<div className='flex gap-2'>
								{!submittedAnswers[currentQuestion.id] ? (
									<Button onClick={submitQuestion} className='bg-blue-600 hover:bg-blue-700'>
										Kiểm tra đáp án
									</Button>
								) : (
									<Button onClick={nextQuestion} className='bg-green-600 hover:bg-green-700'>
										{currentQuestionIndex < exercise.questions.length - 1
											? 'Câu tiếp theo →'
											: exercise.questions.every((q) => submittedAnswers[q.id])
											? 'Hoàn thành 🎉'
											: 'Kiểm tra tất cả câu'}
									</Button>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Progress */}
			<div className='w-full bg-gray-200 rounded-full h-3'>
				<div
					className='bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500'
					style={{
						width: `${((currentQuestionIndex + 1) / exercise.questions.length) * 100}%`,
					}}
				/>
			</div>
		</div>
	);
}
