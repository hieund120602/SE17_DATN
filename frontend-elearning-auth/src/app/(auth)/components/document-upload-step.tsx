'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentUploadStepProps {
	onContinue: () => void;
	onBack: () => void;
}

export default function DocumentUploadStep({ onContinue, onBack }: DocumentUploadStepProps) {
	const [uploadedFiles, setUploadedFiles] = useState<
		{
			id: string;
			name: string;
			status: 'uploading' | 'success' | 'error';
		}[]
	>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
		const file = e.target.files?.[0];
		if (file) {
			// Simulate file upload
			setUploadedFiles((prev) => [
				...prev.filter((f) => f.id !== documentType),
				{
					id: documentType,
					name: file.name,
					status: 'uploading',
				},
			]);

			// Simulate upload completion after 2 seconds
			setTimeout(() => {
				setUploadedFiles((prev) => prev.map((f) => (f.id === documentType ? { ...f, status: 'success' } : f)));
			}, 2000);
		}
	};

	const isComplete = uploadedFiles.filter((f) => f.status === 'success').length >= 2;

	return (
		<div className='p-6 space-y-6'>
			<div className='text-center space-y-2'>
				<h2 className='text-2xl font-bold'>Tải lên giấy tờ</h2>
				<p className='text-gray-500'>Vui lòng tải lên các giấy tờ cần thiết để xác minh thông tin</p>
			</div>

			<Alert>
				<AlertCircle className='h-4 w-4' />
				<AlertDescription>
					Các giấy tờ của bạn sẽ được bảo mật và chỉ được sử dụng cho mục đích xác minh.
				</AlertDescription>
			</Alert>

			<div className='space-y-6'>
				<div className='space-y-3'>
					<Label htmlFor='id-upload'>CMND/CCCD/Hộ chiếu</Label>
					<div className='border-2 border-dashed rounded-lg p-6 text-center'>
						{uploadedFiles.find((f) => f.id === 'id')?.status === 'success' ? (
							<div className='flex items-center justify-center gap-2 text-green-600'>
								<Check className='h-5 w-5' />
								<span>Đã tải lên thành công</span>
							</div>
						) : uploadedFiles.find((f) => f.id === 'id')?.status === 'uploading' ? (
							<div className='flex items-center justify-center gap-2 text-orange-500'>
								<span>Đang tải lên...</span>
							</div>
						) : (
							<>
								<Upload className='mx-auto h-8 w-8 text-gray-400' />
								<p className='mt-2 text-sm text-gray-500'>Nhấp để tải lên hoặc kéo và thả</p>
								<p className='text-xs text-gray-400 mt-1'>PNG, JPG hoặc PDF (tối đa 5MB)</p>
							</>
						)}
						<input
							id='id-upload'
							type='file'
							className='hidden'
							accept='.jpg,.jpeg,.png,.pdf'
							onChange={(e) => handleFileChange(e, 'id')}
						/>
					</div>
				</div>

				<div className='space-y-3'>
					<Label htmlFor='degree-upload'>Bằng cấp/Chứng chỉ</Label>
					<div className='border-2 border-dashed rounded-lg p-6 text-center'>
						{uploadedFiles.find((f) => f.id === 'degree')?.status === 'success' ? (
							<div className='flex items-center justify-center gap-2 text-green-600'>
								<Check className='h-5 w-5' />
								<span>Đã tải lên thành công</span>
							</div>
						) : uploadedFiles.find((f) => f.id === 'degree')?.status === 'uploading' ? (
							<div className='flex items-center justify-center gap-2 text-orange-500'>
								<span>Đang tải lên...</span>
							</div>
						) : (
							<>
								<FileText className='mx-auto h-8 w-8 text-gray-400' />
								<p className='mt-2 text-sm text-gray-500'>Nhấp để tải lên hoặc kéo và thả</p>
								<p className='text-xs text-gray-400 mt-1'>PNG, JPG hoặc PDF (tối đa 5MB)</p>
							</>
						)}
						<input
							id='degree-upload'
							type='file'
							className='hidden'
							accept='.jpg,.jpeg,.png,.pdf'
							onChange={(e) => handleFileChange(e, 'degree')}
						/>
					</div>
				</div>

				<div className='flex gap-3 pt-2'>
					<Button type='button' variant='superOutline' className='flex-1' onClick={onBack}>
						Quay lại
					</Button>
					<Button
						className='flex-1 bg-orange-500 hover:bg-orange-600'
						disabled={!isComplete}
						onClick={onContinue}
					>
						Tiếp tục
					</Button>
				</div>
			</div>
		</div>
	);
}
