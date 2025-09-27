'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTutorRegistrationStore } from '@/store/tutor-registration-store';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface TutorProfileStepProps {
	onContinue: () => void;
	onBack: () => void;
}

// Map for degree code to readable name
const degreeMap: Record<string, string> = {
	'high-school': 'Tốt nghiệp THPT',
	college: 'Cao đẳng',
	bachelor: 'Cử nhân',
	master: 'Thạc sĩ',
	phd: 'Tiến sĩ',
};

export default function TutorProfileStep({ onContinue, onBack }: TutorProfileStepProps) {
	const { educations, addEducation, removeEducation, setTeachingRequirements } = useTutorRegistrationStore();

	const [requirements, setRequirements] = useState('');
	const [showEducationForm, setShowEducationForm] = useState(false);
	const [currentEducation, setCurrentEducation] = useState({
		institution: '',
		degree: '',
		fieldOfStudy: '',
		startDate: '',
		endDate: '',
		description: '',
	});

	const [startDate, setStartDate] = useState<Date | undefined>();
	const [endDate, setEndDate] = useState<Date | undefined>();

	const handleAddEducation = () => {
		if (
			currentEducation.institution &&
			currentEducation.degree &&
			currentEducation.fieldOfStudy &&
			startDate &&
			endDate
		) {
			addEducation({
				...currentEducation,
				startDate: format(startDate, 'yyyy-MM-dd'),
				endDate: format(endDate, 'yyyy-MM-dd'),
			});

			// Reset form
			setCurrentEducation({
				institution: '',
				degree: '',
				fieldOfStudy: '',
				startDate: '',
				endDate: '',
				description: '',
			});
			setStartDate(undefined);
			setEndDate(undefined);
			setShowEducationForm(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTeachingRequirements(requirements);
		onContinue();
	};

	// Function to get readable degree name
	const getReadableDegree = (degreeCode: string) => {
		return degreeMap[degreeCode] || degreeCode;
	};

	return (
		<div className='p-6 space-y-6 w-full max-w-2xl mx-auto'>
			<div className='text-center space-y-2'>
				<h2 className='text-2xl font-bold'>Thông tin Gia Sư</h2>
				<p className='text-gray-500'>Vui lòng cung cấp thông tin học vấn của bạn</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Teaching Requirements */}
				<div className='space-y-2'>
					<Label htmlFor='requirements'>Yêu cầu giảng dạy</Label>
					<Textarea
						id='requirements'
						placeholder='Mô tả các yêu cầu giảng dạy của bạn, ví dụ: thời gian có thể dạy, môn học chuyên sâu, v.v.'
						value={requirements}
						onChange={(e) => setRequirements(e.target.value)}
						className='min-h-[100px]'
						required
					/>
				</div>

				{/* Education Section */}
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<Label>Học vấn</Label>
						<Button
							type='button'
							variant='primaryOutline'
							size='sm'
							onClick={() => setShowEducationForm(true)}
						>
							<Plus className='mr-2 h-4 w-4' /> Thêm học vấn
						</Button>
					</div>

					{/* Display added educations */}
					{educations.length > 0 && (
						<div className='space-y-3'>
							{educations.map((education, index) => (
								<Card key={index} className='overflow-hidden'>
									<CardContent className='p-4'>
										<div className='flex justify-between items-start'>
											<div>
												<h3 className='font-medium'>
													{getReadableDegree(education.degree)} - {education.fieldOfStudy}
												</h3>
												<p className='text-sm text-gray-500'>{education.institution}</p>
												<p className='text-sm text-gray-500'>
													{new Date(education.startDate).toLocaleDateString('vi-VN')} -{' '}
													{new Date(education.endDate).toLocaleDateString('vi-VN')}
												</p>
												{education.description && (
													<p className='text-sm mt-2'>{education.description}</p>
												)}
											</div>
											<Button variant='ghost' size='icon' onClick={() => removeEducation(index)}>
												<Trash className='h-4 w-4 text-red-500' />
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Education form */}
					{showEducationForm && (
						<div className='border rounded-lg p-4 space-y-4'>
							<h3 className='font-medium'>Thêm thông tin học vấn</h3>

							<div className='space-y-2'>
								<Label htmlFor='institution'>Trường học</Label>
								<Input
									id='institution'
									value={currentEducation.institution}
									onChange={(e) =>
										setCurrentEducation({ ...currentEducation, institution: e.target.value })
									}
									placeholder='Ví dụ: Đại học Quốc gia TP.HCM'
									required
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='degree'>Bằng cấp</Label>
								<Select
									onValueChange={(value) =>
										setCurrentEducation({ ...currentEducation, degree: value })
									}
									value={currentEducation.degree}
								>
									<SelectTrigger>
										<SelectValue placeholder='Chọn bằng cấp' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='high-school'>Tốt nghiệp THPT</SelectItem>
										<SelectItem value='college'>Cao đẳng</SelectItem>
										<SelectItem value='bachelor'>Cử nhân</SelectItem>
										<SelectItem value='master'>Thạc sĩ</SelectItem>
										<SelectItem value='phd'>Tiến sĩ</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='fieldOfStudy'>Ngành học</Label>
								<Input
									id='fieldOfStudy'
									value={currentEducation.fieldOfStudy}
									onChange={(e) =>
										setCurrentEducation({ ...currentEducation, fieldOfStudy: e.target.value })
									}
									placeholder='Ví dụ: Công nghệ thông tin'
									required
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Ngày bắt đầu</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='default'
												className={cn(
													'w-full justify-start text-left font-normal bg-[#f7f7f7]',
													!startDate && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{startDate ? format(startDate, 'dd/MM/yyyy') : <span>DD/MM/YYYY</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												selected={startDate}
												onSelect={setStartDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className='space-y-2'>
									<Label>Ngày kết thúc</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='default'
												className={cn(
													'w-full justify-start text-left font-normal bg-[#f7f7f7]',
													!endDate && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{endDate ? format(endDate, 'dd/MM/yyyy') : <span>DD/MM/YYYY</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												selected={endDate}
												onSelect={setEndDate}
												initialFocus
												disabled={(date) => (startDate ? date < startDate : false)}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Mô tả (tùy chọn)</Label>
								<Textarea
									id='description'
									value={currentEducation.description}
									onChange={(e) =>
										setCurrentEducation({ ...currentEducation, description: e.target.value })
									}
									placeholder='Thêm thông tin về thành tích học tập, hạng tốt nghiệp, v.v.'
								/>
							</div>

							<div className='flex justify-end space-x-2'>
								<Button type='button' variant='default' onClick={() => setShowEducationForm(false)}>
									Hủy
								</Button>
								<Button
									type='button'
									onClick={handleAddEducation}
									disabled={
										!currentEducation.institution ||
										!currentEducation.degree ||
										!currentEducation.fieldOfStudy ||
										!startDate ||
										!endDate
									}
								>
									Thêm
								</Button>
							</div>
						</div>
					)}
				</div>

				<div className='flex gap-3 pt-2'>
					<Button type='submit' variant='secondary' className='w-80 mx-auto'>
						Tiếp tục
					</Button>
				</div>
			</form>
		</div>
	);
}
