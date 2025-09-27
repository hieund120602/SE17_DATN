'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import DiscussionService, { DiscussionRequest } from '@/services/discussion-service';
import { Loader2 } from 'lucide-react';

interface NewDiscussionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onDiscussionCreated: () => void;
	lessonId: number;
	dict: any;
}

const NewDiscussionModal: React.FC<NewDiscussionModalProps> = ({
	isOpen,
	onClose,
	onDiscussionCreated,
	lessonId,
	dict,
}) => {
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [error, setError] = useState<string | null>(null);

	// Create discussion mutation
	const createDiscussionMutation = useMutation({
		mutationFn: (data: DiscussionRequest) => DiscussionService.createDiscussion(data),
		onSuccess: () => {
			onDiscussionCreated();
			resetForm();
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToCreateDiscussion);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate form
		if (!title.trim()) {
			setError(dict.errors.titleRequired);
			return;
		}

		if (!content.trim()) {
			setError(dict.errors.contentRequired);
			return;
		}

		// Create discussion
		createDiscussionMutation.mutate({
			title: title.trim(),
			content: content.trim(),
			lessonId,
		});
	};

	const resetForm = () => {
		setTitle('');
		setContent('');
		setError(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>{dict.learning.newDiscussion || 'Thảo luận mới'}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4 mt-4'>
					{error && <div className='p-3 text-sm bg-red-50 text-red-700 rounded-md'>{error}</div>}

					<div className='space-y-2'>
						<label htmlFor='title' className='text-sm font-medium'>
							{dict.learning.discussionTitle || 'Tiêu đề thảo luận'}
						</label>
						<Input
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={dict.learning.discussionTitlePlaceholder || 'Nhập tiêu đề thảo luận...'}
							disabled={createDiscussionMutation.isPending}
						/>
					</div>

					<div className='space-y-2'>
						<label htmlFor='content' className='text-sm font-medium'>
							{dict.learning.discussionContent || 'Nội dung thảo luận'}
						</label>
						<Textarea
							id='content'
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={dict.learning.discussionContentPlaceholder || 'Nhập nội dung thảo luận...'}
							rows={5}
							disabled={createDiscussionMutation.isPending}
						/>
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='secondary'
							onClick={handleClose}
							disabled={createDiscussionMutation.isPending}
						>
							{dict.common.cancel || 'Hủy'}
						</Button>
						<Button type='submit' disabled={createDiscussionMutation.isPending}>
							{createDiscussionMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{dict.common.submitting || 'Đang gửi...'}
								</>
							) : (
								dict.common.submit || 'Gửi'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default NewDiscussionModal;
