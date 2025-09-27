'use client';
import React from 'react';
import SpeechExerciseComponent from '@/components/speech-exercise';

const FullSpeechExerciseDemo = () => {
	// Demo exercise with audio URL
	const demoExercise = {
		id: 1,
		title: 'Bài tập phát âm tiếng Nhật - Chào hỏi cơ bản',
		description: 'Luyện tập phát âm với từ chào hỏi phổ biến nhất trong tiếng Nhật',
		type: 'LISTENING' as const,
		targetText: 'こんにちは',
		targetAudioUrl: undefined, // Will use text-to-speech
		difficultyLevel: 'BEGINNER' as const,
		speechRecognitionLanguage: 'ja-JP',
		minimumAccuracyScore: 75,
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
		console.log('Exercise completed:', result);

		// Create detailed result message
		const resultMessage = `
🎯 Bài tập hoàn thành!

📊 Kết quả:
• Điểm chính xác: ${result.accuracyScore}%
• Độ tin cậy: ${result.confidenceScore}%
• Thời gian: ${result.timeSpentSeconds}s
• Lần thử: ${result.attemptNumber}

📝 Chi tiết:
• Văn bản mục tiêu: "${result.targetText}"
• Bạn đã nói: "${result.recognizedText}"

🏆 Kết quả: ${result.isPassed ? '✅ ĐẠT' : '❌ CHƯA ĐẠT'}

${result.pronunciationFeedback ? `💬 Phản hồi: ${result.pronunciationFeedback}` : ''}
    `;

		alert(resultMessage);
	};

	const handleNext = () => {
		console.log('Next exercise');
		alert('🎉 Tuyệt vời! Chuyển sang bài tập tiếp theo!');
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8'>
			<div className='container mx-auto max-w-5xl px-4'>
				{/* Header */}
				<div className='mb-8 text-center'>
					<h1 className='text-4xl font-bold text-gray-900 mb-3'>🎤 Speech Exercise - Full Feature Demo</h1>
					<p className='text-xl text-gray-600 mb-2'>
						Hệ thống bài tập phát âm tiếng Nhật với tính năng ghi âm và phát lại
					</p>
					<div className='inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
						🚀 Version 2.0 - Với Audio Recording & Playback
					</div>
				</div>

				{/* Main Demo */}
				<div className='bg-white rounded-xl shadow-xl p-8 mb-8'>
					<SpeechExerciseComponent
						exercise={demoExercise}
						onComplete={handleComplete}
						onNext={handleNext}
						dict={demoDict}
					/>
				</div>

				{/* Feature Highlights */}
				<div className='grid md:grid-cols-2 gap-6 mb-8'>
					<div className='bg-white rounded-lg shadow-lg p-6'>
						<div className='flex items-center mb-4'>
							<div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>🔊</div>
							<h3 className='text-lg font-semibold text-gray-900 ml-3'>Audio Phát Âm Mẫu</h3>
						</div>
						<ul className='space-y-2 text-gray-600'>
							<li>✅ Text-to-Speech tự động cho tiếng Nhật</li>
							<li>✅ Hỗ trợ audio file từ tutor (nếu có)</li>
							<li>✅ Điều khiển phát/dừng</li>
							<li>✅ Fallback thông minh khi lỗi</li>
						</ul>
					</div>

					<div className='bg-white rounded-lg shadow-lg p-6'>
						<div className='flex items-center mb-4'>
							<div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>🎤</div>
							<h3 className='text-lg font-semibold text-gray-900 ml-3'>Ghi Âm Giọng Nói</h3>
						</div>
						<ul className='space-y-2 text-gray-600'>
							<li>✅ Ghi âm real-time với MediaRecorder</li>
							<li>✅ Tự động lưu khi hoàn thành</li>
							<li>✅ Phát lại giọng nói của học viên</li>
							<li>✅ So sánh với phát âm mẫu</li>
						</ul>
					</div>
				</div>

				{/* Instructions */}
				<div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6'>
					<h2 className='text-xl font-semibold text-blue-900 mb-4 flex items-center'>
						🎯 Hướng dẫn sử dụng chi tiết:
					</h2>
					<div className='grid md:grid-cols-2 gap-6'>
						<div className='space-y-3'>
							<h3 className='font-semibold text-blue-800'>Bước 1-3: Nghe & Ghi âm</h3>
							<ol className='list-decimal list-inside space-y-2 text-blue-700'>
								<li>
									Nhấn <strong>"Nghe phát âm"</strong> để nghe phát âm mẫu
								</li>
								<li>
									Nhấn <strong>"Bắt đầu ghi âm"</strong> (cho phép microphone)
								</li>
								<li>
									Nói rõ ràng từ <strong>"こんにちは"</strong>
								</li>
							</ol>
						</div>
						<div className='space-y-3'>
							<h3 className='font-semibold text-blue-800'>Bước 4-6: Kết quả & Phát lại</h3>
							<ol className='list-decimal list-inside space-y-2 text-blue-700' start={4}>
								<li>Xem kết quả chấm điểm tự động</li>
								<li>
									Nhấn <strong>"Nghe lại giọng nói của bạn"</strong>
								</li>
								<li>So sánh với phát âm mẫu</li>
							</ol>
						</div>
					</div>
				</div>

				{/* Technical Notes */}
				<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6'>
					<h3 className='text-lg font-medium text-yellow-900 mb-3 flex items-center'>
						⚙️ Cải tiến kỹ thuật:
					</h3>
					<div className='grid md:grid-cols-2 gap-4'>
						<div>
							<h4 className='font-semibold text-yellow-800 mb-2'>Audio System:</h4>
							<ul className='text-yellow-700 text-sm space-y-1'>
								<li>• MediaRecorder API cho ghi âm chất lượng cao</li>
								<li>• Audio Blob storage & URL object creation</li>
								<li>• Dual audio refs (target + student)</li>
								<li>• Proper cleanup & memory management</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold text-yellow-800 mb-2'>Speech Recognition:</h4>
							<ul className='text-yellow-700 text-sm space-y-1'>
								<li>• Synchronized recording + recognition</li>
								<li>• Enhanced error handling</li>
								<li>• Japanese language optimization</li>
								<li>• Confidence score tracking</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Browser Compatibility */}
				<div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
					<h3 className='text-lg font-medium text-gray-900 mb-3'>🌐 Khuyến nghị trình duyệt:</h3>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
						<div className='p-3 bg-green-100 rounded-lg'>
							<div className='text-2xl mb-1'>🟢</div>
							<div className='font-semibold text-green-800'>Chrome</div>
							<div className='text-xs text-green-600'>Tất cả tính năng</div>
						</div>
						<div className='p-3 bg-green-100 rounded-lg'>
							<div className='text-2xl mb-1'>🟢</div>
							<div className='font-semibold text-green-800'>Edge</div>
							<div className='text-xs text-green-600'>Tất cả tính năng</div>
						</div>
						<div className='p-3 bg-yellow-100 rounded-lg'>
							<div className='text-2xl mb-1'>🟡</div>
							<div className='font-semibold text-yellow-800'>Firefox</div>
							<div className='text-xs text-yellow-600'>Ghi âm only</div>
						</div>
						<div className='p-3 bg-yellow-100 rounded-lg'>
							<div className='text-2xl mb-1'>🟡</div>
							<div className='font-semibold text-yellow-800'>Safari</div>
							<div className='text-xs text-yellow-600'>Hạn chế</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FullSpeechExerciseDemo;
