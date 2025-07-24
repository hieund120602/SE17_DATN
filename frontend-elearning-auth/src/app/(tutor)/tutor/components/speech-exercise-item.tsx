import React, { useState } from 'react';
import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Play, Trash2, Volume2, Info, AlertCircle } from 'lucide-react';
import { CourseFormValues } from '@/schemas/course-schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpeechExerciseItemProps {
  form: UseFormReturn<CourseFormValues>;
  moduleIndex: number;
  lessonIndex: number;
  exerciseIndex: number;
  exercisesArray: UseFieldArrayReturn<
    CourseFormValues,
    `modules.${number}.lessons.${number}.exercises`,
    'id'
  >;
}

const SpeechExerciseItem: React.FC<SpeechExerciseItemProps> = ({
  form,
  moduleIndex,
  lessonIndex,
  exerciseIndex,
  exercisesArray,
}) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Hàm để phát âm demo text bằng Web Speech API
  const playDemoAudio = () => {
    const targetText = form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.targetText`);

    if (!targetText) {
      alert('Vui lòng nhập nội dung cần phát âm');
      return;
    }

    if ('speechSynthesis' in window) {
      setIsPlayingDemo(true);

      const utterance = new SpeechSynthesisUtterance(targetText);
      utterance.lang = 'ja-JP'; // Tiếng Nhật
      utterance.rate = 0.8; // Tốc độ chậm hơn cho việc học
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsPlayingDemo(false);
      };

      utterance.onerror = () => {
        setIsPlayingDemo(false);
        alert('Không thể phát âm. Vui lòng kiểm tra trình duyệt của bạn.');
      };

      speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ Text-to-Speech');
    }
  };

  // Stop demo audio
  const stopDemoAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlayingDemo(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Mic className="h-5 w-5" />
            Bài tập Nghe & Nói {exerciseIndex + 1}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exercisesArray.remove(exerciseIndex)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 p-1 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Thông báo về Web Speech API */}
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Bài tập này sử dụng Web Speech API. Hoạt động tốt nhất trên Chrome và Edge.
          </AlertDescription>
        </Alert>

        {/* Tiêu đề bài tập */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề bài tập</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Luyện phát âm chào hỏi cơ bản" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mô tả bài tập */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả bài tập</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả mục tiêu và cách thực hiện bài tập này"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Loại bài tập Speech */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại bài tập Speech</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại bài tập speech" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LISTENING">Bài tập Nghe</SelectItem>
                  <SelectItem value="SPEAKING">Bài tập Nói</SelectItem>
                  <SelectItem value="SPEECH_RECOGNITION">Nhận dạng Giọng nói</SelectItem>
                  <SelectItem value="PRONUNCIATION">Luyện Phát âm</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nội dung mục tiêu */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.targetText`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Nội dung mục tiêu (tiếng Nhật)
                <Volume2 className="h-4 w-4 text-blue-500" />
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ví dụ: おはようございます"
                    {...field}
                    className="font-mono text-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={playDemoAudio}
                      disabled={isPlayingDemo || !field.value}
                      className="flex items-center gap-2"
                    >
                      {isPlayingDemo ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Đang phát...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Nghe thử
                        </>
                      )}
                    </Button>
                    {isPlayingDemo && (
                      <Button
                        type="button"
                        variant="secondaryOutline"
                        size="sm"
                        onClick={stopDemoAudio}
                      >
                        Dừng
                      </Button>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL Audio mục tiêu (tùy chọn) */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.targetAudioUrl`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Audio mục tiêu (tùy chọn)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/audio.mp3"
                  {...field}
                  type="url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cấp độ khó */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.difficultyLevel`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cấp độ khó</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'BEGINNER'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BEGINNER">Người mới bắt đầu</SelectItem>
                  <SelectItem value="ELEMENTARY">Sơ cấp</SelectItem>
                  <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                  <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                  <SelectItem value="EXPERT">Chuyên gia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ngôn ngữ nhận dạng */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.speechRecognitionLanguage`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngôn ngữ nhận dạng</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'ja-JP'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ja-JP">Tiếng Nhật (日本語)</SelectItem>
                  <SelectItem value="en-US">Tiếng Anh (English)</SelectItem>
                  <SelectItem value="vi-VN">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Điểm tối thiểu */}
        <FormField
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.minimumAccuracyScore`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Điểm độ chính xác tối thiểu (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="70"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 70)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hướng dẫn cho học viên */}
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Hướng dẫn cho học viên:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Đảm bảo microphone hoạt động tốt</li>
              <li>• Nói rõ ràng và với tốc độ vừa phải</li>
              <li>• Thực hiện trong môi trường yên tĩnh</li>
              <li>• Có thể thử nhiều lần để đạt điểm tối thiểu</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SpeechExerciseItem;