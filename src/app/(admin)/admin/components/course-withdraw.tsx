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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ConfirmWithdrawDialog = ({ isOpen, onClose, onConfirm, courseTitle, isLoading }: any) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent className='bg-white'>
				<AlertDialogHeader>
					<AlertDialogTitle className='text-emerald-700'>Rút lại khóa học</AlertDialogTitle>
					<AlertDialogDescription className='text-gray-600'>
						Bạn chắc chắn muốn rút lại khóa học <span className='font-semibold'>{courseTitle}</span>?
						<p className='mt-2'>
							Khóa học sẽ được chuyển về trạng thái <span className='font-semibold'>Bản nháp</span> và sẽ
							không được hiển thị cho học viên. Giảng viên có thể tiếp tục chỉnh sửa khóa học.
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className='bg-gray-100 hover:bg-gray-200 text-gray-700 border-none'>
						Hủy
					</AlertDialogCancel>
					<Button
						variant='danger'
						className='bg-yellow-500 hover:bg-yellow-600 text-white'
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang xử lý...
							</>
						) : (
							'Rút lại khóa học'
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmWithdrawDialog;
