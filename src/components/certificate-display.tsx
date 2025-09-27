'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Award } from 'lucide-react';

interface Certificate {
	id: string;
	courseName: string;
	completionDate: string;
	certificateUrl: string;
	score?: number;
	level?: string;
}

interface CertificateDisplayProps {
	certificates: Certificate[];
	dict: any;
}

export default function CertificateDisplay({ certificates, dict }: CertificateDisplayProps) {
	const handleDownload = (certificateUrl: string, courseName: string) => {
		// Create a temporary link element to trigger download
		const link = document.createElement('a');
		link.href = certificateUrl;
		link.download = `certificate-${courseName.replace(/\s+/g, '-')}.pdf`;
		try {
			document.body.appendChild(link);
			link.click();
		} finally {
			link.remove();
		}
	};

	const handleViewOnline = (certificateUrl: string) => {
		window.open(certificateUrl, '_blank');
	};

	if (certificates.length === 0) {
		return (
			<Card className='border-dashed'>
				<CardContent className='p-8 text-center'>
					<Award className='mx-auto h-16 w-16 text-gray-300 mb-4' />
					<h3 className='text-lg font-medium text-gray-900 mb-2'>
						{dict.certificates?.noCertificates || 'Chưa có chứng chỉ nào'}
					</h3>
					<p className='text-gray-500 mb-4'>
						{dict.certificates?.noCertificatesDesc || 'Hoàn thành khóa học để nhận chứng chỉ của bạn'}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center gap-2 mb-6'>
				<Award className='h-6 w-6 text-yellow-600' />
				<h2 className='text-2xl font-bold text-gray-900'>{dict.certificates?.title || 'Chứng chỉ của tôi'}</h2>
				<Badge variant='secondary' className='ml-2'>
					{certificates.length}
				</Badge>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{certificates.map((certificate) => (
					<Card key={certificate.id} className='hover:shadow-lg transition-shadow'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-lg font-semibold text-gray-900 line-clamp-2'>
								{certificate.courseName}
							</CardTitle>
							<div className='flex items-center gap-2 text-sm text-gray-500'>
								<span>
									{dict.certificates?.completedOn || 'Hoàn thành ngày'}:{' '}
									{new Date(certificate.completionDate).toLocaleDateString('vi-VN')}
								</span>
							</div>
						</CardHeader>

						<CardContent className='pt-0'>
							{certificate.score && (
								<div className='mb-3'>
									<Badge variant='outline' className='text-sm'>
										{dict.certificates?.score || 'Điểm'}: {certificate.score}/100
									</Badge>
								</div>
							)}

							{certificate.level && (
								<div className='mb-4'>
									<Badge variant='secondary' className='text-sm'>
										{dict.certificates?.level || 'Cấp độ'}: {certificate.level}
									</Badge>
								</div>
							)}

							<div className='flex gap-2'>
								<Button
									variant='superOutline'
									size='sm'
									onClick={() => handleViewOnline(certificate.certificateUrl)}
									className='flex-1'
								>
									<ExternalLink size={16} className='mr-2' />
									{dict.certificates?.viewOnline || 'Xem online'}
								</Button>

								<Button
									size='sm'
									onClick={() => handleDownload(certificate.certificateUrl, certificate.courseName)}
									className='flex-1'
								>
									<Download size={16} className='mr-2' />
									{dict.certificates?.download || 'Tải xuống'}
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
