import React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, courseTitle, isLoading }: any) => {
	if (!isOpen) return null;

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
					<AlertDialogDescription>
						Bạn có chắc chắn muốn xóa khóa học "{courseTitle}"? Hành động này không thể hoàn tác.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className='border-emerald-200 text-emerald-800'>Hủy</AlertDialogCancel>
					<AlertDialogAction
						className='bg-red-500 text-white hover:bg-red-600'
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang xử lý...
							</>
						) : (
							'Xác nhận xóa'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmDeleteDialog;
