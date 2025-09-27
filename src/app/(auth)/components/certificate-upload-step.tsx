'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useTutorRegistrationStore } from '@/store/tutor-registration-store';
import { ArrowLeft, ArrowRight, Upload, X, FileText, Plus } from 'lucide-react';
import AuthService from '@/lib/auth-service';

interface CertificateUploadStepProps {
	onContinue: () => void;
	onBack: () => void;
}

export default function CertificateUploadStep({ onContinue, onBack }: CertificateUploadStepProps) {
	const { certificateUrls, addCertificateUrl, removeCertificateUrl } = useTutorRegistrationStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState('');
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];

		// Validate file type (only images for easier Cloudinary handling)
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

		if (!allowedTypes.includes(file.type)) {
			setError('Chỉ chấp nhận file hình ảnh (JPEG, JPG, PNG, WebP)');
			return;
		}

		// Validate file size (max 5MB for images)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			setError('Hình ảnh quá lớn. Kích thước tối đa là 5MB');
			return;
		}

		setIsUploading(true);
		setError('');

		try {
			// Upload file to server
			const result = await AuthService.uploadCertificate(file);
			addCertificateUrl(result.certificateUrl);
		} catch (error: any) {
			console.error('Upload error:', error);
			setError('Lỗi khi tải lên file. Vui lòng thử lại.');
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleRemoveCertificate = (index: number) => {
		removeCertificateUrl(index);
	};

	const handleContinue = () => {
		// Allow continuing even without certificates
		onContinue();
	};

	const getFileIcon = () => {
		return '🖼️';
	};

	return (
		<div className='p-6 space-y-6 w-full max-w-2xl mx-auto'>
			<div className='text-center'>
				<h2 className='text-2xl font-bold text-gray-900 mb-2'>Chứng chỉ và bằng cấp</h2>
				<p className='text-gray-600'>
					Tải lên hình ảnh chứng chỉ và bằng cấp liên quan đến giảng dạy tiếng Nhật (không bắt buộc)
				</p>
			</div>

			<div className='space-y-4'>
				{/* File upload area */}
				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-700'>Tải lên hình ảnh chứng chỉ mới</label>

					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type='file'
						accept='.jpg,.jpeg,.png,.webp'
						onChange={handleFileSelect}
						className='hidden'
						disabled={isUploading}
					/>

					{/* Upload button */}
					<Button
						type='button'
						variant='superOutline'
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
						className='w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50'
					>
						<div className='flex flex-col items-center gap-2'>
							{isUploading ? (
								<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600'></div>
							) : (
								<Upload size={24} className='text-gray-400' />
							)}
							<div className='text-center'>
								<p className='text-sm font-medium text-gray-600'>
									{isUploading ? 'Đang tải lên...' : 'Nhấp để chọn file hoặc kéo thả vào đây'}
								</p>
								<p className='text-xs text-gray-500 mt-1'>Hỗ trợ: JPG, PNG, WebP (tối đa 5MB)</p>
							</div>
						</div>
					</Button>

					{error && <p className='text-sm text-red-600'>{error}</p>}
				</div>

				{/* Existing certificates */}
				{certificateUrls.length > 0 && (
					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-700'>
							Hình ảnh chứng chỉ đã tải lên ({certificateUrls.length})
						</label>
						<div className='space-y-2'>
							{certificateUrls.map((url, index) => (
								<div
									key={`${url}-${index}`}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'
								>
									<div className='flex items-center gap-3 flex-1 min-w-0'>
										<span className='text-2xl'>{getFileIcon()}</span>
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-medium text-gray-900 truncate'>
												Chứng chỉ {index + 1}
											</p>
											<p className='text-xs text-gray-500'>Đã tải lên thành công</p>
										</div>
									</div>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => handleRemoveCertificate(index)}
										className='text-red-600 hover:text-red-800 hover:bg-red-50'
									>
										<X size={16} />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* No certificates message */}
				{certificateUrls.length === 0 && (
					<div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
						<FileText size={48} className='mx-auto text-gray-400 mb-2' />
						<p className='text-gray-500'>Chưa có hình ảnh chứng chỉ nào được tải lên</p>
						<p className='text-sm text-gray-400 mt-1'>
							Bạn có thể tải lên hình ảnh chứng chỉ sau khi hoàn tất đăng ký
						</p>
					</div>
				)}
			</div>

			<div className='flex justify-between pt-6'>
				<Button type='button' variant='superOutline' onClick={onBack} className='flex items-center gap-2'>
					<ArrowLeft size={16} />
					Quay lại
				</Button>

				<Button type='button' onClick={handleContinue} className='flex items-center gap-2'>
					Tiếp tục
					<ArrowRight size={16} />
				</Button>
			</div>
		</div>
	);
}
