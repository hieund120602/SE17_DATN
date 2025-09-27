import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
			<div className='text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
				<BookOpen className='h-12 w-12 text-gray-400 mx-auto mb-3' />
				<p className='text-gray-500'>Khóa học này chưa có module nào.</p>
			</div>
		);
	}

	const toggleLesson = (lessonId: any) => {
		if (expandedLesson === lessonId) {
			setExpandedLesson(null);
		} else {
			setExpandedLesson(lessonId);
		}
	};

	return (
		<div className='space-y-6'>
			{modules.map((module: any) => (
				<Card key={module.id} className='overflow-hidden'>
					<div className='bg-emerald-50 p-4 border-b'>
						<div className='flex justify-between items-center'>
							<h3 className='font-semibold text-emerald-800'>
								{module.title}
								<span className='ml-1 text-sm font-normal text-emerald-600'>
									(Module {module.position})
								</span>
							</h3>
							<div className='flex items-center text-emerald-700 text-sm'>
								<Clock className='h-4 w-4 mr-1' />
								{formatDuration(module.durationInMinutes)}
							</div>
						</div>
					</div>

					<CardContent className='p-0'>
						{module.lessons && module.lessons.length > 0 ? (
							<ul className='divide-y'>
								{module.lessons.map((lesson: any) => (
									<li key={lesson.id}>
										<Collapsible
											open={expandedLesson === lesson.id}
											onOpenChange={() => toggleLesson(lesson.id)}
										>
											<CollapsibleTrigger asChild>
												<div className='p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer'>
													<div className='flex items-center gap-3'>
														<div className='flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-medium'>
															{lesson.position}
														</div>
														<div>
															<h4 className='font-medium'>{lesson.title}</h4>
															<div className='flex gap-3 text-xs text-gray-500 mt-1'>
																<span className='flex items-center'>
																	<Clock className='h-3 w-3 mr-1' />
																	{formatDuration(lesson.durationInMinutes)}
																</span>
																{lesson.resources?.length > 0 && (
																	<span>
																		{lesson.resources.length}{' '}
																		{lesson.resources.length === 1
																			? 'tài liệu'
																			: 'tài liệu'}
																	</span>
																)}
																{lesson.exercises?.length > 0 && (
																	<span>
																		{lesson.exercises.length}{' '}
																		{lesson.exercises.length === 1
																			? 'bài tập'
																			: 'bài tập'}
																	</span>
																)}
															</div>
														</div>
													</div>
													<div>
														{expandedLesson === lesson.id ? (
															<ChevronDown className='h-5 w-5 text-gray-400' />
														) : (
															<ChevronRight className='h-5 w-5 text-gray-400' />
														)}
													</div>
												</div>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<div className='px-4 pb-4 pt-0'>
													{lesson.description && (
														<div className='mb-4 text-sm text-gray-700 bg-gray-100 p-3 rounded-md'>
															{lesson.description}
														</div>
													)}

													{/* Display LessonDetail component when lesson is expanded */}
													{expandedLesson === lesson.id && (
														<LessonDetail
															lesson={lesson}
															onResourceClick={onResourceClick}
															onExerciseClick={onExerciseClick}
														/>
													)}
												</div>
											</CollapsibleContent>
										</Collapsible>
									</li>
								))}
							</ul>
						) : (
							<div className='text-center p-6 text-gray-500'>
								<p>Module này chưa có bài học nào.</p>
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default ModulesList;
