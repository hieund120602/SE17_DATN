'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, ExternalLink, Download, Trash, Loader2, FileText } from 'lucide-react';

interface CertificateDisplayProps {
	certificates: string[];
	title?: string;
	showActions?: boolean;
	onDelete?: (certificateUrl: string) => void;
	deletingUrl?: string | null;
	className?: string;
}

export default function CertificateDisplay({
	certificates,
	title = 'Chứng chỉ',
	showActions = true,
	onDelete,
	deletingUrl,
	className = '',
}: CertificateDisplayProps) {
	const getCertificateName = (url: string) => {
		const parts = url.split('/');
		const filename = parts[parts.length - 1];
		return filename.length > 30 ? filename.substring(0, 30) + '...' : filename;
	};

	const getCertificateType = (url: string) => {
		if (url.includes('.pdf')) return 'PDF';
		if (url.includes('.jpg') || url.includes('.jpeg')) return 'JPG';
		if (url.includes('.png')) return 'PNG';
		if (url.includes('.webp')) return 'WebP';
		return 'Image';
	};

	const handleDownload = (url: string, index: number) => {
		const link = document.createElement('a');
		link.href = url;
		link.download = `certificate_${index + 1}.${getCertificateType(url).toLowerCase()}`;
		try {
			document.body.appendChild(link);
			link.click();
		} finally {
			link.remove();
		}
	};

	if (certificates.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Award className='h-5 w-5' />
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8'>
						<Award className='h-12 w-12 text-gray-300 mx-auto mb-3' />
						<p className='text-gray-500'>Chưa có chứng chỉ nào</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Award className='h-5 w-5' />
					{title} ({certificates.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{certificates.map((cert: string, idx: number) => (
						<div
							key={cert}
							className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
						>
							<div className='flex items-center gap-3'>
								<div className='flex-shrink-0'>
									{getCertificateType(cert) === 'PDF' ? (
										<FileText className='h-5 w-5 text-red-600' />
									) : (
										<Award className='h-5 w-5 text-blue-600' />
									)}
								</div>
								<div className='min-w-0 flex-1'>
									<p className='text-sm font-medium truncate'>Chứng chỉ {idx + 1}</p>
									<div className='flex items-center gap-2'>
										<Badge variant='secondaryOutline' className='text-xs'>
											{getCertificateType(cert)}
										</Badge>
										<p className='text-xs text-gray-500 truncate max-w-xs'>
											{getCertificateName(cert)}
										</p>
									</div>
								</div>
							</div>

							{showActions && (
								<div className='flex gap-2 flex-shrink-0'>
									<Button
										variant='secondaryOutline'
										size='sm'
										onClick={() => window.open(cert, '_blank')}
										title='Xem chứng chỉ'
									>
										<ExternalLink className='h-4 w-4' />
									</Button>
									<Button
										variant='secondaryOutline'
										size='sm'
										onClick={() => handleDownload(cert, idx)}
										title='Tải xuống'
									>
										<Download className='h-4 w-4' />
									</Button>
									{onDelete && (
										<Button
											variant='dangerOutline'
											size='sm'
											onClick={() => onDelete(cert)}
											disabled={deletingUrl === cert}
											title='Xóa chứng chỉ'
										>
											{deletingUrl === cert ? (
												<Loader2 className='h-4 w-4 animate-spin' />
											) : (
												<Trash className='h-4 w-4' />
											)}
										</Button>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// Compact version for table display
export function CertificateBadges({ certificates, maxDisplay = 2 }: { certificates: string[]; maxDisplay?: number }) {
	if (!certificates || certificates.length === 0) {
		return <span className='text-gray-400 text-sm'>Không có</span>;
	}

	return (
		<div className='flex flex-wrap gap-1'>
			{certificates.slice(0, maxDisplay).map((cert: string, idx: number) => (
				<Badge key={cert} variant='secondaryOutline' className='text-xs'>
					Chứng chỉ {idx + 1}
				</Badge>
			))}
			{certificates.length > maxDisplay && (
				<Badge variant='secondaryOutline' className='text-xs'>
					+{certificates.length - maxDisplay}
				</Badge>
			)}
		</div>
	);
}
