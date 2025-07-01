'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, MoreVertical, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTutorRegistrationStore } from '@/store/tutor-registration-store';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth-service';

interface WorkExperienceStepProps {
	onContinue: () => void;
	onBack: () => void;
}

export default function WorkExperienceStep({ onContinue, onBack }: WorkExperienceStepProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		fullName,
		email,
		phoneNumber,
		password,
		confirmPassword,
		teachingRequirements,
		educations,
		experiences,
		addExperience,
		removeExperience,
		reset,
	} = useTutorRegistrationStore();

	const [isAddingExperience, setIsAddingExperience] = useState(false);
	const [newExperience, setNewExperience] = useState({
		company: '',
		position: '',
		startDate: null as any,
		endDate: null as any,
		description: '',
		current: false,
	});

	const handleAddExperience = () => {
		setNewExperience({
			company: '',
			position: '',
			startDate: null,
			endDate: null,
			description: '',
			current: false,
		});
		setIsAddingExperience(true);
	};

	const handleSaveExperience = () => {
		if (newExperience.company && newExperience.position && newExperience.startDate) {
			addExperience({
				company: newExperience.company,
				position: newExperience.position,
				startDate: format(newExperience.startDate, 'yyyy-MM-dd'),
				endDate: newExperience.current
					? ''
					: newExperience.endDate
					? format(newExperience.endDate, 'yyyy-MM-dd')
					: '',
				description: newExperience.description,
				current: newExperience.current,
			});
			setIsAddingExperience(false);
		}
	};

	const handleSubmitRegistration = async () => {
		// Final submission - call the API
		setIsSubmitting(true);

		try {
			const registrationData = {
				fullName,
				email,
				phoneNumber,
				password,
				confirmPassword,
				teachingRequirements,
				educations,
				experiences,
			};

			await AuthService.registerTutor(registrationData);

			toast({
				title: 'Đăng ký thành công',
				description: 'Tài khoản giảng viên của bạn đã được tạo.',
				variant: 'success',
			});

			// Proceed to next step FIRST, which will show the success page
			onContinue();

			// Then reset store data after successful registration
			// This should be after onContinue to ensure the step change happens
			reset();
		} catch (error) {
			console.error('Registration error:', error);
			toast({
				title: 'Đăng ký thất bại',
				description: 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const calculateYearsOfExperience = (startDate: string, endDate: string | null, current: boolean) => {
		if (!startDate) return 0;

		const start = new Date(startDate);
		const end = current ? new Date() : endDate ? new Date(endDate) : new Date();

		const years = end.getFullYear() - start.getFullYear();
		const months = end.getMonth() - start.getMonth();

		return months < 0 ? years - 1 : years;
	};

	return (
		<div className='p-6 space-y-6 w-full max-w-2xl mx-auto'>
			<div className='text-center space-y-2'>
				<h2 className='text-2xl font-bold'>Kinh nghiệm làm việc</h2>
				<p className='text-gray-500'>Hãy thêm vào kinh nghiệm làm việc của bạn để tăng cơ hội cạnh tranh.</p>
			</div>

			<div className='space-y-4'>
				{experiences.map((experience, index) => (
					<Card key={index} className='overflow-hidden'>
						<CardContent className='p-0'>
							<div className='flex items-start justify-between p-4'>
								<div className='flex items-center gap-3'>
									<div className='bg-blue-100 rounded-full p-2'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='24'
											height='24'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-blue-600'
										>
											<rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
											<line x1='16' x2='16' y1='2' y2='6' />
											<line x1='8' x2='8' y1='2' y2='6' />
											<line x1='3' x2='21' y1='10' y2='10' />
											<path d='M8 14h.01' />
											<path d='M12 14h.01' />
											<path d='M16 14h.01' />
											<path d='M8 18h.01' />
											<path d='M12 18h.01' />
											<path d='M16 18h.01' />
										</svg>
									</div>
									<div>
										<h3 className='font-medium'>{experience.position}</h3>
										<p className='text-sm text-gray-500'>{experience.company}</p>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' size='icon' className='h-8 w-8'>
											<MoreVertical className='h-4 w-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem onClick={() => removeExperience(index)}>Xóa</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className='px-4 pb-4 pt-0 text-sm text-gray-500'>
								<div className='flex flex-col gap-1'>
									<div>
										{new Date(experience.startDate).toLocaleDateString('vi-VN')} -{' '}
										{experience.current
											? 'Hiện tại'
											: experience.endDate &&
											  new Date(experience.endDate).toLocaleDateString('vi-VN')}
										{' • '}
										{calculateYearsOfExperience(
											experience.startDate,
											experience.endDate,
											experience.current
										)}{' '}
										năm kinh nghiệm
									</div>
									{experience.description && <div>{experience.description}</div>}
								</div>
							</div>
						</CardContent>
					</Card>
				))}

				<div
					className='border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors'
					onClick={handleAddExperience}
				>
					<Plus className='mx-auto h-8 w-8 text-gray-400' />
					<p className='mt-2 text-sm text-gray-500'>Thêm kinh nghiệm làm việc tại đây</p>
				</div>
			</div>

			<div className='flex gap-3 pt-4'>
				<Button
					className='w-80 mx-auto'
					variant='secondary'
					onClick={handleSubmitRegistration}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
				</Button>
			</div>

			<Dialog open={isAddingExperience} onOpenChange={setIsAddingExperience}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Thêm kinh nghiệm</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 py-4'>
						<p className='text-sm text-gray-500'>
							Hãy thêm vào kinh nghiệm làm việc của bạn để tăng cơ hội cạnh tranh.
						</p>
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='position'>Vị trí công việc</Label>
								<Input
									id='position'
									placeholder='Giáo viên tiếng Anh THPT'
									value={newExperience.position}
									onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='company'>Công ty / Tổ chức</Label>
								<Input
									id='company'
									placeholder='THPT Nguyễn Thái Bình'
									value={newExperience.company}
									onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Mô tả công việc</Label>
								<Textarea
									id='description'
									placeholder='Mô tả ngắn gọn về công việc của bạn'
									value={newExperience.description}
									onChange={(e) =>
										setNewExperience({ ...newExperience, description: e.target.value })
									}
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
													'w-full justify-start text-left font-normal',
													!newExperience.startDate && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{newExperience.startDate ? (
													format(newExperience.startDate, 'dd/MM/yyyy')
												) : (
													<span>dd/mm/yyyy</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												selected={newExperience.startDate || undefined}
												onSelect={(date) =>
													setNewExperience({ ...newExperience, startDate: date })
												}
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
													'w-full justify-start text-left font-normal',
													(!newExperience.endDate || newExperience.current) &&
														'text-muted-foreground'
												)}
												disabled={newExperience.current}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{newExperience.endDate && !newExperience.current ? (
													format(newExperience.endDate, 'dd/MM/yyyy')
												) : (
													<span>dd/mm/yyyy</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												selected={newExperience.endDate || undefined}
												onSelect={(date) =>
													setNewExperience({ ...newExperience, endDate: date })
												}
												initialFocus
												disabled={(date) =>
													newExperience.startDate ? date < newExperience.startDate : false
												}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>

							<div className='flex items-center space-x-2'>
								<Checkbox
									id='currently-working'
									checked={newExperience.current}
									onCheckedChange={(checked) =>
										setNewExperience({
											...newExperience,
											current: checked as boolean,
											endDate: checked ? null : newExperience.endDate,
										})
									}
								/>
								<label
									htmlFor='currently-working'
									className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
								>
									Tôi vẫn đang làm việc tại đây.
								</label>
							</div>
						</div>
					</div>
					<div className='flex justify-between'>
						<Button variant='dangerOutline' onClick={() => setIsAddingExperience(false)}>
							Hủy
						</Button>
						<Button
							variant='secondary'
							onClick={handleSaveExperience}
							disabled={!newExperience.company || !newExperience.position || !newExperience.startDate}
						>
							Lưu
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
