'use client';
import React from 'react';
import { UseFormReturn, UseFieldArrayReturn, useFieldArray } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { CourseFormValues } from '@/schemas/course-schema';

interface QuestionItemProps {
	form: UseFormReturn<CourseFormValues>;
	moduleIndex: number;
	lessonIndex: number;
	exerciseIndex: number;
	questionIndex: number;
	questionsArray: UseFieldArrayReturn<
		CourseFormValues,
		`modules.${number}.lessons.${number}.exercises.${number}.questions`,
		'id'
	>;
	exerciseType: string;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
	form,
	moduleIndex,
	lessonIndex,
	exerciseIndex,
	questionIndex,
	questionsArray,
	exerciseType,
}) => {
	// Setup field array for options
	const optionsArray = useFieldArray({
		control: form.control,
		name: `modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.options`,
	});

	// Add a new option to a question
	const addOption = () => {
		optionsArray.append({
			content: '',
			correct: false,
		});
	};

	return (
		<div className='border border-gray-200 rounded-md p-4 bg-white'>
			<div className='flex justify-between items-start mb-4'>
				<FormLabel className='text-sm font-medium'>Câu hỏi {questionIndex + 1}</FormLabel>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => questionsArray.remove(questionIndex)}
					className='text-red-500 hover:bg-red-50 hover:text-red-600 p-1 h-8 w-8'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</div>

			<div className='space-y-4'>
				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.content`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nội dung câu hỏi</FormLabel>
							<FormControl>
								<Textarea placeholder='Nhập nội dung câu hỏi' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.hint`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gợi ý (tùy chọn)</FormLabel>
							<FormControl>
								<Input placeholder='Gợi ý cho người học' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.points`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Điểm số</FormLabel>
							<FormControl>
								<Input
									type='number'
									min='1'
									placeholder='Điểm số cho câu hỏi này'
									{...field}
									onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{exerciseType === 'MULTIPLE_CHOICE' && (
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<FormLabel className='text-sm font-medium'>Các lựa chọn</FormLabel>
							<Button type='button' variant='secondary' size='sm' onClick={addOption}>
								<Plus className='h-4 w-4 mr-1' />
								Thêm lựa chọn
							</Button>
						</div>

						{optionsArray.fields.map((option, optionIndex) => (
							<div
								key={option.id}
								className='flex items-start space-x-3 border border-gray-100 rounded p-3 bg-gray-50'
							>
								<FormField
									control={form.control}
									name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.options.${optionIndex}.correct`}
									render={({ field }) => (
										<FormItem className='flex items-center space-x-3 space-y-0 mt-1'>
											<FormControl>
												<div className='flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500'>
													<input
														type='radio'
														className='h-3 w-3 text-emerald-600 focus:ring-emerald-600'
														checked={field.value}
														onChange={() => {
															// Set all options to false first
															optionsArray.fields.forEach((_, idx) => {
																form.setValue(
																	`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.options.${idx}.correct`,
																	false
																);
															});
															// Then set the current one to true
															form.setValue(
																`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.options.${optionIndex}.correct`,
																true
															);
														}}
													/>
												</div>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.options.${optionIndex}.content`}
									render={({ field }) => (
										<FormItem className='flex-1'>
											<FormControl>
												<Input placeholder='Nội dung lựa chọn' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={() => optionsArray.remove(optionIndex)}
									disabled={optionsArray.fields.length <= 2}
									className='text-red-500 hover:bg-red-50 hover:text-red-600 p-1 h-8 w-8 mt-1'
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						))}
					</div>
				)}

				<FormField
					control={form.control}
					name={`modules.${moduleIndex}.lessons.${lessonIndex}.exercises.${exerciseIndex}.questions.${questionIndex}.answerExplanation`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Giải thích đáp án</FormLabel>
							<FormControl>
								<Textarea placeholder='Giải thích tại sao đáp án này là đúng' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
};

export default QuestionItem;
