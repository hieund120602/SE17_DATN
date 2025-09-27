import { Button } from '@/components/ui/button';
import React from 'react';

interface DeleteConfirmationProps {
	itemName: string;
	itemCode: string;
	errorMessage: string | null;
	isDeleting: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
	itemName,
	itemCode,
	errorMessage,
	isDeleting,
	onConfirm,
	onCancel,
}) => {
	return (
		<div>
			<div className='py-4 flex flex-col gap-3'>
				<p className='text-sm text-gray-500'>
					Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến {itemName} này sẽ bị xóa vĩnh viễn.
				</p>

				{errorMessage && (
					<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'>
						<p className='font-medium'>Không thể xóa {itemName}</p>
						<p>{errorMessage}</p>
					</div>
				)}
			</div>

			<div className='flex justify-end gap-2'>
				<Button variant='superOutline' onClick={onCancel}>
					Hủy
				</Button>
				<Button variant='danger' onClick={onConfirm} disabled={isDeleting || !!errorMessage}>
					{isDeleting ? `Đang xóa...` : `Xóa ${itemName}`}
				</Button>
			</div>
		</div>
	);
};

export default DeleteConfirmation;
