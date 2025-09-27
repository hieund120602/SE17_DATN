'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Award,
	CheckCircle2,
	Clock,
	Database,
	MessageSquare,
	Mic,
	Target,
	TrendingUp,
	XCircle,
	Lightbulb,
} from 'lucide-react';

interface ResultModalProps {
	isOpen: boolean;
	onClose: () => void;
	result: {
		id?: number;
		exerciseId: number;
		targetText: string;
		recognizedText: string;
		accuracyScore: number;
		confidenceScore: number;
		isPassed: boolean;
		attemptNumber: number;
		timeSpentSeconds: number;
		pronunciationFeedback?: string;
	} | null;
	onNext?: () => void;
}

const ResultModal = ({ isOpen, onClose, result, onNext }: ResultModalProps) => {
	if (!result) return null;

	// Sửa lỗi hiển thị "Chưa đạt" khi điểm chính xác là 100%
	// Nếu điểm chính xác là 100%, luôn coi là đạt
	const isActuallyPassed = result.accuracyScore >= 100 ? true : result.isPassed;

	// Get color classes based on score values
	const getAccuracyColor = (score: number) => {
		if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-500' };
		if (score >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-500' };
		return { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-500' };
	};

	// Tạo nhận xét phát âm bằng tiếng Việt dựa trên điểm số
	const getVietnameseFeedback = (score: number, confidenceScore: number) => {
		if (score >= 95) {
			return 'Phát âm tuyệt vời! Bạn đã phát âm chính xác như người bản xứ.';
		} else if (score >= 90) {
			return 'Phát âm rất tốt! Chỉ còn một vài điểm nhỏ để hoàn thiện.';
		} else if (score >= 80) {
			return 'Phát âm tốt! Người nghe có thể hiểu bạn dễ dàng, nhưng vẫn còn chỗ để cải thiện.';
		} else if (score >= 70) {
			return 'Phát âm khá tốt. Hãy chú ý đến ngữ điệu và cách nhấn âm để hoàn thiện hơn nữa.';
		} else if (score >= 60) {
			return 'Phát âm chấp nhận được nhưng cần hoàn thiện. Hãy luyện tập thêm với từng âm tiết.';
		} else if (score >= 50) {
			return 'Phát âm còn nhiều chỗ cần hoàn thiện. Hãy nghe kỹ mẫu và tập lại từng từ một.';
		} else {
			return 'Phát âm cần được hoàn thiện nhiều. Hãy tập trung vào từng âm tiết và nghe mẫu nhiều lần.';
		}
	};

	// Thêm lời khuyên dựa trên độ tin cậy
	const getConfidenceTip = (confidenceScore: number) => {
		if (confidenceScore < 50) {
			return 'Bạn nên nói to và rõ ràng hơn để hệ thống nhận diện tốt hơn.';
		} else if (confidenceScore < 70) {
			return 'Hãy nói chậm và rõ ràng hơn để cải thiện độ nhận diện.';
		}
		return '';
	};

	// Gợi ý phát âm tiếng Nhật dựa trên từ mục tiêu
	const getJapanesePronunciationTip = (targetText: string) => {
		if (targetText.includes('こんにちは')) {
			return "Khi phát âm 'こんにちは' (konnichiwa), hãy nhấn nhẹ vào âm 'chi' và kết thúc với âm 'wa' nhẹ nhàng.";
		} else if (targetText.includes('ありがとう')) {
			return "Khi phát âm 'ありがとう' (arigatou), hãy chú ý đến ngữ điệu tăng dần và kéo dài âm 'ou' ở cuối.";
		} else if (targetText.includes('さようなら')) {
			return "Khi phát âm 'さようなら' (sayounara), hãy nhấn vào âm 'yo' và phát âm rõ ràng từng âm tiết.";
		} else if (targetText.includes('は')) {
			return "Chú ý rằng khi 'は' đứng một mình là 'ha', nhưng khi là trợ từ thì đọc là 'wa'.";
		} else if (targetText.includes('を')) {
			return "Trợ từ 'を' được phát âm là 'o', không phải 'wo' như cách viết romaji.";
		}
		return 'Hãy chú ý đến độ dài của các nguyên âm và nhấn âm đúng trong tiếng Nhật.';
	};

	const accuracyColor = getAccuracyColor(result.accuracyScore);
	const vietnameseFeedback = getVietnameseFeedback(result.accuracyScore, result.confidenceScore);
	const confidenceTip = getConfidenceTip(result.confidenceScore);
	const japaneseTip = getJapanesePronunciationTip(result.targetText);

	// Hiển thị lý do tại sao bài tập được đánh giá là đạt/chưa đạt
	const getPassFailReason = () => {
		if (isActuallyPassed) {
			return 'Bạn đã đạt điểm chính xác tối thiểu cần thiết. Chúc mừng!';
		} else {
			return 'Điểm chính xác chưa đạt mức tối thiểu yêu cầu. Hãy thử lại!';
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl !p-0 overflow-y-auto max-h-[90vh]'>
				<DialogHeader className='border-b p-4'>
					<div className='flex items-center space-x-2'>
						{isActuallyPassed ? (
							<CheckCircle2 className='h-6 w-6 text-green-500' />
						) : (
							<XCircle className='h-6 w-6 text-yellow-500' />
						)}
						<DialogTitle className='text-xl'>Kết quả</DialogTitle>
					</div>
				</DialogHeader>

				<div className='p-4 space-y-4'>
					{/* Database Saved Banner */}
					<div className='bg-blue-50 border border-blue-200 rounded-md p-2.5 flex items-center'>
						<Database className='h-5 w-5 text-blue-600 mr-2' />
						<div>
							<h4 className='text-blue-700 font-medium'>Kết quả đã lưu vào database</h4>
							<p className='text-blue-600 text-sm'>
								Exercise ID: {result.exerciseId} | ID: {result.id || 'N/A'}
							</p>
						</div>
					</div>

					{/* Nhận xét phát âm tiếng Việt */}
					<div className={`${accuracyColor.bg} rounded-lg border p-4`}>
						<div className='flex items-center mb-2'>
							<MessageSquare className={`h-5 w-5 mr-2 ${accuracyColor.icon}`} />
							<h3 className={`font-medium ${accuracyColor.text}`}>Nhận xét phát âm</h3>
						</div>
						<p className='text-gray-700'>{vietnameseFeedback}</p>
						{confidenceTip && <p className='text-gray-600 text-sm mt-2 italic'>{confidenceTip}</p>}
						<p className='text-gray-700 mt-2 font-medium'>{getPassFailReason()}</p>
					</div>

					{/* Gợi ý phát âm tiếng Nhật */}
					<div className='bg-amber-50 rounded-lg border border-amber-200 p-4'>
						<div className='flex items-center mb-2'>
							<Lightbulb className='h-5 w-5 mr-2 text-amber-600' />
							<h3 className='font-medium text-amber-700'>Gợi ý phát âm</h3>
						</div>
						<p className='text-gray-700'>{japaneseTip}</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{/* Accuracy Score */}
						<div className={`${accuracyColor.bg} p-4 rounded-lg border border-opacity-20`}>
							<div className='flex justify-between items-center mb-1.5'>
								<div className='flex items-center text-sm font-medium'>
									<Award className={`h-4 w-4 mr-1.5 ${accuracyColor.icon}`} />
									<span className={accuracyColor.text}>Điểm chính xác</span>
								</div>
								<Badge variant={isActuallyPassed ? 'default' : 'destructive'} className='text-xs'>
									{isActuallyPassed ? 'Đạt' : 'Chưa đạt'}
								</Badge>
							</div>
							<div className='text-2xl font-bold mt-1 mb-2'>{result.accuracyScore}%</div>
							<Progress value={result.accuracyScore} className='h-1.5' />
						</div>

						{/* Confidence Score */}
						<div className='bg-blue-50 p-4 rounded-lg border border-blue-100'>
							<div className='flex items-center mb-1.5 text-sm font-medium text-blue-700'>
								<TrendingUp className='h-4 w-4 mr-1.5 text-blue-600' />
								<span>Độ tin cậy</span>
							</div>
							<div className='text-2xl font-bold text-blue-700 mt-1 mb-2'>{result.confidenceScore}%</div>
							<Progress value={result.confidenceScore} className='h-1.5 bg-blue-100'>
								<div className='h-full bg-blue-500 rounded-full'></div>
							</Progress>
						</div>

						{/* Time & Attempt */}
						<div className='bg-purple-50 p-4 rounded-lg border border-purple-100'>
							<div className='flex items-center mb-1.5 text-sm font-medium text-purple-700'>
								<Clock className='h-4 w-4 mr-1.5 text-purple-600' />
								<span>Thời gian & Lần thử</span>
							</div>
							<div className='text-2xl font-bold text-purple-700 mt-1'>{result.timeSpentSeconds}s</div>
							<div className='text-sm text-purple-600 mt-1'>Lần thử thứ {result.attemptNumber}</div>
						</div>
					</div>

					{/* Text Comparison */}
					<div className='bg-gray-50 rounded-lg border p-4 space-y-4'>
						<div>
							<div className='flex items-center mb-2'>
								<Target className='h-4 w-4 mr-1.5 text-blue-600' />
								<h3 className='text-sm font-medium text-gray-700'>Văn bản mục tiêu:</h3>
							</div>
							<p className='text-lg font-japanese bg-white p-3 rounded border'>{result.targetText}</p>
						</div>

						<div>
							<div className='flex items-center mb-2'>
								<Mic className='h-4 w-4 mr-1.5 text-blue-600' />
								<h3 className='text-sm font-medium text-gray-700'>Bạn đã nói:</h3>
							</div>
							<p className='text-lg font-japanese bg-white p-3 rounded border'>{result.recognizedText}</p>
						</div>
					</div>

					{/* Feedback from backend if available */}
					{result.pronunciationFeedback && (
						<div className='bg-green-50 rounded-lg border border-green-200 p-4'>
							<div className='flex items-center mb-2'>
								<MessageSquare className='h-4 w-4 mr-1.5 text-green-600' />
								<h3 className='text-sm font-medium text-green-700'>Nhận xét từ máy chủ:</h3>
							</div>
							<p className='text-gray-700'>{result.pronunciationFeedback}</p>
						</div>
					)}

					<DialogFooter className='gap-2 sm:gap-0 pt-2'>
						<Button variant='superOutline' onClick={onClose}>
							Đóng
						</Button>
						{isActuallyPassed && onNext && (
							<Button
								onClick={() => {
									onClose();
									onNext();
								}}
							>
								<CheckCircle2 className='mr-2 h-4 w-4' />
								Tiếp tục
							</Button>
						)}
						{!isActuallyPassed && (
							<Button variant='secondary' onClick={onClose}>
								Thử lại
							</Button>
						)}
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ResultModal;
