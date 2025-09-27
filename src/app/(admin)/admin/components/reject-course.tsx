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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const RejectCourseDialog = ({ isOpen, onClose, onConfirm, feedback, setFeedback, isLoading }: any) => {
	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Từ chối khóa học</DialogTitle>
					<DialogDescription>
						Vui lòng nhập phản hồi cho giảng viên về lý do từ chối khóa học này.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='feedback' className='text-emerald-800'>
							Lý do từ chối
						</Label>
						<Textarea
							id='feedback'
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							placeholder='Nhập lý do từ chối khóa học'
							className='resize-none min-h-[120px] border-emerald-200'
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='superOutline' onClick={onClose}>
						Hủy
					</Button>
					<Button
						variant='danger'
						onClick={() => onConfirm(feedback)}
						disabled={!feedback.trim() || isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang xử lý...
							</>
						) : (
							'Xác nhận từ chối'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default RejectCourseDialog;
