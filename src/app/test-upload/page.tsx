'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X } from 'lucide-react';

export default function TestUploadPage() {
	const [files, setFiles] = useState<File[]>([]);
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		phoneNumber: '',
		password: '',
		confirmPassword: '',
		identityCardNumber: '',
		homeAddress: '',
		teachingRequirements: '',
	});

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = event.target.files;
		if (!selectedFiles) return;

		const newFiles = Array.from(selectedFiles);

		// Validate file types
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		const validFiles = newFiles.filter((file) => allowedTypes.includes(file.type));

		if (validFiles.length !== newFiles.length) {
			alert('Một số file không được hỗ trợ. Chỉ chấp nhận PDF, JPEG, JPG, PNG, WebP');
		}

		setFiles((prev) => [...prev, ...validFiles]);

		// Reset file input
		if (event.target) {
			event.target.value = '';
		}
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formDataObj = new FormData();

		// Add form fields
		Object.entries(formData).forEach(([key, value]) => {
			formDataObj.append(key, value);
		});

		// Add certificate URLs (assuming files have been uploaded and we have URLs)
		// For testing, you would need to upload files first and get URLs
		// files.forEach((file) => {
		// 	formDataObj.append('certificateUrls', url);
		// });

		// Add dummy data for complex objects
		formDataObj.append(
			'educationsJson',
			JSON.stringify([
				{
					institution: 'Test University',
					degree: 'Bachelor',
					fieldOfStudy: 'Computer Science',
					startDate: '2020-01-01',
					endDate: '2024-01-01',
					description: 'Test education',
				},
			])
		);

		formDataObj.append(
			'experiencesJson',
			JSON.stringify([
				{
					company: 'Test Company',
					position: 'Software Engineer',
					startDate: '2024-01-01',
					endDate: null,
					description: 'Test experience',
					current: true,
				},
			])
		);

		try {
			const response = await fetch('http://localhost:8082/api/auth/register/tutor', {
				method: 'POST',
				body: formDataObj,
			});

			if (response.ok) {
				const result = await response.json();
				alert('Đăng ký thành công: ' + JSON.stringify(result));
			} else {
				const error = await response.text();
				alert('Lỗi: ' + error);
			}
		} catch (error) {
			console.error('Error:', error);
			alert('Lỗi kết nối: ' + error);
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className='container mx-auto py-8 max-w-2xl'>
			<h1 className='text-3xl font-bold mb-6'>Test Upload File</h1>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Basic Info */}
				<div className='space-y-4'>
					<h2 className='text-xl font-semibold'>Thông tin cơ bản</h2>

					<div>
						<label className='block text-sm font-medium mb-1'>Họ tên</label>
						<Input
							value={formData.fullName}
							onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Email</label>
						<Input
							type='email'
							value={formData.email}
							onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Số điện thoại</label>
						<Input
							value={formData.phoneNumber}
							onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Mật khẩu</label>
						<Input
							type='password'
							value={formData.password}
							onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Xác nhận mật khẩu</label>
						<Input
							type='password'
							value={formData.confirmPassword}
							onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Số căn cước công dân</label>
						<Input
							value={formData.identityCardNumber}
							onChange={(e) => setFormData((prev) => ({ ...prev, identityCardNumber: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Địa chỉ nhà</label>
						<Textarea
							value={formData.homeAddress}
							onChange={(e) => setFormData((prev) => ({ ...prev, homeAddress: e.target.value }))}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Yêu cầu giảng dạy</label>
						<Textarea
							value={formData.teachingRequirements}
							onChange={(e) => setFormData((prev) => ({ ...prev, teachingRequirements: e.target.value }))}
						/>
					</div>
				</div>

				{/* File Upload */}
				<div className='space-y-4'>
					<h2 className='text-xl font-semibold'>Upload chứng chỉ</h2>

					<div>
						<input
							type='file'
							multiple
							accept='.pdf,.jpg,.jpeg,.png,.webp'
							onChange={handleFileSelect}
							className='hidden'
							id='file-upload'
						/>
						<label
							htmlFor='file-upload'
							className='block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50'
						>
							<Upload className='mx-auto h-8 w-8 text-gray-400 mb-2' />
							<span className='text-sm text-gray-600'>Nhấp để chọn file hoặc kéo thả vào đây</span>
							<p className='text-xs text-gray-500 mt-1'>Hỗ trợ: PDF, JPG, PNG, WebP (tối đa 10MB)</p>
						</label>
					</div>

					{/* File List */}
					{files.length > 0 && (
						<div className='space-y-2'>
							<h3 className='text-sm font-medium'>Files đã chọn ({files.length})</h3>
							{files.map((file, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'
								>
									<div className='flex items-center gap-3'>
										<FileText className='h-5 w-5 text-blue-600' />
										<div>
											<p className='text-sm font-medium'>{file.name}</p>
											<p className='text-xs text-gray-500'>
												{formatFileSize(file.size)} • {file.type}
											</p>
										</div>
									</div>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => removeFile(index)}
										className='text-red-600 hover:text-red-800'
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>

				<Button type='submit' className='w-full'>
					Gửi đăng ký
				</Button>
			</form>
		</div>
	);
}
