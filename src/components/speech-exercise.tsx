'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Mic,
	MicOff,
	Play,
	Pause,
	Volume2,
	VolumeX,
	RotateCcw,
	CheckCircle,
	XCircle,
	Loader2,
	MessageSquare,
	Award,
	TrendingUp,
	Target,
	Clock,
	Repeat,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechExerciseService, {
	SpeechExerciseResult as BackendSpeechExerciseResult,
} from '@/services/speech-exercise-service';

// Types for Speech Exercise
interface SpeechExercise {
	id: number;
	title: string;
	description: string;
	type: 'LISTENING' | 'SPEAKING' | 'SPEECH_RECOGNITION' | 'PRONUNCIATION';
	targetText: string;
	targetAudioUrl?: string;
	difficultyLevel: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
	speechRecognitionLanguage: string;
	minimumAccuracyScore: number;
}

// Type guards
const isListeningExercise = (type: string): type is 'LISTENING' => type === 'LISTENING';
const isVoiceExercise = (type: string): boolean =>
	type === 'SPEAKING' || type === 'PRONUNCIATION' || type === 'SPEECH_RECOGNITION';

interface SpeechExerciseResult {
	id?: number;
	targetText: string;
	recognizedText: string;
	accuracyScore: number;
	confidenceScore: number;
	pronunciationFeedback?: string;
	isPassed: boolean;
	attemptNumber: number;
	timeSpentSeconds: number;
}

interface SpeechExerciseComponentProps {
	exercise: SpeechExercise;
	onComplete?: (result: SpeechExerciseResult) => void;
	onNext?: () => void;
	dict: any;
	demoMode?: boolean; // Add demo mode prop
}

// Web Speech API types
declare global {
	interface Window {
		webkitSpeechRecognition: any;
		SpeechRecognition: any;
	}
}

const SpeechExerciseComponent: React.FC<SpeechExerciseComponentProps> = ({
	exercise,
	onComplete,
	onNext,
	dict,
	demoMode = false,
}) => {
	// States
	const [isListening, setIsListening] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPlayingStudent, setIsPlayingStudent] = useState(false);
	const [recognizedText, setRecognizedText] = useState('');
	const [confidenceScore, setConfidenceScore] = useState(0);
	const [result, setResult] = useState<SpeechExerciseResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [startTime, setStartTime] = useState<Date | null>(null);
	const [attemptNumber, setAttemptNumber] = useState(1);
	const [isProcessing, setIsProcessing] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // For listening multiple choice
	const [listeningOptions, setListeningOptions] = useState<string[]>([]); // Options for listening exercises

	// Refs
	const recognitionRef = useRef<any>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	const studentAudioRef = useRef<HTMLAudioElement>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const startTimeRef = useRef<Date | null>(null);

	// Generate listening options if needed
	useEffect(() => {
		if (isListeningExercise(exercise.type)) {
			// Generate options for listening exercise if they don't exist
			// This would be better coming from backend but we'll generate some here for now
			const correctOption = exercise.targetText;

			// Create 3 wrong options by shuffling characters or using predefined options
			const generateWrongOption = (correct: string) => {
				// Simplified - in real app you'd want more sophisticated options
				return correct
					.split('')
					.sort(() => Math.random() - 0.5)
					.join('');
			};

			const wrongOptions = [
				generateWrongOption(correctOption),
				generateWrongOption(correctOption),
				generateWrongOption(correctOption),
			];

			// Combine and shuffle options
			const allOptions = [correctOption, ...wrongOptions];
			setListeningOptions(allOptions.sort(() => Math.random() - 0.5));
		}
	}, [exercise.type, exercise.targetText]);

	// Initialize Speech Recognition and Media Recorder
	useEffect(() => {
		let isMounted = true;

		if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
			setError('Trình duyệt của bạn không hỗ trợ Speech Recognition API. Vui lòng sử dụng Chrome hoặc Edge.');
			return;
		}

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new SpeechRecognition();

		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.lang = exercise.speechRecognitionLanguage || 'ja-JP';
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			if (!isMounted) return;
			setIsListening(true);
			setError(null);
			if (!startTimeRef.current) {
				startTimeRef.current = new Date();
				setStartTime(new Date());
			}
		};

		recognition.onresult = (event: any) => {
			if (!isMounted) return;

			const transcript = event.results[0][0].transcript;
			const confidence = event.results[0][0].confidence;

			setRecognizedText(transcript);

			// Handle confidence score - Web Speech API sometimes returns 0 or undefined
			let confidenceValue = 0;
			if (confidence !== undefined && confidence !== null && confidence > 0) {
				confidenceValue = Math.round(confidence * 100);
			} else {
				// Fallback: estimate confidence based on speech recognition success
				// If we got a transcript, assume reasonable confidence
				confidenceValue = transcript && transcript.trim().length > 0 ? 75 : 0;
			}

			setConfidenceScore(confidenceValue);
			setIsListening(false);

			console.log(`🎤 Speech Recognition Result:`, {
				transcript,
				originalConfidence: confidence,
				finalConfidence: confidenceValue,
			});

			// Stop recording when speech recognition ends
			if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
				mediaRecorderRef.current.stop();
			}
		};

		recognition.onerror = (event: any) => {
			if (!isMounted) return;

			setIsListening(false);
			let errorMessage = 'Có lỗi xảy ra khi nhận diện giọng nói.';

			switch (event.error) {
				case 'no-speech':
					errorMessage = 'Không phát hiện giọng nói. Vui lòng thử lại.';
					break;
				case 'audio-capture':
					errorMessage = 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.';
					break;
				case 'not-allowed':
					errorMessage = 'Quyền truy cập microphone bị từ chối. Vui lòng cho phép truy cập microphone.';
					break;
				case 'network':
					errorMessage = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
					break;
			}

			setError(errorMessage);

			// Stop recording on error
			if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
				mediaRecorderRef.current.stop();
			}
		};

		recognition.onend = () => {
			if (!isMounted) return;
			setIsListening(false);
		};

		recognitionRef.current = recognition;

		// Setup Media Recorder
		const setupMediaRecorder = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				const mediaRecorder = new MediaRecorder(stream);

				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						audioChunksRef.current.push(event.data);
					}
				};

				mediaRecorder.onstop = () => {
					if (!isMounted) return;

					// Create audio blob using the correct MIME type (audio/webm instead of audio/wav)
					// This fixes the "Invalid image file" error
					const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
					const newAudioUrl = URL.createObjectURL(audioBlob);
					setAudioBlob(audioBlob);
					setAudioUrl(newAudioUrl);
					audioChunksRef.current = [];
				};

				mediaRecorderRef.current = mediaRecorder;
			} catch (error) {
				console.error('Error setting up media recorder:', error);
				if (isMounted) {
					setError('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
				}
			}
		};

		setupMediaRecorder();

		return () => {
			isMounted = false;

			// Clean up speech recognition
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort();
					recognitionRef.current = null;
				} catch (error) {
					console.warn('Error cleaning up speech recognition:', error);
				}
			}

			// Clean up media recorder
			if (mediaRecorderRef.current) {
				try {
					if (mediaRecorderRef.current.state === 'recording') {
						mediaRecorderRef.current.stop();
					}
					mediaRecorderRef.current = null;
				} catch (error) {
					console.warn('Error cleaning up media recorder:', error);
				}
			}
		};
	}, [exercise.speechRecognitionLanguage]);

	// Separate effect to clean up audio URL
	useEffect(() => {
		return () => {
			if (audioUrl) {
				try {
					URL.revokeObjectURL(audioUrl);
				} catch (error) {
					console.warn('Error revoking audio URL:', error);
				}
			}
		};
	}, [audioUrl]);

	// Submit exercise result
	const submitExercise = useCallback(async () => {
		if (isListeningExercise(exercise.type) && !selectedAnswer) {
			setError('Vui lòng chọn một phương án trả lời');
			return;
		}

		if (isVoiceExercise(exercise.type) && !recognizedText) {
			setError('Vui lòng ghi âm giọng nói trước khi nộp bài');
			return;
		}

		if (!startTimeRef.current) {
			startTimeRef.current = new Date();
		}

		setIsProcessing(true);

		try {
			const timeSpent = Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000);

			// Debug logging
			console.log('🔍 Submitting speech exercise:', {
				exerciseId: exercise.id,
				exerciseType: exercise.type,
				exerciseTitle: exercise.title,
				recognizedText: isListeningExercise(exercise.type) ? selectedAnswer : recognizedText,
				confidenceScore,
				timeSpent,
			});

			// For listening exercise, check if selected answer matches target text
			const isListeningCorrect = isListeningExercise(exercise.type) && selectedAnswer === exercise.targetText;

			// Prepare submission data for backend
			const submissionData = {
				recognizedText: isListeningExercise(exercise.type) ? selectedAnswer || '' : recognizedText || '',
				confidenceScore: confidenceScore / 100, // Convert to 0-1 scale
				timeSpentSeconds: timeSpent,
			};

			let exerciseResult: SpeechExerciseResult;

			if (demoMode) {
				// Demo mode: calculate locally, don't submit to backend
				console.log('🎭 Demo Mode: Calculating result locally (not submitting to database)');

				let accuracy = 0;

				if (isListeningExercise(exercise.type)) {
					// For listening, it's either 100% or 0%
					accuracy = isListeningCorrect ? 100 : 0;
				} else {
					// For other types, use Levenshtein calculation
					accuracy = calculateAccuracyScore(exercise.targetText, recognizedText || '');
				}

				const isPassed = accuracy >= exercise.minimumAccuracyScore;

				exerciseResult = {
					targetText: exercise.targetText,
					recognizedText: isListeningExercise(exercise.type) ? selectedAnswer || '' : recognizedText || '',
					accuracyScore: accuracy,
					confidenceScore,
					pronunciationFeedback: isPassed
						? 'Xuất sắc! Phát âm của bạn rất chính xác.'
						: 'Kết quả. Hãy lắng nghe kỹ hơn và thực hành thêm.',
					isPassed,
					attemptNumber,
					timeSpentSeconds: timeSpent,
				};
			} else {
				// Real mode: submit to backend API
				let backendResult: BackendSpeechExerciseResult;

				if (audioBlob && !isListeningExercise(exercise.type)) {
					// Submit with audio if available (for non-listening exercises)
					// Create the audio file with proper naming and MIME type
					// The name must end with .webm and the type must be audio/webm
					const audioFile = new File([audioBlob], `speech-${exercise.id}-${Date.now()}.webm`, {
						type: 'audio/webm',
						lastModified: Date.now(),
					});

					backendResult = await SpeechExerciseService.submitSpeechExerciseWithAudio(exercise.id, {
						recognizedText: isListeningExercise(exercise.type)
							? selectedAnswer || ''
							: recognizedText || '',
						confidenceScore: confidenceScore / 100,
						timeSpentSeconds: timeSpent,
						audioFile,
					});
				} else {
					// Submit without audio
					backendResult = await SpeechExerciseService.submitSpeechExercise(exercise.id, submissionData);
				}

				// Use backend result (which includes proper accuracy calculation and feedback)
				exerciseResult = {
					id: backendResult.id,
					targetText: backendResult.targetText,
					recognizedText: backendResult.recognizedText,
					accuracyScore: backendResult.accuracyScore,
					confidenceScore: backendResult.confidenceScore,
					pronunciationFeedback:
						backendResult.pronunciationFeedback ||
						(backendResult.isPass
							? 'Xuất sắc! Phát âm của bạn rất chính xác.'
							: 'Kết quả. Hãy lắng nghe kỹ hơn và thực hành thêm.'),
					isPassed: backendResult.isPass, // Map isPass to isPassed
					attemptNumber: backendResult.attemptNumber,
					timeSpentSeconds: backendResult.timeSpentSeconds,
				};

				console.log('✅ Speech exercise result saved to database:', backendResult);
			}

			setResult(exerciseResult);

			// Call parent callback
			if (onComplete) {
				onComplete(exerciseResult);
			}
		} catch (error: any) {
			console.error('❌ Error submitting exercise to database:', error);

			// Enhanced error handling with specific messages
			let errorMessage = 'Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.';

			if (error.response) {
				// Server responded with error status
				const status = error.response.status;
				const data = error.response.data;

				console.error('🔴 API Error Response:', {
					status,
					data,
					url: error.config?.url,
				});

				switch (status) {
					case 401:
						errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
						break;
					case 403:
						errorMessage = 'Không có quyền thực hiện thao tác này.';
						break;
					case 404:
						errorMessage = 'Không tìm thấy bài tập. Vui lòng kiểm tra lại.';
						break;
					case 500:
						errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
						break;
					default:
						errorMessage = `Lỗi ${status}: ${data?.message || 'Không thể lưu kết quả'}`;
				}
			} else if (error.request) {
				// Network error - no response received
				console.error('🔴 Network Error:', error.request);
				errorMessage = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.';
			} else {
				// Something else happened
				console.error('🔴 Unexpected Error:', error.message);
				errorMessage = `Lỗi không xác định: ${error.message}`;
			}

			setError(errorMessage);
		} finally {
			setIsProcessing(false);
		}
	}, [recognizedText, selectedAnswer, confidenceScore, attemptNumber, exercise, onComplete, audioBlob, demoMode]);

	// Submit exercise result when recognized text changes
	useEffect(() => {
		let isMounted = true;

		if (recognizedText && !result && startTimeRef.current && isVoiceExercise(exercise.type)) {
			// Add small delay to ensure confidence score is set
			const submitTimer = setTimeout(() => {
				if (isMounted) {
					submitExercise();
				}
			}, 500);

			return () => {
				isMounted = false;
				clearTimeout(submitTimer);
			};
		}

		return () => {
			isMounted = false;
		};
	}, [recognizedText, exercise.type, result, submitExercise]);

	// Start/Stop listening
	const toggleListening = useCallback(() => {
		if (!recognitionRef.current || !mediaRecorderRef.current) return;

		if (isListening) {
			recognitionRef.current.stop();
			if (mediaRecorderRef.current.state === 'recording') {
				mediaRecorderRef.current.stop();
			}
		} else {
			if (!hasStarted) {
				setHasStarted(true);
			}
			setError(null);

			// Start recording
			if (mediaRecorderRef.current.state === 'inactive') {
				audioChunksRef.current = [];
				mediaRecorderRef.current.start();
			}

			// Start speech recognition
			recognitionRef.current.start();
		}
	}, [isListening, hasStarted]);

	// Play target audio
	const playTargetAudio = useCallback(() => {
		if (exercise.targetAudioUrl && audioRef.current) {
			audioRef.current.play().catch((error) => {
				console.error('Error playing target audio:', error);
				// Fallback to speech synthesis
				playTextToSpeech();
			});
		} else {
			playTextToSpeech();
		}
	}, [exercise.targetText, exercise.speechRecognitionLanguage, exercise.targetAudioUrl]);

	// Text-to-speech fallback
	const playTextToSpeech = useCallback(() => {
		if ('speechSynthesis' in window) {
			// Stop any ongoing speech
			speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(exercise.targetText);
			utterance.lang = exercise.speechRecognitionLanguage || 'ja-JP';
			utterance.rate = 0.7;
			utterance.pitch = 1;
			utterance.volume = 1;

			utterance.onstart = () => setIsPlaying(true);
			utterance.onend = () => setIsPlaying(false);
			utterance.onerror = () => {
				setIsPlaying(false);
				setError('Không thể phát audio. Vui lòng thử lại.');
			};

			speechSynthesis.speak(utterance);
		} else {
			setError('Trình duyệt không hỗ trợ phát âm thanh.');
		}
	}, [exercise.targetText, exercise.speechRecognitionLanguage]);

	// Play student's recorded audio
	const playStudentAudio = useCallback(() => {
		if (audioUrl && studentAudioRef.current) {
			studentAudioRef.current.play().catch((error) => {
				console.error('Error playing student audio:', error);
				setError('Không thể phát lại ghi âm của bạn.');
			});
		}
	}, [audioUrl]);

	// Calculate accuracy score using Levenshtein distance
	const calculateAccuracyScore = (target: string, recognized: string): number => {
		// Validate inputs
		if (!target || !recognized) return 0;

		// Normalize Japanese text
		const normalizeJapaneseText = (text: string): string => {
			return text
				.trim()
				.replace(/\s+/g, '') // Remove all whitespace
				.replace(/[。、！？]/g, '') // Remove Japanese punctuation
				.toLowerCase(); // Convert to lowercase
		};

		const targetClean = normalizeJapaneseText(target);
		const recognizedClean = normalizeJapaneseText(recognized);

		// Exact match gets 100%
		if (targetClean === recognizedClean) return 100;

		// If completely different languages/scripts, return 0
		const isJapanese = (text: string) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
		const targetIsJapanese = isJapanese(targetClean);
		const recognizedIsJapanese = isJapanese(recognizedClean);

		// If target is Japanese but recognized is not (or vice versa), penalize heavily
		if (targetIsJapanese !== recognizedIsJapanese) {
			return Math.max(0, 100 - 70); // Maximum 30% for wrong language
		}

		// Calculate Levenshtein distance
		const levenshteinDistance = (s1: string, s2: string): number => {
			const dp: number[][] = Array(s1.length + 1)
				.fill(null)
				.map(() => Array(s2.length + 1).fill(0));

			for (let i = 0; i <= s1.length; i++) {
				for (let j = 0; j <= s2.length; j++) {
					if (i === 0) {
						dp[i][j] = j;
					} else if (j === 0) {
						dp[i][j] = i;
					} else {
						const cost = s1.charAt(i - 1) !== s2.charAt(j - 1) ? 1 : 0;
						dp[i][j] = Math.min(
							dp[i - 1][j] + 1, // deletion
							dp[i][j - 1] + 1, // insertion
							dp[i - 1][j - 1] + cost // substitution
						);
					}
				}
			}
			return dp[s1.length][s2.length];
		};

		const distance = levenshteinDistance(targetClean, recognizedClean);
		const maxLength = Math.max(targetClean.length, recognizedClean.length);

		if (maxLength === 0) return 100;

		// Convert to accuracy percentage
		const accuracy = Math.max(0, (1 - distance / maxLength) * 100);

		// Apply additional penalties for very different texts
		const lengthDifference = Math.abs(targetClean.length - recognizedClean.length);
		const lengthPenalty = Math.min(20, lengthDifference * 2); // Max 20% penalty

		return Math.max(0, Math.round(accuracy - lengthPenalty));
	};

	// Reset exercise
	const resetExercise = () => {
		setRecognizedText('');
		setConfidenceScore(0);
		setResult(null);
		setError(null);
		setAttemptNumber((prev) => prev + 1);
		startTimeRef.current = null;
		setStartTime(null);
		setHasStarted(false);

		// Clear audio recordings
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
		setAudioBlob(null);
		setAudioUrl(null);
		audioChunksRef.current = [];

		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
		}
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
			mediaRecorderRef.current.stop();
		}
	};

	// Get difficulty color
	const getDifficultyColor = (level: string) => {
		switch (level) {
			case 'BEGINNER':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'ELEMENTARY':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'INTERMEDIATE':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'ADVANCED':
				return 'bg-orange-100 text-orange-700 border-orange-200';
			case 'EXPERT':
				return 'bg-red-100 text-red-700 border-red-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	// Get accuracy color
	const getAccuracyColor = (score: number) => {
		if (score >= 90) return 'text-green-600';
		if (score >= 70) return 'text-yellow-600';
		return 'text-red-600';
	};

	// Audio event handlers
	const handleAudioPlay = () => setIsPlaying(true);
	const handleAudioPause = () => setIsPlaying(false);
	const handleAudioEnded = () => setIsPlaying(false);

	// Student audio event handlers
	const handleStudentAudioPlay = () => setIsPlayingStudent(true);
	const handleStudentAudioPause = () => setIsPlayingStudent(false);
	const handleStudentAudioEnded = () => setIsPlayingStudent(false);

	// Get exercise type-specific instructions
	const getExerciseInstructions = () => {
		switch (exercise.type) {
			case 'LISTENING':
				return 'Hãy nghe và chọn câu bạn vừa nghe:';
			case 'SPEAKING':
				return 'Hãy đọc to câu sau:';
			case 'PRONUNCIATION':
				return 'Hãy luyện phát âm câu sau:';
			case 'SPEECH_RECOGNITION':
				return 'Hãy nghe và nhận dạng câu sau:';
			default:
				return 'Hãy hoàn thành bài tập:';
		}
	};

	// Get exercise type-specific hints
	const getExerciseHints = () => {
		switch (exercise.type) {
			case 'LISTENING':
				return 'Nhấn nút "Nghe" để nghe phát âm mẫu, sau đó chọn câu bạn vừa nghe.';
			case 'SPEAKING':
				return 'Nhấn nút "Ghi âm" và đọc to văn bản dưới đây.';
			case 'PRONUNCIATION':
				return 'Nghe mẫu rồi luyện đọc đúng giọng điệu và nhấn "Ghi âm".';
			case 'SPEECH_RECOGNITION':
				return 'Nghe rồi nhắc lại chính xác nội dung bạn đã nghe.';
			default:
				return 'Nhấn nút "Ghi âm" và đọc to văn bản dưới đây.';
		}
	};

	return (
		<div className='space-y-6'>
			{/* Demo Mode Indicator */}
			{demoMode && (
				<Alert className='border-yellow-200 bg-yellow-50'>
					<div className='flex items-center space-x-2'>
						<span className='text-2xl'>🎭</span>
						<div>
							<h4 className='text-yellow-800 font-semibold'>Demo Mode</h4>
							<p className='text-yellow-700 text-sm'>
								Kết quả sẽ không được lưu vào database. Đây chỉ là chế độ thử nghiệm.
							</p>
						</div>
					</div>
				</Alert>
			)}

			{/* Exercise Header */}
			<Card className='border-l-4 border-l-blue-500'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center space-x-2'>
							<Target className='h-5 w-5 text-blue-600' />
							<span>{exercise.title}</span>
						</CardTitle>
						<Badge className={getDifficultyColor(exercise.difficultyLevel)}>
							{exercise.difficultyLevel}
						</Badge>
					</div>
					<p className='text-gray-600'>{exercise.description}</p>
				</CardHeader>
			</Card>

			{/* Error Alert */}
			{error && (
				<Alert className='border-red-200 bg-red-50'>
					<XCircle className='h-4 w-4' />
					<AlertDescription className='text-red-800'>{error}</AlertDescription>
				</Alert>
			)}

			{/* Main Exercise Interface */}
			{!result && (
				<Card>
					<CardContent className='pt-6'>
						<div className='text-center space-y-6'>
							{/* Instructions */}
							<div className='mb-6'>
								<h3 className='text-lg font-semibold text-gray-700 mb-2'>
									{getExerciseInstructions()}
								</h3>
								<p className='text-sm text-gray-500'>{getExerciseHints()}</p>
							</div>

							{/* Target Text Display - Hidden for LISTENING exercises */}
							{!isListeningExercise(exercise.type) && (
								<div className='bg-blue-50 p-8 rounded-lg border-2 border-blue-200'>
									<div className='text-4xl font-bold text-blue-900 mb-4 font-japanese'>
										{exercise.targetText}
									</div>
								</div>
							)}

							{/* Play Audio Button */}
							{(isListeningExercise(exercise.type) ||
								exercise.type === 'PRONUNCIATION' ||
								exercise.type === 'SPEECH_RECOGNITION') && (
								<Button
									variant='superOutline'
									size='lg'
									onClick={playTargetAudio}
									disabled={isPlaying}
									className='mx-2'
								>
									{isPlaying ? (
										<>
											<Volume2 className='h-5 w-5 mr-2' />
											Đang phát...
										</>
									) : (
										<>
											<Play className='h-5 w-5 mr-2' />
											Nghe phát âm
										</>
									)}
								</Button>
							)}

							{/* Listening Exercise Multiple Choice Interface */}
							{isListeningExercise(exercise.type) && (
								<div className='space-y-4 mt-6'>
									<h4 className='text-md font-medium text-gray-700'>Chọn câu bạn vừa nghe:</h4>
									<div className='grid grid-cols-1 gap-3'>
										{listeningOptions.map((option, index) => (
											<Button
												key={index}
												variant={selectedAnswer === option ? 'default' : 'superOutline'}
												className={`justify-start p-4 h-auto text-left ${
													selectedAnswer === option ? 'bg-blue-500 text-white' : ''
												}`}
												onClick={() => setSelectedAnswer(option)}
											>
												<span className='text-lg font-japanese'>{option}</span>
											</Button>
										))}
									</div>
									<Button
										size='lg'
										onClick={submitExercise}
										disabled={isProcessing || !selectedAnswer}
										className='mt-4 bg-green-600 hover:bg-green-700'
									>
										{isProcessing ? (
											<>
												<Loader2 className='h-5 w-5 mr-2 animate-spin' />
												Đang xử lý...
											</>
										) : (
											<>
												<CheckCircle className='h-5 w-5 mr-2' />
												Nộp bài
											</>
										)}
									</Button>
								</div>
							)}

							{/* Speech Recognition Interface - for SPEAKING, PRONUNCIATION, SPEECH_RECOGNITION */}
							{isVoiceExercise(exercise.type) && (
								<div className='space-y-4'>
									<Button
										size='lg'
										onClick={toggleListening}
										disabled={isProcessing}
										className={`px-8 py-4 text-lg text-white ${
											isListening
												? 'bg-red-500 hover:bg-red-600 animate-pulse'
												: 'bg-blue-500 hover:bg-blue-600'
										}`}
									>
										{isListening ? (
											<>
												<MicOff className='h-6 w-6 mr-2' />
												Dừng ghi âm
											</>
										) : (
											<>
												<Mic className='h-6 w-6 mr-2' />
												{hasStarted ? 'Ghi âm lại' : 'Bắt đầu ghi âm'}
											</>
										)}
									</Button>

									{/* Listening indicator */}
									{isListening && (
										<motion.div
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											className='flex items-center justify-center space-x-2 text-red-600'
										>
											<div className='flex space-x-1'>
												<div
													className='w-2 h-8 bg-red-500 rounded animate-pulse'
													style={{ animationDelay: '0ms' }}
												></div>
												<div
													className='w-2 h-6 bg-red-500 rounded animate-pulse'
													style={{ animationDelay: '100ms' }}
												></div>
												<div
													className='w-2 h-10 bg-red-500 rounded animate-pulse'
													style={{ animationDelay: '200ms' }}
												></div>
												<div
													className='w-2 h-4 bg-red-500 rounded animate-pulse'
													style={{ animationDelay: '300ms' }}
												></div>
											</div>
											<span className='text-sm font-medium'>Đang nghe...</span>
										</motion.div>
									)}

									{/* Recognized text preview */}
									{recognizedText && !result && (
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											className='bg-gray-50 p-4 rounded-lg border'
										>
											<h4 className='text-sm font-medium text-gray-700 mb-2'>
												Văn bản đã nhận diện:
											</h4>
											<p className='text-lg text-gray-900 font-japanese'>{recognizedText}</p>
											<p className='text-sm text-gray-500 mt-2'>Độ tin cậy: {confidenceScore}%</p>

											{/* Student audio playback */}
											{audioUrl && (
												<div className='mt-3 flex items-center space-x-2'>
													<Button
														variant='superOutline'
														size='sm'
														onClick={playStudentAudio}
														disabled={isPlayingStudent}
														className='flex items-center space-x-1'
													>
														{isPlayingStudent ? (
															<>
																<Pause className='h-4 w-4' />
																<span>Đang phát...</span>
															</>
														) : (
															<>
																<Play className='h-4 w-4' />
																<span>Nghe lại giọng nói của bạn</span>
															</>
														)}
													</Button>
												</div>
											)}

											{/* Submit button */}
											<Button
												size='lg'
												onClick={submitExercise}
												disabled={isProcessing}
												className='mt-4 bg-green-600 hover:bg-green-700'
											>
												{isProcessing ? (
													<>
														<Loader2 className='h-5 w-5 mr-2 animate-spin' />
														Đang xử lý...
													</>
												) : (
													<>
														<CheckCircle className='h-5 w-5 mr-2' />
														Nộp bài
													</>
												)}
											</Button>
										</motion.div>
									)}

									{/* Processing indicator */}
									{isProcessing && (
										<div className='flex items-center justify-center space-x-2 text-blue-600'>
											<Loader2 className='h-5 w-5 animate-spin' />
											<span>Đang xử lý...</span>
										</div>
									)}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Result Display */}
			{result && (
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
					<Card
						className={`border-l-4 ${
							result.isPassed ? 'border-l-green-500 bg-green-50' : 'border-l-yellow-500 bg-yellow-50'
						}`}
					>
						<CardContent className='pt-6'>
							<div className='text-center space-y-6'>
								{/* Result Header */}
								<div className='flex items-center justify-center space-x-3'>
									{result.isPassed ? (
										<CheckCircle className='h-8 w-8 text-green-600' />
									) : (
										<XCircle className='h-8 w-8 text-yellow-600' />
									)}
									<h3
										className={`text-2xl font-bold ${
											result.isPassed ? 'text-green-700' : 'text-yellow-700'
										}`}
									>
										{result.isPassed ? '🎉 Xuất sắc!' : '💪 Kết quả'}
									</h3>
								</div>

								{/* Score Display */}
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div className='bg-white p-4 rounded-lg border'>
										<div className='flex items-center justify-center space-x-2 mb-2'>
											<Award className='h-5 w-5 text-blue-600' />
											<span className='text-sm font-medium text-gray-700'>Điểm chính xác</span>
										</div>
										<div className={`text-2xl font-bold ${getAccuracyColor(result.accuracyScore)}`}>
											{result.accuracyScore}%
										</div>
										<div className='text-xs text-gray-500'>
											Cần: {exercise.minimumAccuracyScore}%
										</div>
									</div>

									<div className='bg-white p-4 rounded-lg border'>
										<div className='flex items-center justify-center space-x-2 mb-2'>
											<TrendingUp className='h-5 w-5 text-green-600' />
											<span className='text-sm font-medium text-gray-700'>Độ tin cậy</span>
										</div>
										<div className='text-2xl font-bold text-green-600'>
											{result.confidenceScore}%
										</div>
									</div>

									<div className='bg-white p-4 rounded-lg border'>
										<div className='flex items-center justify-center space-x-2 mb-2'>
											<Clock className='h-5 w-5 text-purple-600' />
											<span className='text-sm font-medium text-gray-700'>Thời gian</span>
										</div>
										<div className='text-2xl font-bold text-purple-600'>
											{result.timeSpentSeconds}s
										</div>
									</div>
								</div>

								{/* Comparison */}
								<div className='bg-white p-6 rounded-lg border'>
									<h4 className='text-lg font-semibold text-gray-800 mb-4'>So sánh kết quả</h4>
									<div className='space-y-4'>
										<div>
											<span className='text-sm font-medium text-gray-600'>Văn bản mục tiêu:</span>
											<p className='text-lg text-blue-900 font-japanese mt-1'>
												{result.targetText}
											</p>
											<Button
												variant='superOutline'
												size='sm'
												onClick={playTargetAudio}
												disabled={isPlaying}
												className='mt-2 flex items-center space-x-1'
											>
												{isPlaying ? (
													<>
														<Volume2 className='h-4 w-4' />
														<span>Đang phát...</span>
													</>
												) : (
													<>
														<Play className='h-4 w-4' />
														<span>Nghe lại phát âm mẫu</span>
													</>
												)}
											</Button>
										</div>
										<div>
											<span className='text-sm font-medium text-gray-600'>Bạn đã nói:</span>
											<p className='text-lg text-gray-900 font-japanese mt-1'>
												{result.recognizedText}
											</p>
											{/* Student audio playback in results */}
											{audioUrl && (
												<Button
													variant='superOutline'
													size='sm'
													onClick={playStudentAudio}
													disabled={isPlayingStudent}
													className='mt-2 flex items-center space-x-1'
												>
													{isPlayingStudent ? (
														<>
															<Pause className='h-4 w-4' />
															<span>Đang phát...</span>
														</>
													) : (
														<>
															<Play className='h-4 w-4' />
															<span>Nghe lại giọng nói của bạn</span>
														</>
													)}
												</Button>
											)}
										</div>
									</div>
								</div>

								{/* Feedback */}
								{result.pronunciationFeedback && (
									<div className='bg-white p-4 rounded-lg border'>
										<div className='flex items-center space-x-2 mb-2'>
											<MessageSquare className='h-5 w-5 text-blue-600' />
											<span className='text-sm font-medium text-gray-700'>Phản hồi</span>
										</div>
										<p className='text-gray-600'>{result.pronunciationFeedback}</p>
									</div>
								)}

								{/* Action Buttons */}
								<div className='flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4'>
									{!result.isPassed && attemptNumber < 3 && (
										<Button onClick={resetExercise} variant='superOutline' size='lg'>
											<Repeat className='h-5 w-5 mr-2' />
											Thử lại (Lần {attemptNumber + 1}/3)
										</Button>
									)}

									{(result.isPassed || attemptNumber >= 3) && onNext && (
										<Button onClick={onNext} size='lg' className='bg-green-600 hover:bg-green-700'>
											<CheckCircle className='h-5 w-5 mr-2' />
											Tiếp tục
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Hidden audio elements */}
			{exercise.targetAudioUrl && (
				<audio
					ref={audioRef}
					src={exercise.targetAudioUrl}
					onPlay={handleAudioPlay}
					onPause={handleAudioPause}
					onEnded={handleAudioEnded}
					style={{ display: 'none' }}
				/>
			)}

			{/* Student recorded audio */}
			{audioUrl && (
				<audio
					ref={studentAudioRef}
					src={audioUrl}
					onPlay={handleStudentAudioPlay}
					onPause={handleStudentAudioPause}
					onEnded={handleStudentAudioEnded}
					style={{ display: 'none' }}
				/>
			)}
		</div>
	);
};

export default SpeechExerciseComponent;
