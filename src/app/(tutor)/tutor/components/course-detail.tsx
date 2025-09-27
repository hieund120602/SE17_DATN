import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Loader2, BookOpen, PenLine, Play, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import CourseOverview from '@/app/(tutor)/tutor/components/course-overview';
import ModulesList from '@/app/(tutor)/tutor/components/modules-list';
import RejectionFeedback from '@/app/(tutor)/tutor/components/rejection-feedback';

const CourseDetailDialog = ({
	isOpen,
	onClose,
	course,
	isLoading,
	onEdit,
	onSubmit,
	onDelete,
	isSubmitting,
	isDeleting,
	onResourceClick,
	onExerciseClick,
	formatDuration,
	formatPrice,
	getStatusBadge,
}: any) => {
	const [expandedLesson, setExpandedLesson] = useState(null);

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-5xl p-0 overflow-hidden'>
				{isLoading ? (
					<div className='flex justify-center items-center p-12'>
						<div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
					</div>
				) : course ? (
					<div className='flex flex-col h-full'>
						{/* Header with course info */}
						<div className='bg-gradient-to-r from-emerald-50 to-teal-50 p-6'>
							<div className='flex flex-col md:flex-row gap-6'>
								<div className='h-32 w-48 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm'>
									{course.thumbnailUrl ? (
										<img
											src={course.thumbnailUrl}
											alt={course.title}
											className='h-full w-full object-cover'
										/>
									) : (
										<div className='flex items-center justify-center h-full w-full bg-emerald-100'>
											<BookOpen className='h-12 w-12 text-emerald-600' />
										</div>
									)}
								</div>

								<div className='flex flex-col gap-2 w-full'>
									<h2 className='text-2xl font-bold text-emerald-800'>{course.title}</h2>
									<div className='flex items-center gap-2'>
										{getStatusBadge(course.status)}
										{course.level && (
											<Badge className='bg-blue-50 text-blue-700 border-blue-200'>
												{course.level.name}
											</Badge>
										)}
									</div>

									<div className='flex flex-wrap gap-4 text-sm'>
										<div className='flex items-center text-gray-700'>
											<Clock className='h-4 w-4 mr-1 text-emerald-600' />
											{formatDuration(course.durationInMinutes)}
										</div>
										<div className='flex items-center text-gray-700'>
											<BookOpen className='h-4 w-4 mr-1 text-emerald-600' />
											{course.lessonCount} bài học
										</div>
										<div className='font-medium text-emerald-700'>{formatPrice(course.price)}</div>
									</div>

									<div className='w-full flex justify-end'>
										<div className='flex gap-2'>
											{onEdit && (
												<Button
													variant='superOutline'
													className='bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
													onClick={onEdit}
												>
													<PenLine className='mr-2 h-4 w-4' />
													Chỉnh sửa
												</Button>
											)}

											{onSubmit && (
												<Button variant='secondary' disabled={isSubmitting} onClick={onSubmit}>
													{isSubmitting ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang xử lý...
														</>
													) : (
														<>
															<Play className='mr-2 h-4 w-4' />
															Gửi phê duyệt
														</>
													)}
												</Button>
											)}

											{onDelete && (
												<Button variant='danger' disabled={isDeleting} onClick={onDelete}>
													{isDeleting ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															Đang xử lý...
														</>
													) : (
														<>
															<Trash2 className='mr-2 h-4 w-4' />
															Xóa
														</>
													)}
												</Button>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Tab content */}
						<Tabs defaultValue='overview' className='flex-1'>
							<div className='border-b px-6'>
								<TabsList className='bg-transparent -mb-px'>
									<TabsTrigger
										value='overview'
										className='py-3 text-emerald-800 data-[state=active]:text-emerald-600'
									>
										Tổng quan
									</TabsTrigger>
									<TabsTrigger
										value='modules'
										className='py-3 text-emerald-800 data-[state=active]:text-emerald-600'
									>
										Các Module
									</TabsTrigger>
									{course.status === 'REJECTED' && (
										<TabsTrigger
											value='feedback'
											className='py-3 text-emerald-800 data-[state=active]:text-emerald-600'
										>
											Phản hồi từ chối
										</TabsTrigger>
									)}
								</TabsList>
							</div>

							<div className='p-6 overflow-auto max-h-[60vh]'>
								<TabsContent value='overview' className='mt-0'>
									<CourseOverview course={course} />
								</TabsContent>

								<TabsContent value='modules' className='mt-0'>
									<ModulesList
										modules={course.modules}
										expandedLesson={expandedLesson}
										setExpandedLesson={setExpandedLesson}
										onResourceClick={onResourceClick}
										onExerciseClick={onExerciseClick}
										formatDuration={formatDuration}
									/>
								</TabsContent>

								{course.status === 'REJECTED' && (
									<TabsContent value='feedback' className='mt-0'>
										<RejectionFeedback feedback={course.rejectionFeedback} />
									</TabsContent>
								)}
							</div>
						</Tabs>

						{/* Footer */}
						<DialogFooter className='p-4 border-t bg-gray-50'>
							<Button variant='secondary' onClick={onClose}>
								Đóng
							</Button>
						</DialogFooter>
					</div>
				) : (
					<div className='flex justify-center items-center p-12'>
						<p className='text-gray-500'>Không thể tải thông tin khóa học</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default CourseDetailDialog;
