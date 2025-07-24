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
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types based on the documentation
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

interface SpeechExerciseResult {
  id: number;
  targetText: string;
  recognizedText: string;
  accuracyScore: number;
  confidenceScore: number;
  pronunciationFeedback: string;
  isPassed: boolean;
  attemptNumber: number;
  timeSpentSeconds: number;
}

interface SpeechExerciseStats {
  totalAttempts: number;
  totalPassed: number;
  averageAccuracyScore: number;
  currentStreak: number;
  totalTimeSpent: number;
}

const SpeechExerciseComponent: React.FC<{ exercise: SpeechExercise }> = ({ exercise }) => {
  // States
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [result, setResult] = useState<SpeechExerciseResult | null>(null);
  const [stats, setStats] = useState<SpeechExerciseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check browser support and permissions on mount
  useEffect(() => {
    checkBrowserSupport();
    checkMicrophonePermission();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (browserSupported) {
      initializeSpeechRecognition();
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [browserSupported]);

  const checkBrowserSupport = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setError('Trình duyệt không hỗ trợ nhận dạng giọng nói. Vui lòng sử dụng Chrome hoặc Edge');
      return;
    }

    if (!('speechSynthesis' in window)) {
      setError('Trình duyệt không hỗ trợ tổng hợp giọng nói');
      return;
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission(true);
    } catch (error: any) {
      setMicrophonePermission(false);
      if (error.name === 'NotAllowedError') {
        setError('Vui lòng cho phép truy cập microphone để sử dụng tính năng này');
      } else if (error.name === 'NotFoundError') {
        setError('Không tìm thấy microphone. Vui lòng kiểm tra thiết bị của bạn');
      } else {
        setError('Không thể truy cập microphone');
      }
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = exercise.speechRecognitionLanguage || 'ja-JP';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      startTimeRef.current = Date.now();
      setStartTime(Date.now());
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidenceScore(Math.round(confidence * 100));
        } else {
          interimTranscript += transcript;
        }
      }

      setRecognizedText(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);

      switch (event.error) {
        case 'no-speech':
          setError('Không nghe thấy giọng nói. Vui lòng thử lại');
          break;
        case 'audio-capture':
          setError('Không thể truy cập microphone');
          break;
        case 'not-allowed':
          setError('Quyền truy cập microphone đã bị từ chối');
          break;
        default:
          setError('Đã xảy ra lỗi khi nhận dạng giọng nói');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const startListening = useCallback(async () => {
    if (!microphonePermission) {
      await checkMicrophonePermission();
      return;
    }

    if (!recognitionRef.current) {
      setError('Hệ thống nhận dạng giọng nói chưa sẵn sàng');
      return;
    }

    try {
      setRecognizedText('');
      setConfidenceScore(0);
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Không thể bắt đầu nhận dạng giọng nói');
    }
  }, [microphonePermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const playTargetAudio = useCallback(() => {
    if (exercise.targetAudioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Use text-to-speech if no audio URL
      speakText(exercise.targetText);
    }
  }, [exercise.targetAudioUrl, exercise.targetText, isPlaying]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = exercise.speechRecognitionLanguage || 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setError('Không thể phát âm văn bản');
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [exercise.speechRecognitionLanguage]);

  const submitResult = async () => {
    if (!recognizedText.trim()) {
      setError('Vui lòng nói gì đó trước khi gửi');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const timeSpent = startTimeRef.current
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : 0;

      // Call API to submit result
      const response = await fetch(`/api/speech-exercises/${exercise.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recognizedText,
          confidenceScore: confidenceScore / 100,
          timeSpentSeconds: timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể gửi kết quả. Vui lòng thử lại');
      }

      const resultData: SpeechExerciseResult = await response.json();
      setResult(resultData);

      // Fetch updated stats
      await fetchStats();

    } catch (error: any) {
      console.error('Error submitting result:', error);
      setError(error.message || 'Đã xảy ra lỗi khi gửi kết quả');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/speech-exercises/my-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const statsData: SpeechExerciseStats = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const resetExercise = () => {
    setRecognizedText('');
    setConfidenceScore(0);
    setResult(null);
    setError(null);
    startTimeRef.current = null;
    setStartTime(null);

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-700 border-green-200';
      case 'ELEMENTARY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ADVANCED': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'EXPERT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAccuracyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Audio event handlers
  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);
  const handleAudioEnded = () => setIsPlaying(false);

  if (!browserSupported) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Trình duyệt của bạn không hỗ trợ Web Speech API.
              Vui lòng sử dụng Chrome hoặc Edge để có trải nghiệm tốt nhất.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Exercise Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {exercise.title}
              </CardTitle>
              <p className="text-gray-600 mt-2">{exercise.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(exercise.difficultyLevel)}>
                {exercise.difficultyLevel}
              </Badge>
              <Badge variant="outline">
                {exercise.type === 'SPEAKING' ? '🗣️ Nói' : '👂 Nghe'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Target Text Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {exercise.type === 'SPEAKING' ? 'Hãy đọc văn bản sau:' : 'Hãy nghe và lặp lại:'}
            </h3>
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <p className="text-3xl font-bold text-blue-800 mb-4">
                {exercise.targetText}
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={playTargetAudio}
                disabled={isPlaying}
                className="flex items-center space-x-2"
              >
                {isPlaying ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                <span>{isPlaying ? 'Đang phát...' : 'Nghe phát âm'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio element for target audio */}
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

      {/* Speech Recognition Interface */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Phần của bạn
              </h3>

              {/* Microphone Button */}
              <div className="relative inline-block">
                <motion.div
                  animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                >
                  <Button
                    variant={isListening ? "danger" : "primary"}
                    size="lg"
                    onClick={isListening ? stopListening : startListening}
                    disabled={microphonePermission === false}
                    className="h-16 w-16 rounded-full"
                  >
                    {isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </motion.div>

                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-400"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {isListening
                  ? 'Đang nghe... Nhấn để dừng'
                  : 'Nhấn và giữ để bắt đầu ghi âm'
                }
              </p>
            </div>

            {/* Recognition Result */}
            <AnimatePresence>
              {recognizedText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-50 p-4 rounded-lg border"
                >
                  <h4 className="font-semibold text-gray-700 mb-2">Văn bản được nhận dạng:</h4>
                  <p className="text-xl text-gray-800 mb-2">{recognizedText}</p>
                  {confidenceScore > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Độ tin cậy:</span>
                      <Progress value={confidenceScore} className="flex-1 max-w-xs" />
                      <span className="text-sm font-semibold">{confidenceScore}%</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondaryOutline"
                onClick={resetExercise}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại
              </Button>

              <Button
                onClick={submitResult}
                disabled={!recognizedText.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Đang xử lý...' : 'Gửi kết quả'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${result.isPassed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center ${result.isPassed ? 'text-green-700' : 'text-red-700'}`}>
                  {result.isPassed ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  {result.isPassed ? 'Chúc mừng! Bạn đã hoàn thành!' : 'Chưa đạt yêu cầu'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Độ chính xác</p>
                    <p className={`text-2xl font-bold ${getAccuracyColor(result.accuracyScore)}`}>
                      {Math.round(result.accuracyScore)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Độ tin cậy</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(result.confidenceScore)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.timeSpentSeconds}s
                    </p>
                  </div>
                </div>

                {result.pronunciationFeedback && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Phản hồi phát âm:
                    </h4>
                    <p className="text-gray-800">{result.pronunciationFeedback}</p>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Button onClick={resetExercise} variant="secondaryOutline">
                    Thử lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Display */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              📊 Thống kê của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded text-center">
                <h3 className="font-bold text-blue-800">Tổng số lần thử</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</p>
              </div>

              <div className="bg-green-50 p-4 rounded text-center">
                <h3 className="font-bold text-green-800">Số lần đạt</h3>
                <p className="text-2xl font-bold text-green-600">{stats.totalPassed}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded text-center">
                <h3 className="font-bold text-yellow-800">Điểm trung bình</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(stats.averageAccuracyScore)}%
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded text-center">
                <h3 className="font-bold text-purple-800">Chuỗi thắng</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.currentStreak}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-gray-800 mb-2">Thời gian học tập</h3>
                <p className="text-gray-600">
                  Tổng: {Math.round(stats.totalTimeSpent / 60)} phút
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpeechExerciseComponent;