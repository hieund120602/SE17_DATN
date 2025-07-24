import React from 'react';
import { UseFormReturn, useFieldArray, UseFieldArrayReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, HelpCircle, Mic } from 'lucide-react';
import { CourseFormValues } from '@/schemas/course-schema';
import QuestionItem from '@/app/(tutor)/tutor/components/question-item';
import SpeechExerciseItem from '@/app/(tutor)/tutor/components/speech-exercise-item';

interface ExerciseItemProps {
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

const ExerciseItem: React.FC<ExerciseItemProps> = ({
	form,
	moduleIndex,
	lessonIndex,
	exerciseIndex,
	exercisesArray,
}) => {
	// Get the exercise type to determine which component to render
	const exerciseType = form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.type`);

	// Check if this is a speech exercise
	const isSpeechExercise = ['LISTENING', 'SPEAKING', 'SPEECH_RECOGNITION', 'PRONUNCIATION'].includes(exerciseType);

	// If it's a speech exercise, render the SpeechExerciseItem component
	if (isSpeechExercise) {
		return (
			<SpeechExerciseItem
				form={form}
				moduleIndex={moduleIndex}
				lessonIndex={lessonIndex}
				exerciseIndex={exerciseIndex}
				exercisesArray={exercisesArray}
			/>
		);
	}

	// Setup field array for questions (only for traditional exercises)
	const questionsArray = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions`,
	});

	// Add a new question to an exercise
	const addQuestion = () => {
		questionsArray.append({
			content: '',
			hint: '',
			correctAnswer: '',
			answerExplanation: '',
			points: 1,
			options: [
				{ content: '', correct: true },
				{ content: '', correct: false },
			],
		});
	};

	return (
		<div className='border border-gray-200 rounded-md p-4 bg-gray-50'>
			<div className='flex justify-between items-start mb-4'>
				<Label className='text-sm font-medium'>Bài tập {exerciseIndex + 1}</Label>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => exercisesArray.remove(exerciseIndex)}
					className='text-red-500 hover:bg-red-50 hover:text-red-600 p-1 h-8 w-8'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</div>

			<div className='space-y-4'>
				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.title`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tiêu đề bài tập</FormLabel>
							<FormControl>
								<Input placeholder='Nhập tiêu đề bài tập' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.description`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mô tả bài tập</FormLabel>
							<FormControl>
								<Textarea placeholder='Mô tả ngắn gọn về bài tập' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.type`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Loại bài tập</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Chọn loại bài tập' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value='MULTIPLE_CHOICE'>Trắc nghiệm</SelectItem>
									<SelectItem value='FILL_IN_THE_BLANK'>Điền vào chỗ trống</SelectItem>
									<SelectItem value='MATCHING'>Nối câu</SelectItem>

									{/* Speech Exercise Types */}
									<SelectItem value='LISTENING' className="bg-blue-50 text-blue-700 font-medium">
										<div className="flex items-center gap-2">
											<Mic className="h-4 w-4" />
											Bài tập Nghe
										</div>
									</SelectItem>
									<SelectItem value='SPEAKING' className="bg-blue-50 text-blue-700 font-medium">
										<div className="flex items-center gap-2">
											<Mic className="h-4 w-4" />
											Bài tập Nói
										</div>
									</SelectItem>
									<SelectItem value='SPEECH_RECOGNITION' className="bg-blue-50 text-blue-700 font-medium">
										<div className="flex items-center gap-2">
											<Mic className="h-4 w-4" />
											Nhận dạng Giọng nói
										</div>
									</SelectItem>
									<SelectItem value='PRONUNCIATION' className="bg-blue-50 text-blue-700 font-medium">
										<div className="flex items-center gap-2">
											<Mic className="h-4 w-4" />
											Luyện Phát âm
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Questions section - only show for traditional exercises */}
				{!isSpeechExercise && (
					<div className='space-y-4 mt-6'>
						<div className='flex items-center justify-between'>
							<Label className='text-sm font-medium'>Câu hỏi</Label>
							<Button type='button' variant='secondary' size='sm' onClick={addQuestion}>
								<Plus className='h-4 w-4 mr-1' />
								Thêm câu hỏi
							</Button>
						</div>

						{questionsArray.fields.length === 0 ? (
							<div className='text-center py-4 border border-dashed border-gray-200 rounded-md'>
								<HelpCircle className='h-8 w-8 text-gray-300 mx-auto mb-2' />
								<p className='text-sm text-gray-500'>Chưa có câu hỏi</p>
							</div>
						) : (
							<div className='space-y-6'>
								{questionsArray.fields.map((question, questionIndex) => (
									<QuestionItem
										key={question.id}
										form={form}
										moduleIndex={moduleIndex}
										lessonIndex={lessonIndex}
										exerciseIndex={exerciseIndex}
										questionIndex={questionIndex}
										questionsArray={questionsArray}
										exerciseType={exerciseType}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ExerciseItem;