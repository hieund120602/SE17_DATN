'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ComboService from '@/services/combo-service';
import CourseService from '@/services/course-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Image, Save, X, Loader2, Search, Plus, CheckCircle, Package } from 'lucide-react';

const UpdateComboForm = ({ isOpen, onClose, comboId, onSuccess }: any) => {
	const queryClient = useQueryClient();
	const [formValues, setFormValues] = useState<any>({
		title: '',
		description: '',
		originalPrice: 0,
		discountPrice: 0,
		discountPercentage: 0,
		thumbnailUrl: '',
		isActive: true,
		courseIds: [],
	});
	const [coursePage, setCoursePage] = useState(0);
	const [coursePageSize, setCoursePagSize] = useState(20);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCourses, setSelectedCourses] = useState<any>([]);
	const thumbnailFileRef = useRef<any>(null);

	// Fetch combo data
	const { data: comboData, isLoading: isLoadingCombo } = useQuery<any>({
		queryKey: ['combo', comboId],
		queryFn: () => ComboService.getComboById(comboId),
		enabled: !!comboId,
	});

	// Fetch courses
	const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
		queryKey: ['courses', 'all', coursePage, coursePageSize, searchQuery],
		queryFn: () => CourseService.getAllCourses(coursePage, coursePageSize, searchQuery),
	});

	// Update combo mutation
	const updateComboMutation = useMutation({
		mutationFn: (data: any) => ComboService.updateCombo(data.comboId, data.comboData),
		onSuccess: () => {
			toast.success('Combo khóa học đã được cập nhật thành công!');
			queryClient.invalidateQueries({ queryKey: ['combos'] });
			queryClient.invalidateQueries({ queryKey: ['combo', comboId] });
			onSuccess && onSuccess();
			onClose && onClose();
		},
		onError: (error) => {
			toast.error(`Không thể cập nhật combo khóa học: ${error.message}`);
		},
	});

	// Upload thumbnail mutation
	const uploadThumbnailMutation = useMutation({
		mutationFn: ({ comboId, file }: any) => ComboService.uploadThumbnail(comboId, file),
		onSuccess: (data) => {
			toast.success('Ảnh bìa đã được tải lên thành công!');
			setFormValues((prev: any) => ({ ...prev, thumbnailUrl: data.thumbnailUrl }));
		},
		onError: (error) => {
			toast.error(`Không thể tải lên ảnh bìa: ${error.message}`);
		},
	});

	// Initialize form values when combo data is loaded
	useEffect(() => {
		if (comboData) {
			setFormValues({
				title: comboData.title || '',
				description: comboData.description || '',
				originalPrice: comboData.originalPrice || 0,
				discountPrice: comboData.discountPrice || 0,
				discountPercentage: comboData.discountPercentage || 0,
				thumbnailUrl: comboData.thumbnailUrl || '',
				isActive: comboData.active || false,
				courseIds: comboData.courses?.map((course: any) => course.id) || [],
			});

			// Set selected courses
			if (comboData.courses && comboData.courses.length > 0) {
				setSelectedCourses(comboData.courses);
			}
		}
	}, [comboData]);

	// Update selected courses when course IDs change
	useEffect(() => {
		if (coursesData && coursesData.content) {
			const newCourses = coursesData.content.filter(
				(course) =>
					formValues.courseIds.includes(course.id) && !selectedCourses.some((sc: any) => sc.id === course.id)
			);

			if (newCourses.length > 0) {
				setSelectedCourses((prev: any) => [...prev, ...newCourses]);
			}
		}
	}, [coursesData, formValues.courseIds, selectedCourses]);

	// Handle form input changes
	const handleInputChange = (e: any) => {
		const { name, value, type } = e.target;

		if (type === 'number') {
			setFormValues((prev: any) => ({ ...prev, [name]: parseFloat(value) || 0 }));
		} else if (type === 'checkbox') {
			setFormValues((prev: any) => ({ ...prev, [name]: e.target.checked }));
		} else {
			setFormValues((prev: any) => ({ ...prev, [name]: value }));
		}

		// Auto-calculate discount percentage
		if (name === 'originalPrice' || name === 'discountPrice') {
			const originalPrice = name === 'originalPrice' ? parseFloat(value) : formValues.originalPrice;
			const discountPrice = name === 'discountPrice' ? parseFloat(value) : formValues.discountPrice;

			if (originalPrice > 0 && discountPrice > 0) {
				const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
				setFormValues((prev: any) => ({ ...prev, discountPercentage }));
			}
		}
	};

	// Handle course selection
	const handleCourseSelection = (course: any) => {
		setFormValues((prev: any) => {
			const courseIds = [...prev.courseIds];
			const courseIndex = courseIds.indexOf(course.id);

			if (courseIndex === -1) {
				courseIds.push(course.id);
				// Add to selected courses for display
				setSelectedCourses((prev: any) => {
					if (prev.find((c: any) => c.id === course.id)) return prev;
					return [...prev, course];
				});
			} else {
				courseIds.splice(courseIndex, 1);
				// Remove from selected courses
				setSelectedCourses((prev: any) => prev.filter((c: any) => c.id !== course.id));
			}

			return { ...prev, courseIds };
		});
	};

	// Handle thumbnail upload
	const handleThumbnailUpload = (e: any) => {
		const file = e.target.files[0];
		if (!file) return;

		if (comboId) {
			uploadThumbnailMutation.mutate({ comboId, file });
		} else {
			// Preview image for new combo
			const reader = new FileReader();
			reader.onload = () => {
				setFormValues((prev: any) => ({ ...prev, thumbnailUrl: reader.result }));
			};
			reader.readAsDataURL(file);
		}
	};

	// Calculate total original and discounted prices
	const calculateTotalPrices = () => {
		if (!selectedCourses || selectedCourses.length === 0) {
			return { original: 0, discount: 0 };
		}

		const originalTotal = selectedCourses.reduce((sum: any, course: any) => sum + (course.price || 0), 0);

		// Return both original total and the form values for discount
		return {
			original: originalTotal,
			discount: formValues.discountPrice || 0,
		};
	};

	// Format currency
	const formatCurrency = (amount: any) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	// Handle search input
	const handleSearchChange = (e: any) => {
		setSearchQuery(e.target.value);
		setCoursePage(0); // Reset to first page when searching
	};

	// Handle form submission for update
	const handleUpdateSubmit = (e: any) => {
		e.preventDefault();

		// Validation
		if (formValues.courseIds.length === 0) {
			toast.error('Vui lòng chọn ít nhất một khóa học cho combo');
			return;
		}

		if (formValues.originalPrice <= 0 || formValues.discountPrice <= 0) {
			toast.error('Giá gốc và giá khuyến mãi phải lớn hơn 0');
			return;
		}

		if (formValues.discountPrice >= formValues.originalPrice) {
			toast.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
			return;
		}

		// Format validUntil as ISO 8601 with timezone
		let formattedData = {
			...formValues,
			discountPercentage: calculateDiscountPercentage(formValues.originalPrice, formValues.discountPrice),
		};

		// Convert date string to ISO format with timezone
		if (formValues.validUntil) {
			// Create a date object from the input value (which is in YYYY-MM-DD format)
			const date = new Date(formValues.validUntil);
			// Set the time to end of day in local timezone
			date.setHours(23, 59, 59, 999);
			// Convert to ISO string with timezone
			formattedData.validUntil = date.toISOString();
		}

		updateComboMutation.mutate({
			comboId,
			comboData: formattedData,
		});
	};

	// Helper function to calculate discount percentage
	const calculateDiscountPercentage = (originalPrice: any, discountPrice: any) => {
		if (originalPrice <= 0 || discountPrice <= 0) return 0;
		return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
	};

	if (isLoadingCombo) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className='max-w-3xl'>
					<div className='flex justify-center items-center p-10'>
						<Loader2 className='h-8 w-8 animate-spin text-[#58cc02]' />
						<p className='ml-2'>Đang tải thông tin combo...</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-[#58cc02] text-xl'>Cập nhật Combo Khóa học</DialogTitle>
					<DialogDescription>Chỉnh sửa thông tin combo khóa học</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleUpdateSubmit} className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-4 md:col-span-2'>
							<Label htmlFor='title' className='text-sm font-medium'>
								Tiêu đề <span className='text-red-600'>*</span>
							</Label>
							<Input
								id='title'
								name='title'
								value={formValues.title}
								onChange={handleInputChange}
								placeholder='Nhập tiêu đề combo'
								required
								className='w-full'
							/>
						</div>

						<div className='space-y-4 md:col-span-2'>
							<Label htmlFor='description' className='text-sm font-medium'>
								Mô tả <span className='text-red-600'>*</span>
							</Label>
							<Textarea
								id='description'
								name='description'
								value={formValues.description}
								onChange={handleInputChange}
								placeholder='Nhập mô tả cho combo'
								required
								className='w-full min-h-[120px]'
							/>
						</div>

						<div className='space-y-4'>
							<Label htmlFor='originalPrice' className='text-sm font-medium'>
								Giá gốc (VNĐ) <span className='text-red-600'>*</span>
							</Label>
							<Input
								id='originalPrice'
								name='originalPrice'
								type='number'
								min='0'
								step='1000'
								value={formValues.originalPrice}
								onChange={handleInputChange}
								required
								className='w-full'
							/>
						</div>

						<div className='space-y-4'>
							<Label htmlFor='discountPrice' className='text-sm font-medium'>
								Giá khuyến mãi (VNĐ) <span className='text-red-600'>*</span>
							</Label>
							<Input
								id='discountPrice'
								name='discountPrice'
								type='number'
								min='0'
								step='1000'
								value={formValues.discountPrice}
								onChange={handleInputChange}
								required
								className='w-full'
							/>
						</div>

						<div className='space-y-4'>
							<Label htmlFor='discountPercentage' className='text-sm font-medium'>
								Phần trăm giảm giá
							</Label>
							<Input
								id='discountPercentage'
								name='discountPercentage'
								type='number'
								min='0'
								max='100'
								value={formValues.discountPercentage}
								readOnly
								className='w-full bg-gray-50'
							/>
							<p className='text-xs text-gray-500'>Tự động tính toán từ giá gốc và giá khuyến mãi</p>
						</div>

						<div className='space-y-4'>
							<Label htmlFor='thumbnailUpload' className='text-sm font-medium'>
								Ảnh bìa
							</Label>
							<div className='flex items-center gap-4'>
								<div className='h-24 w-40 bg-gray-100 rounded-md flex items-center justify-center relative overflow-hidden border'>
									{formValues.thumbnailUrl ? (
										<>
											<img
												src={formValues.thumbnailUrl}
												alt='Thumbnail preview'
												className='h-full w-full object-cover'
											/>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white'
												onClick={() =>
													setFormValues((prev: any) => ({ ...prev, thumbnailUrl: '' }))
												}
											>
												<X className='h-3 w-3' />
											</Button>
										</>
									) : (
										<Image className='h-8 w-8 text-gray-400' />
									)}
								</div>
								<div>
									<input
										ref={thumbnailFileRef}
										id='thumbnailUpload'
										type='file'
										accept='image/*'
										onChange={handleThumbnailUpload}
										className='hidden'
									/>
									<Button
										type='button'
										variant='superOutline'
										onClick={() => thumbnailFileRef.current?.click()}
										disabled={uploadThumbnailMutation.isPending}
									>
										{uploadThumbnailMutation.isPending ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Đang tải lên...
											</>
										) : (
											<>
												<Image className='mr-2 h-4 w-4' />
												Chọn ảnh
											</>
										)}
									</Button>
								</div>
							</div>
						</div>

						<div className='space-y-4 flex items-center'>
							<Label className='text-sm font-medium flex items-center cursor-pointer'>
								<input
									type='checkbox'
									name='isActive'
									checked={formValues.isActive}
									onChange={handleInputChange}
									className='rounded border-gray-300 text-[#58cc02] focus:ring-[#58cc02] mr-2 h-4 w-4'
								/>
								Kích hoạt combo này
							</Label>
						</div>
					</div>

					{/* Course selection section */}
					<div className='space-y-4 border-t pt-6'>
						<div className='flex justify-between items-center'>
							<h3 className='font-medium text-lg'>Chọn khóa học cho combo</h3>
							<div className='relative'>
								<Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
								<Input
									type='text'
									placeholder='Tìm kiếm khóa học...'
									value={searchQuery}
									onChange={handleSearchChange}
									className='pl-9 w-64'
								/>
							</div>
						</div>

						{selectedCourses.length > 0 && (
							<div className='bg-green-50 border border-green-100 rounded-md p-4 mb-4'>
								<h4 className='font-medium text-[#58cc02] mb-2 flex items-center gap-2'>
									<CheckCircle className='h-4 w-4' />
									Đã chọn {selectedCourses.length} khóa học
								</h4>
								<div className='grid grid-cols-1 gap-2 mt-3'>
									{selectedCourses.map((course: any) => (
										<div
											key={course.id}
											className='flex justify-between items-center p-2 bg-white rounded border'
										>
											<div className='flex items-center gap-2'>
												<div className='h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
													{course.thumbnailUrl ? (
														<img
															src={course.thumbnailUrl}
															alt={course.title}
															className='h-full w-full object-cover'
														/>
													) : (
														<div className='h-full w-full flex items-center justify-center'>
															<Image className='h-5 w-5 text-gray-400' />
														</div>
													)}
												</div>
												<div className='min-w-0'>
													<p className='font-medium text-sm truncate'>{course.title}</p>
													<div className='flex items-center gap-2 text-xs text-gray-500'>
														<Badge
															variant='outline'
															className='bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1 py-0 h-4'
														>
															{course.level?.name || 'N/A'}
														</Badge>
														<span>{formatCurrency(course.price || 0)}</span>
													</div>
												</div>
											</div>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='h-8 w-8 p-0 text-gray-500 hover:text-red-600'
												onClick={() => handleCourseSelection(course)}
											>
												<X className='h-4 w-4' />
											</Button>
										</div>
									))}
								</div>

								<div className='mt-4 pt-3 border-t border-green-100'>
									<div className='flex justify-between items-center text-sm'>
										<span className='text-gray-500'>Tổng giá gốc:</span>
										<span>{formatCurrency(calculateTotalPrices().original)}</span>
									</div>
									<div className='flex justify-between items-center text-sm mt-1'>
										<span className='text-gray-500'>Giá combo:</span>
										<span className='font-medium text-[#ff4b4b]'>
											{formatCurrency(calculateTotalPrices().discount)}
										</span>
									</div>
									<div className='flex justify-between items-center text-sm mt-1'>
										<span className='text-gray-500'>Tiết kiệm:</span>
										<span className='font-medium text-[#58cc02]'>
											{formatCurrency(
												calculateTotalPrices().original - calculateTotalPrices().discount
											)}{' '}
											({formValues.discountPercentage}%)
										</span>
									</div>
								</div>
							</div>
						)}

						{isLoadingCourses ? (
							<div className='text-center py-8'>
								<Loader2 className='h-8 w-8 animate-spin mx-auto text-[#58cc02]' />
								<p className='text-gray-500 mt-2'>Đang tải danh sách khóa học...</p>
							</div>
						) : coursesData && coursesData.content && coursesData.content.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
								{coursesData.content.map((course) => {
									const isSelected = formValues.courseIds.includes(course.id);
									return (
										<Card
											key={course.id}
											className={`overflow-hidden transition-all cursor-pointer ${
												isSelected ? 'ring-2 ring-[#58cc02] bg-green-50' : 'hover:bg-gray-50'
											}`}
											onClick={() => handleCourseSelection(course)}
										>
											<div className='flex p-3'>
												<div className='h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
													{course.thumbnailUrl ? (
														<img
															src={course.thumbnailUrl}
															alt={course.title}
															className='h-full w-full object-cover'
														/>
													) : (
														<div className='h-full w-full flex items-center justify-center'>
															<Image className='h-6 w-6 text-gray-400' />
														</div>
													)}
												</div>
												<CardContent className='p-0 pl-3 flex-1'>
													<h4 className='font-medium line-clamp-2'>{course.title}</h4>
													<div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
														<Badge
															variant='outline'
															className='bg-blue-50 text-blue-700 border-blue-200'
														>
															{course.level?.name || 'N/A'}
														</Badge>
														<span>{course.tutor?.fullName || 'N/A'}</span>
													</div>
													<div className='flex justify-between items-center mt-1'>
														<span className='font-medium'>
															{formatCurrency(course.price || 0)}
														</span>
														{isSelected && (
															<CheckCircle className='h-5 w-5 text-[#58cc02]' />
														)}
													</div>
												</CardContent>
											</div>
										</Card>
									);
								})}
							</div>
						) : (
							<div className='text-center py-8 bg-gray-50 rounded-lg'>
								<Package className='h-12 w-12 text-gray-300 mx-auto mb-2' />
								<p className='text-gray-500'>Không tìm thấy khóa học nào.</p>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button type='button' variant='superOutline' onClick={onClose}>
							Hủy
						</Button>
						<Button
							type='submit'
							className='bg-[#58cc02] hover:bg-[#46a302] text-white'
							disabled={updateComboMutation.isPending}
						>
							{updateComboMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang cập nhật...
								</>
							) : (
								<>
									<Save className='mr-2 h-4 w-4' />
									Cập nhật
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default UpdateComboForm;
