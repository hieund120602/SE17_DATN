import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, File, FileText } from 'lucide-react';

const ResourceDetailDialog = ({ resource, isOpen, onClose }: any) => {
	if (!isOpen || !resource) return null;

	// Format date
	const formatDate = (dateString: any) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	// File type icon
	const getFileTypeIcon = (fileType: any) => {
		if (!fileType) return <File className='h-5 w-5 text-blue-500' />;

		const type = fileType.toLowerCase();
		if (type.includes('pdf')) {
			return <FileText className='h-5 w-5 text-red-500' />;
		} else if (type.includes('doc') || type.includes('word')) {
			return <FileText className='h-5 w-5 text-blue-500' />;
		} else if (type.includes('xls') || type.includes('sheet')) {
			return <FileText className='h-5 w-5 text-green-500' />;
		} else if (type.includes('ppt') || type.includes('presentation')) {
			return <FileText className='h-5 w-5 text-orange-500' />;
		} else {
			return <File className='h-5 w-5 text-gray-500' />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						{getFileTypeIcon(resource.fileType)}
						<span>{resource.title}</span>
					</DialogTitle>
					<DialogDescription>Chi tiết tài liệu</DialogDescription>
				</DialogHeader>
				<div className='w-full flex flex-col gap-2'>
					<div className='bg-blue-50 p-4 rounded-lg'>
						<h4 className='font-medium mb-2 text-blue-800'>Mô tả</h4>
						<p className='text-sm text-blue-700 whitespace-pre-line'>
							{resource.description || 'Không có mô tả'}
						</p>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<h4 className='text-sm font-medium text-gray-500 mb-1'>Loại tập tin</h4>
							<p className='font-medium'>{resource.fileType || 'Không xác định'}</p>
						</div>
						<div>
							<h4 className='text-sm font-medium text-gray-500 mb-1'>Ngày tạo</h4>
							<p className='font-medium'>{formatDate(resource.createdAt)}</p>
						</div>
					</div>

					{resource.fileUrl && (
						<div className='bg-gray-50 p-4 rounded-lg w-full'>
							<h4 className='font-medium mb-2'>Link tài liệu</h4>
							<div className='flex items-center justify-between'>
								<a
									href={resource.fileUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:underline mr-2'
								>
									{resource.fileUrl.length > 50
										? resource.fileUrl.slice(0, 47) + '...'
										: resource.fileUrl}
								</a>
								<Button
									variant='superOutline'
									size='sm'
									className='bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
									onClick={() => window.open(resource.fileUrl, '_blank')}
								>
									<Eye className='h-4 w-4 mr-1' />
									Xem
								</Button>
							</div>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant='secondary' onClick={onClose}>
						Đóng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ResourceDetailDialog;
