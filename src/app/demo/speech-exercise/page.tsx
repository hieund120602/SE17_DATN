'use client';
import React from 'react';
import SpeechExerciseComponent from '@/components/speech-exercise';

const SpeechExerciseDemo = () => {
	// Demo exercise data
	const demoExercise = {
		id: 1,
		title: 'Bài tập phát âm Tiếng Nhật cơ bản',
		description: 'Luyện tập phát âm cơ bản với từ chào hỏi tiếng Nhật',
		type: 'LISTENING' as const,
		targetText: 'こんにちは',
		targetAudioUrl: undefined, // Will use speech synthesis
		difficultyLevel: 'BEGINNER' as const,
		speechRecognitionLanguage: 'ja-JP',
		minimumAccuracyScore: 70,
	};

	// Demo dictionary
	const demoDict = {
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

	const handleComplete = (result: any) => {
		console.log('✅ Demo Exercise completed (not saved to database):', result);

		// Show nice completion message
		const message =
			`🎉 Demo hoàn thành!\n\n` +
			`📊 Kết quả:\n` +
			`• Văn bản mục tiêu: ${result.targetText}\n` +
			`• Bạn đã nói: ${result.recognizedText}\n` +
			`• Điểm chính xác: ${result.accuracyScore}%\n` +
			`• Độ tin cậy: ${result.confidenceScore}%\n` +
			`• Kết quả: ${result.isPassed ? '✅ Đạt' : '❌ Chưa đạt'}\n` +
			`• Lần thử: ${result.attemptNumber}\n` +
			`• Thời gian: ${result.timeSpentSeconds}s\n\n` +
			`💡 Đây là demo - kết quả không được lưu vào database.`;

		alert(message);
	};

	const handleNext = () => {
		console.log('Next exercise');
		alert('Chuyển sang bài tập tiếp theo!');
	};

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='container mx-auto max-w-4xl px-4'>
				<div className='mb-8 text-center'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>Demo Speech Exercise Component</h1>
					<p className='text-gray-600'>Thử nghiệm component bài tập phát âm tiếng Nhật</p>
				</div>

				<div className='bg-white rounded-lg shadow-lg p-6'>
					<SpeechExerciseComponent
						exercise={demoExercise}
						onComplete={handleComplete}
						onNext={handleNext}
						dict={demoDict}
						demoMode={true}
					/>
				</div>

				<div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
					<h2 className='text-lg font-semibold text-blue-900 mb-4'>🎯 Hướng dẫn sử dụng:</h2>
					<div className='space-y-3 text-blue-800'>
						<p>
							<strong>1.</strong> Nhấn "Nghe phát âm" để nghe cách phát âm đúng
						</p>
						<p>
							<strong>2.</strong> Nhấn "Bắt đầu ghi âm" và nói từ "こんにちは"
						</p>
						<p>
							<strong>3.</strong> Hệ thống sẽ tự động chấm điểm và đưa ra phản hồi
						</p>
						<p>
							<strong>4.</strong> Cần đạt ít nhất 70% để qua bài
						</p>
					</div>
				</div>

				<div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
					<h3 className='text-md font-medium text-yellow-900 mb-2'>⚠️ Lưu ý:</h3>
					<ul className='text-yellow-800 text-sm space-y-1'>
						<li>• Cần cho phép truy cập microphone</li>
						<li>• Sử dụng Chrome/Edge để có trải nghiệm tốt nhất</li>
						<li>• Nói rõ ràng và gần microphone</li>
						<li>• Nếu không có audio mẫu, hệ thống sẽ dùng text-to-speech</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default SpeechExerciseDemo;
