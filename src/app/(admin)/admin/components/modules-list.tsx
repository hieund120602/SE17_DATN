import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, ChevronDown, ChevronRight, Eye, FileQuestion } from 'lucide-react';
import LessonDetail from './lesson-detail';

const ModulesList = ({
	modules,
	expandedLesson,
	setExpandedLesson,
	onResourceClick,
	onExerciseClick,
	formatDuration,
}: any) => {
	if (!modules || modules.length === 0) {
		return (
			<div className='text-center py-8'>
				<BookOpen className='h-12 w-12 mx-auto text-gray-300' />
				<p className='mt-4 text-gray-500'>Khóa học chưa có module nào</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{modules
				.sort((a: any, b: any) => a.position - b.position)
				.map((module: any) => (
					<Card key={module.id} className='overflow-hidden'>
						<CardHeader className='bg-emerald-50'>
							<CardTitle className='text-lg text-emerald-800 flex items-center justify-between'>
								<div className='flex items-center'>
									<span className='mr-2'>Module {module.position + 1}:</span>
									{module.title}
								</div>
								<div className='flex items-center text-sm text-gray-600'>
									<Clock className='h-4 w-4 mr-1' />
									{formatDuration(module.durationInMinutes)}
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent className='p-0'>
							{module.lessons && module.lessons.length > 0 ? (
								<div className='divide-y'>
									{module.lessons
										.sort((a: any, b: any) => a.position - b.position)
										.map((lesson: any) => (
											<div key={lesson.id} className='p-4 hover:bg-gray-50 transition-colors'>
												<div
													className='flex items-center justify-between cursor-pointer'
													onClick={() => {
														if (expandedLesson === lesson.id) {
															setExpandedLesson(null);
														} else {
															setExpandedLesson(lesson.id);
														}
													}}
												>
													<h4 className='font-medium text-emerald-800 flex items-center'>
														{expandedLesson === lesson.id ? (
															<ChevronDown className='mr-1 h-4 w-4 text-emerald-600' />
														) : (
															<ChevronRight className='mr-1 h-4 w-4 text-emerald-600' />
														)}
														Bài {lesson.position + 1}: {lesson.title}
													</h4>
													<div className='flex items-center text-sm text-gray-600'>
														<Clock className='h-4 w-4 mr-1' />
														{formatDuration(lesson.durationInMinutes)}
													</div>
												</div>

												{lesson.description && (
													<p className='text-sm text-gray-600 mt-2 ml-5'>
														{lesson.description}
													</p>
												)}

												<div className='flex flex-wrap gap-2 mt-2 ml-5'>
													{lesson.resources && lesson.resources.length > 0 && (
														<Badge
															variant='outline'
															className='bg-blue-50 text-blue-700 border-blue-200'
														>
															{lesson.resources.length} tài liệu
														</Badge>
													)}
													{lesson.exercises && lesson.exercises.length > 0 && (
														<Badge
															variant='outline'
															className='bg-purple-50 text-purple-700 border-purple-200'
														>
															{lesson.exercises.length} bài tập
														</Badge>
													)}
												</div>

												{expandedLesson === lesson.id && (
													<LessonDetail
														lesson={lesson}
														onResourceClick={onResourceClick}
														onExerciseClick={onExerciseClick}
													/>
												)}
											</div>
										))}
								</div>
							) : (
								<p className='p-4 text-gray-500 text-center'>Không có bài học nào</p>
							)}
						</CardContent>
					</Card>
				))}
		</div>
	);
};

export default ModulesList;
