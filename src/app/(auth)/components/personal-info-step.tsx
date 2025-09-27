'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTutorRegistrationStore } from '@/store/tutor-registration-store';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PersonalInfoStepProps {
	onContinue: () => void;
	onBack: () => void;
}

export default function PersonalInfoStep({ onContinue, onBack }: PersonalInfoStepProps) {
	const { identityCardNumber, homeAddress, setPersonalInfo } = useTutorRegistrationStore();

	const [formData, setFormData] = useState({
		identityCardNumber: identityCardNumber || '',
		homeAddress: homeAddress || '',
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.identityCardNumber.trim()) {
			newErrors.identityCardNumber = 'Số căn cước công dân là bắt buộc';
		} else if (!/^[0-9]{9,12}$/.test(formData.identityCardNumber.trim())) {
			newErrors.identityCardNumber = 'Số căn cước công dân phải có 9-12 chữ số';
		}

		if (!formData.homeAddress.trim()) {
			newErrors.homeAddress = 'Địa chỉ nhà là bắt buộc';
		} else if (formData.homeAddress.trim().length < 10) {
			newErrors.homeAddress = 'Địa chỉ nhà phải có ít nhất 10 ký tự';
		} else if (formData.homeAddress.trim().length > 500) {
			newErrors.homeAddress = 'Địa chỉ nhà không được vượt quá 500 ký tự';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (validateForm()) {
			setPersonalInfo(formData);
			onContinue();
		}
	};

	return (
		<div className='p-6 space-y-6 w-full max-w-2xl mx-auto'>
			<div className='text-center'>
				<h2 className='text-2xl font-bold text-gray-900 mb-2'>Thông tin cá nhân</h2>
				<p className='text-gray-600'>Vui lòng cung cấp thông tin cá nhân để hoàn tất đăng ký</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='space-y-2'>
					<label htmlFor='identityCardNumber' className='text-sm font-medium text-gray-700'>
						Số căn cước công dân <span className='text-red-500'>*</span>
					</label>
					<Input
						id='identityCardNumber'
						name='identityCardNumber'
						type='text'
						value={formData.identityCardNumber}
						onChange={handleChange}
						placeholder='Nhập số căn cước công dân (9-12 chữ số)'
						className={errors.identityCardNumber ? 'border-red-500' : ''}
					/>
					{errors.identityCardNumber && <p className='text-sm text-red-600'>{errors.identityCardNumber}</p>}
				</div>

				<div className='space-y-2'>
					<label htmlFor='homeAddress' className='text-sm font-medium text-gray-700'>
						Địa chỉ nhà <span className='text-red-500'>*</span>
					</label>
					<Textarea
						id='homeAddress'
						name='homeAddress'
						value={formData.homeAddress}
						onChange={handleChange}
						placeholder='Nhập địa chỉ nhà đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)'
						rows={3}
						className={errors.homeAddress ? 'border-red-500' : ''}
					/>
					{errors.homeAddress && <p className='text-sm text-red-600'>{errors.homeAddress}</p>}
				</div>

				<div className='flex justify-between pt-6'>
					<Button type='button' variant='superOutline' onClick={onBack} className='flex items-center gap-2'>
						<ArrowLeft size={16} />
						Quay lại
					</Button>

					<Button type='submit' className='flex items-center gap-2'>
						Tiếp tục
						<ArrowRight size={16} />
					</Button>
				</div>
			</form>
		</div>
	);
}
