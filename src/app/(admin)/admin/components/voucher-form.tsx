import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, isValid, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DiscountType, VoucherCreateUpdateRequest } from '@/services/voucher-service';

// Define validation errors interface
interface ValidationErrors {
	code?: string;
	discountValue?: string;
	maximumDiscountAmount?: string;
	description?: string;
	validFrom?: string;
	validUntil?: string;
	totalUsageLimit?: string;
	perUserLimit?: string;
}

interface VoucherFormProps {
	formData: VoucherCreateUpdateRequest;
	errorMessage: string | null;
	isLoading: boolean;
	courses: any[];
	isLoadingCourses: boolean;
	combos: any[];
	isLoadingCombos: boolean;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSelectChange: (id: string, value: string) => void;
	onDateChange: any;
	onToggleCourse: (courseId: number) => void;
	onToggleCombo: (comboId: number) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	submitButtonText: string;
}

const VoucherForm: React.FC<VoucherFormProps> = ({
	formData,
	errorMessage,
	isLoading,
	courses,
	isLoadingCourses,
	combos,
	isLoadingCombos,
	onInputChange,
	onNumberInputChange,
	onSelectChange,
	onDateChange,
	onToggleCourse,
	onToggleCombo,
	onSubmit,
	onCancel,
	submitButtonText,
}) => {
	// State for validation errors
	const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	// Get today and tomorrow for date validation
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = addDays(today, 1);

	// Format date for display
	const formatDate = (dateString: string) => {
		try {
			return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi });
		} catch (e) {
			return 'Ngày không hợp lệ';
		}
	};

	// Convert ISO date string to Date object for calendar
	const isoStringToDate = (isoString: string): Date | undefined => {
		try {
			return parseISO(isoString);
		} catch (e) {
			return undefined;
		}
	};

	// Normalize date to ensure no timezone issues
	const normalizeDate = (date: Date | undefined): string => {
		if (!date) return new Date().toISOString();

		// Fix: Set time to 12:00:00 to avoid timezone issues
		const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
		return normalized.toISOString();
	};

	// Handle date change with fixed handler
	const handleDateChange = (id: string, date: Date | undefined) => {
		if (date) {
			const isoString = normalizeDate(date);
			onDateChange(id, isoString);

			// If changing validFrom, also update validUntil if needed
			if (id === 'validFrom') {
				const untilDate = isoStringToDate(formData.validUntil);
				if (untilDate && isBefore(untilDate, date)) {
					// If validUntil is before the new validFrom, update validUntil to be 30 days after validFrom
					const newUntilDate = addDays(date, 30);
					onDateChange('validUntil', normalizeDate(newUntilDate));
					setTouched((prev) => ({ ...prev, validUntil: true }));
				}
			}

			// Mark field as touched
			setTouched((prev) => ({ ...prev, [id]: true }));
		}
	};

	// Handle input field blur to mark as touched
	const handleBlur = (fieldName: string) => {
		setTouched((prev) => ({ ...prev, [fieldName]: true }));
	};

	// Custom handler for number inputs with validation
	const handleNumberWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		onNumberInputChange(e);

		// Mark field as touched
		setTouched((prev) => ({ ...prev, [id]: true }));
	};

	// Custom handler for text inputs with validation
	const handleTextWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;

		// For code field, automatically convert to uppercase
		if (id === 'code') {
			e.target.value = value.toUpperCase();
		}

		onInputChange(e);

		// Mark field as touched
		setTouched((prev) => ({ ...prev, [id]: true }));
	};

	// Check if date is disabled for validFrom (disable past dates and today)
	const isDateDisabledForValidFrom = (date: Date) => {
		return isBefore(date, tomorrow);
	};

	// Check if date is disabled for validUntil (disable dates before validFrom)
	const isDateDisabledForValidUntil = (date: Date) => {
		const fromDate = isoStringToDate(formData.validFrom);
		if (!fromDate) return isBefore(date, tomorrow);
		return isBefore(date, fromDate);
	};

	// Validate form data
	const validateForm = (): ValidationErrors => {
		const errors: ValidationErrors = {};

		// Code validation
		if (!formData.code || formData.code.trim() === '') {
			errors.code = 'Vui lòng nhập mã giảm giá';
		} else if (formData.code.length < 3 || formData.code.length > 20) {
			errors.code = 'Mã giảm giá phải có độ dài từ 3 đến 20 ký tự';
		} else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
			errors.code = 'Mã giảm giá chỉ được chứa chữ in hoa, số hoặc dấu gạch dưới';
		}

		// Description validation
		if (!formData.description || formData.description.trim() === '') {
			errors.description = 'Vui lòng nhập mô tả';
		}

		// Discount value validation
		if (formData.discountValue <= 0) {
			errors.discountValue = 'Giá trị giảm giá phải lớn hơn 0';
		} else if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
			errors.discountValue = 'Phần trăm giảm giá không thể vượt quá 100%';
		}

		// Maximum discount amount validation (for percentage)
		if (formData.discountType === 'PERCENTAGE' && formData.maximumDiscountAmount <= 0) {
			errors.maximumDiscountAmount = 'Vui lòng nhập mức giảm tối đa hợp lệ';
		}

		// Date validation
		try {
			const fromDate = parseISO(formData.validFrom);
			const untilDate = parseISO(formData.validUntil);

			if (!isValid(fromDate)) {
				errors.validFrom = 'Ngày bắt đầu không hợp lệ';
			} else if (isBefore(fromDate, tomorrow)) {
				errors.validFrom = 'Ngày bắt đầu phải từ ngày mai trở đi';
			}

			if (!isValid(untilDate)) {
				errors.validUntil = 'Ngày kết thúc không hợp lệ';
			} else if (isValid(fromDate) && isValid(untilDate) && !isAfter(untilDate, fromDate)) {
				errors.validUntil = 'Ngày kết thúc phải sau ngày bắt đầu';
			}
		} catch (e) {
			errors.validFrom = 'Ngày không hợp lệ';
			errors.validUntil = 'Ngày không hợp lệ';
		}

		// Usage limits validation
		if (formData.totalUsageLimit <= 0) {
			errors.totalUsageLimit = 'Tổng lượt sử dụng phải lớn hơn 0';
		}

		if (formData.perUserLimit <= 0) {
			errors.perUserLimit = 'Lượt sử dụng/người dùng phải lớn hơn 0';
		}

		return errors;
	};

	// Update validFrom on component mount to ensure it's valid
	useEffect(() => {
		const fromDate = isoStringToDate(formData.validFrom);
		if (!fromDate || isBefore(fromDate, tomorrow)) {
			// Set validFrom to tomorrow by default
			onDateChange('validFrom', normalizeDate(tomorrow));

			// If validUntil is not set or is before the new validFrom + 30 days
			const untilDate = isoStringToDate(formData.validUntil);
			const defaultUntilDate = addDays(tomorrow, 30);
			if (!untilDate || isBefore(untilDate, defaultUntilDate)) {
				onDateChange('validUntil', normalizeDate(defaultUntilDate));
			}
		}
	}, []);

	// Validate on form data change
	useEffect(() => {
		const errors = validateForm();
		setValidationErrors(errors);
	}, [formData]);

	// Custom form submit handler with validation
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Mark all fields as touched
		const allFields = {
			code: true,
			discountValue: true,
			maximumDiscountAmount: true,
			description: true,
			validFrom: true,
			validUntil: true,
			totalUsageLimit: true,
			perUserLimit: true,
		};

		setTouched(allFields);

		// Validate form
		const errors = validateForm();
		setValidationErrors(errors);

		// If no errors, submit form
		if (Object.keys(errors).length === 0) {
			onSubmit(e);
		}
	};

	// Helper function to determine if a field has an error
	const hasError = (field: keyof ValidationErrors): boolean => {
		return touched[field] === true && !!validationErrors[field];
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className='py-4 flex flex-col gap-4'>
				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='code'>
							Mã giảm giá <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='code'
							placeholder='WELCOME2024'
							value={formData.code}
							onChange={handleTextWithValidation}
							onBlur={() => handleBlur('code')}
							className={hasError('code') ? 'border-red-500' : ''}
							maxLength={20}
						/>
						{hasError('code') && <p className='text-red-500 text-sm mt-1'>{validationErrors.code}</p>}
						<p className='text-xs text-gray-500 mt-1'>
							Mã giảm giá phải từ 3-20 ký tự, chỉ bao gồm chữ in hoa, số hoặc dấu gạch dưới.
						</p>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='discountType'>
							Loại giảm giá <span className='text-red-500'>*</span>
						</Label>
						<Select
							value={formData.discountType}
							onValueChange={(value) => onSelectChange('discountType', value)}
						>
							<SelectTrigger className='h-10'>
								<SelectValue placeholder='Chọn loại giảm giá' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='PERCENTAGE'>Phần trăm (%)</SelectItem>
								<SelectItem value='FIXED_AMOUNT'>Số tiền cố định (VND)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='discountValue'>
							Giá trị giảm giá <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='discountValue'
							type='number'
							placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100000'}
							value={formData.discountValue || ''}
							onChange={handleNumberWithValidation}
							onBlur={() => handleBlur('discountValue')}
							className={hasError('discountValue') ? 'border-red-500' : ''}
						/>
						{hasError('discountValue') && (
							<p className='text-red-500 text-sm mt-1'>{validationErrors.discountValue}</p>
						)}
					</div>
					{formData.discountType === 'PERCENTAGE' && (
						<div className='flex flex-col gap-2'>
							<Label htmlFor='maximumDiscountAmount'>
								Giảm tối đa (VND) <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='maximumDiscountAmount'
								type='number'
								placeholder='100000'
								value={formData.maximumDiscountAmount || ''}
								onChange={handleNumberWithValidation}
								onBlur={() => handleBlur('maximumDiscountAmount')}
								className={hasError('maximumDiscountAmount') ? 'border-red-500' : ''}
							/>
							{hasError('maximumDiscountAmount') && (
								<p className='text-red-500 text-sm mt-1'>{validationErrors.maximumDiscountAmount}</p>
							)}
						</div>
					)}
					<div className='flex flex-col gap-2'>
						<Label htmlFor='minimumPurchaseAmount'>Đơn hàng tối thiểu (VND)</Label>
						<Input
							id='minimumPurchaseAmount'
							type='number'
							placeholder='0'
							value={formData.minimumPurchaseAmount || ''}
							onChange={onNumberInputChange}
						/>
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<Label htmlFor='description'>
						Mô tả <span className='text-red-500'>*</span>
					</Label>
					<Textarea
						id='description'
						placeholder='Ưu đãi đặc biệt...'
						value={formData.description}
						onChange={handleTextWithValidation}
						onBlur={() => handleBlur('description')}
						className={hasError('description') ? 'border-red-500' : ''}
					/>
					{hasError('description') && (
						<p className='text-red-500 text-sm mt-1'>{validationErrors.description}</p>
					)}
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label>
							Hiệu lực từ ngày <span className='text-red-500'>*</span>
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'superOutline'}
									className={`flex justify-start text-left font-normal h-10 ${
										hasError('validFrom') ? 'border-red-500' : ''
									}`}
									onClick={() => setTouched((prev) => ({ ...prev, validFrom: true }))}
								>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{formData.validFrom ? formatDate(formData.validFrom) : 'Chọn ngày'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={isoStringToDate(formData.validFrom)}
									onSelect={(date) => handleDateChange('validFrom', date)}
									disabled={isDateDisabledForValidFrom}
									initialFocus
									locale={vi}
								/>
							</PopoverContent>
						</Popover>
						{hasError('validFrom') && (
							<p className='text-red-500 text-sm mt-1'>{validationErrors.validFrom}</p>
						)}
						<p className='text-xs text-gray-500 mt-1'>Chỉ có thể chọn từ ngày mai trở đi.</p>
					</div>
					<div className='flex flex-col gap-2'>
						<Label>
							Hiệu lực đến ngày <span className='text-red-500'>*</span>
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={'superOutline'}
									className={`flex justify-start text-left font-normal h-10 ${
										hasError('validUntil') ? 'border-red-500' : ''
									}`}
									onClick={() => setTouched((prev) => ({ ...prev, validUntil: true }))}
								>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{formData.validUntil ? formatDate(formData.validUntil) : 'Chọn ngày'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={isoStringToDate(formData.validUntil)}
									onSelect={(date) => handleDateChange('validUntil', date)}
									disabled={isDateDisabledForValidUntil}
									initialFocus
									locale={vi}
								/>
							</PopoverContent>
						</Popover>
						{hasError('validUntil') && (
							<p className='text-red-500 text-sm mt-1'>{validationErrors.validUntil}</p>
						)}
						<p className='text-xs text-gray-500 mt-1'>Phải sau ngày bắt đầu hiệu lực.</p>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='totalUsageLimit'>
							Tổng lượt sử dụng tối đa <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='totalUsageLimit'
							type='number'
							placeholder='100'
							value={formData.totalUsageLimit || ''}
							onChange={handleNumberWithValidation}
							onBlur={() => handleBlur('totalUsageLimit')}
							className={hasError('totalUsageLimit') ? 'border-red-500' : ''}
						/>
						{hasError('totalUsageLimit') && (
							<p className='text-red-500 text-sm mt-1'>{validationErrors.totalUsageLimit}</p>
						)}
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='perUserLimit'>
							Lượt sử dụng/người dùng <span className='text-red-500'>*</span>
						</Label>
						<Input
							id='perUserLimit'
							type='number'
							placeholder='1'
							value={formData.perUserLimit || ''}
							onChange={handleNumberWithValidation}
							onBlur={() => handleBlur('perUserLimit')}
							className={hasError('perUserLimit') ? 'border-red-500' : ''}
						/>
						{hasError('perUserLimit') && (
							<p className='text-red-500 text-sm mt-1'>{validationErrors.perUserLimit}</p>
						)}
					</div>
				</div>

				{/* Applicable Courses & Combos - THESE SECTIONS ARE NOT VALIDATED AS REQUESTED */}
				<div className='grid grid-cols-1 gap-4'>
					<div className='flex flex-col gap-2'>
						<Label>Áp dụng cho khóa học</Label>
						<div className='border rounded-md p-3 h-40 overflow-y-auto'>
							{isLoadingCourses ? (
								<p className='text-sm text-gray-500'>Đang tải...</p>
							) : courses?.length > 0 ? (
								<div className='space-y-2'>
									{courses.map((course: any) => (
										<div key={course.id} className='flex items-center gap-2'>
											<Checkbox
												id={`course-${course.id}`}
												checked={formData.applicableCourseIds.includes(course.id)}
												onCheckedChange={() => onToggleCourse(course.id)}
											/>
											<Label htmlFor={`course-${course.id}`} className='text-sm'>
												{course.title}
											</Label>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-gray-500'>Không có khóa học nào</p>
							)}
						</div>
					</div>

					<div className='flex flex-col gap-2'>
						<Label>Áp dụng cho combo</Label>
						<div className='border rounded-md p-3 h-40 overflow-y-auto'>
							{isLoadingCombos ? (
								<p className='text-sm text-gray-500'>Đang tải...</p>
							) : combos?.length > 0 ? (
								<div className='space-y-2'>
									{combos.map((combo: any) => (
										<div key={combo.id} className='flex items-center gap-2'>
											<Checkbox
												id={`combo-${combo.id}`}
												checked={formData.applicableComboIds.includes(combo.id)}
												onCheckedChange={() => onToggleCombo(combo.id)}
											/>
											<Label htmlFor={`combo-${combo.id}`} className='text-sm'>
												{combo.title}
											</Label>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-gray-500'>Không có combo nào</p>
							)}
						</div>
					</div>
				</div>

				{/* Required fields note */}
				<div className='text-sm text-gray-500'>
					<span className='text-red-500'>*</span> Trường bắt buộc
				</div>

				{errorMessage && (
					<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'>
						<p className='font-medium'>Lỗi</p>
						<p>{errorMessage}</p>
					</div>
				)}
			</div>

			<div className='flex justify-end gap-2 pt-2'>
				<Button
					variant='primary'
					type='submit'
					disabled={isLoading || Object.keys(validationErrors).length > 0}
				>
					{isLoading ? 'Đang xử lý...' : submitButtonText}
				</Button>
			</div>
		</form>
	);
};

export default VoucherForm;
