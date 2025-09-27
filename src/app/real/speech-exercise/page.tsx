'use client';
import React, { useState } from 'react';
import SpeechExerciseComponent from '@/components/speech-exercise';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';

const RealSpeechExercisePage = () => {
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

	// Real exercises data (these will be fetched from database)
	const realExercises = [
		{
			id: 1,
			title: 'Basic Japanese Greeting - Hello',
			description: 'Practice pronouncing "hello" in Japanese',
			type: 'LISTENING' as const,
			targetText: 'こんにちは',
			targetAudioUrl: undefined,
			difficultyLevel: 'BEGINNER' as const,
			speechRecognitionLanguage: 'ja-JP',
			minimumAccuracyScore: 70,
		},
		{
			id: 2,
			title: 'Good Morning Greeting',
			description: 'Practice pronouncing "good morning" in Japanese',
			type: 'SPEAKING' as const,
			targetText: 'おはよう',
			targetAudioUrl: undefined,
			difficultyLevel: 'BEGINNER' as const,
			speechRecognitionLanguage: 'ja-JP',
			minimumAccuracyScore: 70,
		},
		{
			id: 3,
			title: 'Expressing Gratitude',
			description: 'Practice saying "thank you" in Japanese',
			type: 'PRONUNCIATION' as const,
			targetText: 'ありがとう',
			targetAudioUrl: undefined,
			difficultyLevel: 'ELEMENTARY' as const,
			speechRecognitionLanguage: 'ja-JP',
			minimumAccuracyScore: 75,
		},
		{
			id: 4,
			title: 'Farewell Expression',
			description: 'Practice saying "goodbye" in Japanese',
			type: 'SPEECH_RECOGNITION' as const,
			targetText: 'さようなら',
			targetAudioUrl: undefined,
			difficultyLevel: 'ELEMENTARY' as const,
			speechRecognitionLanguage: 'ja-JP',
			minimumAccuracyScore: 75,
		},
		{
			id: 5,
			title: 'Polite Expression',
			description: 'Practice saying "excuse me" in Japanese',
			type: 'LISTENING' as const,
			targetText: 'すみません',
			targetAudioUrl: undefined,
			difficultyLevel: 'INTERMEDIATE' as const,
			speechRecognitionLanguage: 'ja-JP',
			minimumAccuracyScore: 80,
		},
	];

	// Dictionary
	const dict = {
		learning: {
			exercise: 'Bài tập',
			question: 'Câu hỏi',
			hint: 'Gợi ý',
			correct: 'Chính xác!',
			incorrect: 'Chưa chính xác',
			completed: 'Hoàn thành',
			nextQuestion: 'Câu tiếp theo',
			previousQuestion: 'Câu trước',
		},
	};

	const currentExercise = realExercises[currentExerciseIndex];

	const handleComplete = (result: any) => {
		console.log('✅ Exercise completed and saved to database:', result);

		// Mark current exercise as completed
		setCompletedExercises((prev) => new Set([...Array.from(prev), currentExerciseIndex]));

		// Show completion message
		const message =
			`🎉 Bài tập hoàn thành và đã lưu vào database!\n\n` +
			`📊 Kết quả:\n` +
			`• Exercise ID: ${currentExercise.id}\n` +
			`• Văn bản mục tiêu: ${result.targetText}\n` +
			`• Bạn đã nói: ${result.recognizedText}\n` +
			`• Điểm chính xác: ${result.accuracyScore}%\n` +
			`• Độ tin cậy: ${result.confidenceScore}%\n` +
			`• Kết quả: ${result.isPassed ? '✅ Đạt' : '❌ Chưa đạt'}\n` +
			`• Lần thử: ${result.attemptNumber}\n` +
			`• Thời gian: ${result.timeSpentSeconds}s\n\n` +
			`💾 Kết quả đã được lưu vào database với ID: ${result.id || 'N/A'}`;

		alert(message);
	};

	const handleNext = () => {
		if (currentExerciseIndex < realExercises.length - 1) {
			setCurrentExerciseIndex(currentExerciseIndex + 1);
		} else {
			alert('🎉 Bạn đã hoàn thành tất cả bài tập!');
		}
	};

	const handlePrevious = () => {
		if (currentExerciseIndex > 0) {
			setCurrentExerciseIndex(currentExerciseIndex - 1);
		}
	};

	const resetProgress = () => {
		setCurrentExerciseIndex(0);
		setCompletedExercises(new Set());
	};

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='container mx-auto max-w-4xl px-4'>
				{/* Header */}
				<div className='mb-8 text-center'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						Real Speech Exercise - Database Integration
					</h1>
					<p className='text-gray-600'>Kết quả sẽ được lưu vào database thật</p>
				</div>

				{/* Database Connection Status */}
				<Alert className='mb-6 border-green-200 bg-green-50'>
					<Database className='h-4 w-4 text-green-600' />
					<AlertDescription className='text-green-800'>
						<strong>🔗 Real Mode:</strong> Kết nối với database - kết quả sẽ được lưu vĩnh viễn
					</AlertDescription>
				</Alert>

				{/* Progress Bar */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							<span>Tiến độ bài tập</span>
							<span className='text-sm font-normal'>
								{currentExerciseIndex + 1} / {realExercises.length}
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex space-x-2 mb-4'>
							{realExercises.map((_, index) => (
								<div
									key={index}
									className={`flex-1 h-3 rounded-full ${
										completedExercises.has(index)
											? 'bg-green-500'
											: index === currentExerciseIndex
											? 'bg-blue-500'
											: 'bg-gray-200'
									}`}
								/>
							))}
						</div>
						<div className='flex justify-between text-sm text-gray-600'>
							<span>Hoàn thành: {completedExercises.size}</span>
							<span>Còn lại: {realExercises.length - completedExercises.size}</span>
						</div>
					</CardContent>
				</Card>

				{/* Exercise Navigation */}
				<div className='flex justify-between items-center mb-6'>
					<Button variant='secondaryOutline' onClick={handlePrevious} disabled={currentExerciseIndex === 0}>
						← Bài trước
					</Button>

					<div className='text-center'>
						<h2 className='text-xl font-semibold text-gray-800'>
							Bài {currentExerciseIndex + 1}: {currentExercise.title}
						</h2>
						<p className='text-sm text-gray-600'>ID: {currentExercise.id}</p>
					</div>

					<Button
						variant='secondaryOutline'
						onClick={handleNext}
						disabled={currentExerciseIndex === realExercises.length - 1}
					>
						Bài tiếp theo →
					</Button>
				</div>

				{/* Main Exercise Component */}
				<div className='bg-white rounded-lg shadow-lg p-6'>
					<SpeechExerciseComponent
						exercise={currentExercise}
						onComplete={handleComplete}
						onNext={handleNext}
						dict={dict}
						demoMode={false} // THIS IS THE KEY - Real mode, not demo mode
					/>
				</div>

				{/* Instructions */}
				<div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
					<h2 className='text-lg font-semibold text-blue-900 mb-4'>🎯 Hướng dẫn:</h2>
					<div className='space-y-3 text-blue-800'>
						<p>
							<strong>1.</strong> Nhấn "Nghe phát âm" để nghe cách phát âm đúng
						</p>
						<p>
							<strong>2.</strong> Nhấn "Bắt đầu ghi âm" và nói từ trong bài
						</p>
						<p>
							<strong>3.</strong> Kết quả sẽ được lưu vào database với Exercise ID tương ứng
						</p>
						<p>
							<strong>4.</strong> Bạn có thể xem kết quả trong bảng speech_exercise_results
						</p>
					</div>
				</div>

				{/* Database Info */}
				<div className='mt-6 bg-green-50 border border-green-200 rounded-lg p-4'>
					<h3 className='text-md font-medium text-green-900 mb-2'>💾 Database Integration:</h3>
					<ul className='text-green-800 text-sm space-y-1'>
						<li>
							• Kết quả lưu vào bảng: <code>speech_exercise_results</code>
						</li>
						<li>• Exercise ID: {currentExercise.id}</li>
						<li>• User ID: sẽ được lấy từ session (cần đăng nhập)</li>
						<li>• Bao gồm: accuracy, confidence, audio file, thời gian</li>
					</ul>
				</div>

				{/* Reset Button */}
				<div className='mt-6 text-center'>
					<Button
						variant='secondaryOutline'
						onClick={resetProgress}
						className='bg-gray-100 hover:bg-gray-200'
					>
						<RotateCcw className='h-4 w-4 mr-2' />
						Reset tiến độ
					</Button>
				</div>
			</div>
		</div>
	);
};

export default RealSpeechExercisePage;
