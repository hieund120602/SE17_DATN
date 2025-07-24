// File: src/app/(tutor)/tutor/components/module-tab.tsx
// CẬP NHẬT: Thêm hỗ trợ cho Speech Exercise trong default values

import React, { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ChevronUp, ChevronDown, Video, X, Loader2, Film, FileText, FileUp } from 'lucide-react';
import FileUploadService from '@/services/file-upload-service';
import { toast } from 'sonner';
import LessonItem from '@/app/(tutor)/tutor/components/lesson-item';

const ModulesTab = ({ form, navigateToTab, currentUploadTasks, setCurrentUploadTasks }: any) => {
	// Setup field arrays for dynamic form elements
	const {
		fields: moduleFields,
		append: appendModule,
		remove: removeModule,
		move: moveModule,
	} = useFieldArray({
		control: form.control,
		name: 'modules',
	});

	// Add a new module
	const addModule = () => {
		const currentModules = form.getValues('modules');
		const newPosition = currentModules.length;

		appendModule({
			title: `Module ${newPosition + 1}`,
			position: newPosition,
			durationInMinutes: 0,
			lessons: [
				{
					title: 'Bài học 1',
					description: '',
					videoUrl: '',
					durationInMinutes: 0,
					content: '',
					position: 0,
					resources: [],
					exercises: [],
				},
			],
		});
	};

	// CẬP NHẬT: Add a new lesson to a module with Speech Exercise support
	const addLesson = (moduleIndex: any) => {
		// Get the current lessons
		const lessons = form.getValues(`modules.${moduleIndex}.lessons`);
		const newPosition = lessons.length;

		// Updated lesson template với exercise mặc định có hỗ trợ Speech
		const newLesson = {
			title: `Bài học ${newPosition + 1}`,
			description: '',
			videoUrl: '',
			durationInMinutes: 0,
			content: '',
			position: newPosition,
			resources: [],
			exercises: [
				// Default traditional exercise
				{
					title: 'Bài tập trắc nghiệm',
					description: 'Bài tập trắc nghiệm cơ bản',
					type: 'MULTIPLE_CHOICE',
					questions: [
						{
							content: '',
							hint: '',
							correctAnswer: '',
							answerExplanation: '',
							points: 1,
							options: [
								{ content: '', correct: true },
								{ content: '', correct: false },
							],
						},
					],
					// Speech exercise fields (optional for traditional exercises)
					targetText: '',
					targetAudioUrl: '',
					difficultyLevel: 'BEGINNER',
					speechRecognitionLanguage: 'ja-JP',
					minimumAccuracyScore: 70,
				}
			],
		};

		// Get current lessons
		const currentLessons = form.getValues(`modules.${moduleIndex}.lessons`);

		// Update the form with added lesson
		form.setValue(`modules.${moduleIndex}.lessons`, [...currentLessons, newLesson]);
	};

	return (
		<div className='space-y-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-xl text-emerald-700'>Các module và bài học</CardTitle>
					<CardDescription>Tạo và quản lý các module và bài học trong khóa học của bạn</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-6'>
						{moduleFields.map((moduleField, moduleIndex) => (
							<div key={moduleField.id} className='border border-gray-200 rounded-lg p-4 bg-white'>
								<div className='flex items-center justify-between mb-4'>
									<FormField
										control={form.control}
										name={`modules.${moduleIndex}.title`}
										render={({ field }) => (
											<FormItem className='flex-1 mr-4'>
												<FormControl>
													<Input
														placeholder='Tiêu đề module'
														{...field}
														className='text-lg font-medium'
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className='flex items-center space-x-2'>
										{moduleFields.length > 1 && (
											<Button
												type='button'
												variant='ghost'
												size='sm'
												onClick={() => removeModule(moduleIndex)}
												className='text-red-500 hover:bg-red-50 hover:text-red-600'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										)}

										{moduleIndex > 0 && (
											<Button
												type='button'
												variant='ghost'
												size='sm'
												onClick={() => moveModule(moduleIndex, moduleIndex - 1)}
												className='text-gray-500 hover:bg-gray-100'
											>
												<ChevronUp className='h-4 w-4' />
											</Button>
										)}

										{moduleIndex < moduleFields.length - 1 && (
											<Button
												type='button'
												variant='ghost'
												size='sm'
												onClick={() => moveModule(moduleIndex, moduleIndex + 1)}
												className='text-gray-500 hover:bg-gray-100'
											>
												<ChevronDown className='h-4 w-4' />
											</Button>
										)}
									</div>
								</div>

								{/* Lessons */}
								<div className='space-y-4 pl-2'>
									{form
										.watch(`modules.${moduleIndex}.lessons`)
										.map((lesson: any, lessonIndex: any) => (
											<LessonItem
												key={`lesson-${moduleIndex}-${lessonIndex}`}
												form={form}
												moduleIndex={moduleIndex}
												lessonIndex={lessonIndex}
												currentUploadTasks={currentUploadTasks}
												setCurrentUploadTasks={setCurrentUploadTasks}
											/>
										))}

									<Button type='button' variant='secondary' onClick={() => addLesson(moduleIndex)}>
										<Plus className='h-4 w-4 mr-2' />
										Thêm bài học
									</Button>
								</div>
							</div>
						))}

						<Button type='button' variant='secondary' onClick={addModule}>
							<Plus className='h-4 w-4 mr-2' />
							Thêm module mới
						</Button>
					</div>
				</CardContent>
				<CardFooter className='flex justify-between'>
					<Button type='button' variant='superOutline' onClick={() => navigateToTab('content')}>
						Quay lại
					</Button>
					<Button type='button' onClick={() => navigateToTab('pricing')} variant='primary'>
						Tiếp theo
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ModulesTab;