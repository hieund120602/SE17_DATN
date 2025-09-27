'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Download, ExternalLink, Eye, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import DocumentService, { DocumentAccessResponse, ResourceResponse } from '@/services/document-service';
import { toast } from '@/hooks/use-toast';

interface DocumentViewerProps {
	resourceId: string;
	fileName?: string;
	description?: string;
	showPreview?: boolean;
	variant?: 'card' | 'button' | 'inline';
	size?: 'sm' | 'md' | 'lg';
}

export function DocumentViewer({
	resourceId,
	fileName = 'Tài liệu',
	description,
	showPreview = true,
	variant = 'card',
	size = 'md',
}: DocumentViewerProps) {
	const [documentAccess, setDocumentAccess] = useState<DocumentAccessResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [previewOpen, setPreviewOpen] = useState(false);

	useEffect(() => {
		checkAccess();
	}, [resourceId]);

	const checkAccess = async () => {
		try {
			const access = await DocumentService.checkDocumentAccess(resourceId);
			setHasAccess(access);
		} catch (error) {
			setHasAccess(false);
		}
	};

	const loadDocument = async () => {
		if (documentAccess) return documentAccess;

		try {
			setLoading(true);
			const access = await DocumentService.getDocument(resourceId);
			setDocumentAccess(access);
			setHasAccess(access.accessGranted);
			return access;
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể truy cập tài liệu',
				variant: 'destructive',
			});
			setHasAccess(false);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async () => {
		try {
			await DocumentService.downloadDocument(resourceId, fileName);
			toast({
				title: 'Thành công',
				description: 'Đã tải xuống tài liệu',
			});
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể tải xuống tài liệu',
				variant: 'destructive',
			});
		}
	};

	const handleOpenInNewTab = async () => {
		try {
			await DocumentService.openDocument(resourceId);
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Không thể mở tài liệu',
				variant: 'destructive',
			});
		}
	};

	const handlePreview = async () => {
		const access = await loadDocument();
		if (access && access.accessGranted) {
			setPreviewOpen(true);
		}
	};

	const getFileType = (filename: string) => {
		const extension = filename.split('.').pop()?.toLowerCase();
		switch (extension) {
			case 'pdf':
				return 'PDF';
			case 'doc':
			case 'docx':
				return 'Word';
			case 'xls':
			case 'xlsx':
				return 'Excel';
			case 'ppt':
			case 'pptx':
				return 'PowerPoint';
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif':
				return 'Hình ảnh';
			default:
				return 'Tài liệu';
		}
	};

	const isPdf = (filename: string) => {
		return filename.toLowerCase().endsWith('.pdf');
	};

	const isImage = (filename: string) => {
		const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
		const extension = filename.split('.').pop()?.toLowerCase();
		return extension && imageExtensions.includes(extension);
	};

	const renderAccessStatus = () => {
		if (hasAccess === null) {
			return (
				<div className='flex items-center gap-2 text-gray-500'>
					<Loader2 className='h-4 w-4 animate-spin' />
					<span className='text-sm'>Đang kiểm tra quyền truy cập...</span>
				</div>
			);
		}

		if (hasAccess) {
			return (
				<div className='flex items-center gap-2 text-green-600'>
					<CheckCircle className='h-4 w-4' />
					<span className='text-sm'>Có quyền truy cập</span>
				</div>
			);
		}

		return (
			<div className='flex items-center gap-2 text-red-600'>
				<Lock className='h-4 w-4' />
				<span className='text-sm'>Không có quyền truy cập</span>
			</div>
		);
	};

	const renderActions = () => {
		if (!hasAccess) {
			return (
				<div className='flex items-center gap-2 text-gray-400'>
					<Lock className='h-4 w-4' />
					<span className='text-sm'>Bị khóa</span>
				</div>
			);
		}

		const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

		return (
			<div className='flex items-center gap-2'>
				{showPreview && (
					<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
						<DialogTrigger asChild>
							<Button variant='superOutline' size={buttonSize} onClick={handlePreview} disabled={loading}>
								{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Eye className='h-4 w-4' />}
								{size !== 'sm' && <span className='ml-2'>Xem</span>}
							</Button>
						</DialogTrigger>
						<DialogContent className='max-w-4xl max-h-[90vh]'>
							<DialogHeader>
								<DialogTitle>{fileName}</DialogTitle>
								{description && <DialogDescription>{description}</DialogDescription>}
							</DialogHeader>
							<div className='flex justify-center overflow-auto'>
								{documentAccess?.signedUrl && (
									<>
										{isPdf(fileName) ? (
											<iframe
												src={documentAccess.signedUrl}
												className='w-full h-96 border rounded'
												title={fileName}
											/>
										) : isImage(fileName) ? (
											<img
												src={documentAccess.signedUrl}
												alt={fileName}
												className='max-w-full max-h-96 object-contain'
											/>
										) : (
											<div className='text-center p-8'>
												<FileText className='h-16 w-16 text-gray-400 mx-auto mb-4' />
												<p className='text-gray-600'>
													Không thể xem trước loại file này. Vui lòng tải xuống để xem.
												</p>
												<Button className='mt-4' onClick={handleDownload}>
													<Download className='h-4 w-4 mr-2' />
													Tải xuống
												</Button>
											</div>
										)}
									</>
								)}
							</div>
						</DialogContent>
					</Dialog>
				)}

				<Button variant='superOutline' size={buttonSize} onClick={handleDownload} disabled={!hasAccess}>
					<Download className='h-4 w-4' />
					{size !== 'sm' && <span className='ml-2'>Tải xuống</span>}
				</Button>

				<Button variant='superOutline' size={buttonSize} onClick={handleOpenInNewTab} disabled={!hasAccess}>
					<ExternalLink className='h-4 w-4' />
					{size !== 'sm' && <span className='ml-2'>Mở</span>}
				</Button>
			</div>
		);
	};

	if (variant === 'button') {
		return <div className='flex items-center gap-2'>{renderActions()}</div>;
	}

	if (variant === 'inline') {
		return (
			<div className='flex items-center justify-between p-3 border rounded-lg'>
				<div className='flex items-center gap-3'>
					<FileText className='h-5 w-5 text-blue-600' />
					<div>
						<p className='font-medium text-sm'>{fileName}</p>
						<p className='text-xs text-gray-500'>{getFileType(fileName)}</p>
					</div>
				</div>
				<div className='flex items-center gap-3'>
					{renderAccessStatus()}
					{renderActions()}
				</div>
			</div>
		);
	}

	// Default card variant
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<FileText className='h-5 w-5' />
					{fileName}
				</CardTitle>
				{description && <p className='text-sm text-gray-600'>{description}</p>}
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<span className='text-sm font-medium'>Loại file: {getFileType(fileName)}</span>
						{renderAccessStatus()}
					</div>

					{!hasAccess && (
						<div className='p-3 bg-yellow-50 rounded-lg'>
							<div className='flex items-start gap-2'>
								<AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5' />
								<div className='text-sm text-yellow-800'>
									<p className='font-medium'>Bạn không có quyền truy cập tài liệu này</p>
									<p>Vui lòng liên hệ giảng viên hoặc quản trị viên để được cấp quyền.</p>
								</div>
							</div>
						</div>
					)}

					<div className='flex justify-end'>{renderActions()}</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default DocumentViewer;
