'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Lock, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Module } from '@/services/course-service';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseContentProps {
	modules: Module[];
	isEnrolled: boolean;
	dictionary: any;
}

const CourseContent = ({ modules, isEnrolled, dictionary }: CourseContentProps) => {
	const [expandedModules, setExpandedModules] = useState<number[]>([0]);

	const toggleModule = (moduleId: number) => {
		setExpandedModules((prev) =>
			prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
		);
	};

	return (
		<div className='divide-y divide-gray-100'>
			{modules.map((module, index) => (
				<div key={module.id} className='overflow-hidden'>
					<button
						onClick={() => toggleModule(module.id)}
						className='w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition duration-150 focus:outline-none focus:bg-gray-50'
					>
						<div className='flex items-start'>
							<div className='mr-3 mt-1'>
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center ${
										expandedModules.includes(module.id) ? 'bg-primary text-white' : 'bg-gray-100'
									}`}
								>
									{expandedModules.includes(module.id) ? (
										<ChevronUp className='h-4 w-4' />
									) : (
										<ChevronDown className='h-4 w-4' />
									)}
								</div>
							</div>
							<div className='text-left'>
								<h4 className='font-medium text-gray-900'>
									{dictionary.courses.module} {index + 1}: {module.title}
								</h4>
								<div className='text-sm text-gray-500 mt-1 flex items-center flex-wrap'>
									<span className='flex items-center'>
										<Play className='h-3.5 w-3.5 mr-1' />
										{module.lessons.length} {dictionary.courses.lessonsCount}
									</span>
									<span className='mx-2'>•</span>
									<span className='flex items-center'>
										<Clock className='h-3.5 w-3.5 mr-1' />
										{formatDuration(module.durationInMinutes, dictionary)}
									</span>
								</div>
							</div>
						</div>
					</button>

					<AnimatePresence>
						{expandedModules.includes(module.id) && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3 }}
								className='bg-gray-50'
							>
								{module.lessons.map((lesson, lessonIndex) => (
									<div
										key={lesson.id}
										className={`px-6 py-3 flex items-center border-l-2 ${
											lesson.locked && !isEnrolled
												? 'border-gray-300 opacity-75'
												: 'border-primary'
										} hover:bg-gray-100 transition-colors duration-200 ${
											lessonIndex === 0 ? 'pt-4' : ''
										} ${lessonIndex === module.lessons.length - 1 ? 'pb-4' : ''}`}
									>
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
												lesson.locked && !isEnrolled ? 'bg-gray-200' : 'bg-primary/10'
											}`}
										>
											{lesson.locked && !isEnrolled ? (
												<Lock className='h-5 w-5 text-gray-500' />
											) : (
												<Play
													className={`h-5 w-5 ${
														!isEnrolled ? 'text-gray-500' : 'text-primary'
													}`}
												/>
											)}
										</div>

										<div className='flex-1 min-w-0'>
											<h5
												className={`font-medium truncate ${
													lesson.locked && !isEnrolled ? 'text-gray-600' : 'text-gray-900'
												}`}
											>
												{lessonIndex + 1}. {lesson.title}
											</h5>
											<div className='flex items-center text-sm text-gray-500 mt-1 flex-wrap gap-y-1'>
												<span className='flex items-center'>
													<Clock className='h-4 w-4 mr-1' />
													{formatDuration(lesson.durationInMinutes, dictionary)}
												</span>

												{lesson.resources && lesson.resources.length > 0 && (
													<>
														<span className='mx-2'>•</span>
														<span className='flex items-center'>
															<FileText className='h-4 w-4 mr-1' />
															{lesson.resources.length} {dictionary.courses.resources}
														</span>
													</>
												)}

												{lesson.exercises && lesson.exercises.length > 0 && (
													<>
														<span className='mx-2'>•</span>
														<span className='flex items-center'>
															<CheckCircle className='h-4 w-4 mr-1' />
															{lesson.exercises.length} {dictionary.courses.exercises}
														</span>
													</>
												)}
											</div>
										</div>

										{lesson.locked && !isEnrolled && (
											<span className='ml-3 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full'>
												{dictionary.courses.locked}
											</span>
										)}
									</div>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			))}

			{!isEnrolled && (
				<div className='p-6 bg-gray-50 border-t border-gray-200'>
					<div className='text-center'>
						<Lock className='h-10 w-10 text-primary/60 mx-auto mb-3' />
						<h4 className='font-medium text-gray-900 mb-2'>{dictionary.courses.accessLocked}</h4>
						<p className='text-gray-600 text-sm mb-4'>{dictionary.courses.enrollToUnlock}</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default CourseContent;
