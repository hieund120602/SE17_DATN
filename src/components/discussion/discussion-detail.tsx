'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DiscussionService, { Comment } from '@/services/discussion-service';
import { formatDistanceToNow } from 'date-fns';
import { vi, ja } from 'date-fns/locale';
import { ArrowLeft, Edit, Trash2, Reply, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface DiscussionDetailProps {
	discussionId: number;
	lang: string;
	dict: any;
	currentUserId?: number;
}

const DiscussionDetail: React.FC<DiscussionDetailProps> = ({ discussionId, lang, dict, currentUserId }) => {
	const queryClient = useQueryClient();
	const [newComment, setNewComment] = useState('');
	const [replyToId, setReplyToId] = useState<number | null>(null);
	const [replyContent, setReplyContent] = useState('');
	const [editCommentId, setEditCommentId] = useState<number | null>(null);
	const [editContent, setEditContent] = useState('');
	const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Fetch discussion details
	const {
		data: discussion,
		isLoading: isDiscussionLoading,
		isError: isDiscussionError,
	} = useQuery({
		queryKey: ['discussion', discussionId],
		queryFn: () => DiscussionService.getDiscussionById(discussionId),
	});

	// Fetch comments
	const {
		data: comments,
		isLoading: isCommentsLoading,
		isError: isCommentsError,
	} = useQuery({
		queryKey: ['comments', discussionId],
		queryFn: () => DiscussionService.getCommentsByDiscussion(discussionId),
	});

	// Add comment mutation
	const addCommentMutation = useMutation({
		mutationFn: (data: { discussionId: number; content: string; parentId?: number }) =>
			DiscussionService.addComment(data.discussionId, {
				content: data.content,
				parentId: data.parentId,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', discussionId] });
			queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
			setNewComment('');
			setReplyToId(null);
			setReplyContent('');
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToAddComment);
		},
	});

	// Update comment mutation
	const updateCommentMutation = useMutation({
		mutationFn: (data: { commentId: number; content: string }) =>
			DiscussionService.updateComment(data.commentId, { content: data.content }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', discussionId] });
			setEditCommentId(null);
			setEditContent('');
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToUpdateComment);
		},
	});

	// Delete comment mutation
	const deleteCommentMutation = useMutation({
		mutationFn: (commentId: number) => DiscussionService.deleteComment(commentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', discussionId] });
			setDeleteCommentId(null);
		},
		onError: (error: any) => {
			setError(error?.response?.data?.message || dict.errors.failedToDeleteComment);
		},
	});

	// Handle add comment
	const handleAddComment = () => {
		if (!newComment.trim()) return;
		addCommentMutation.mutate({
			discussionId,
			content: newComment.trim(),
		});
	};

	// Handle reply to comment
	const handleReply = () => {
		if (!replyContent.trim() || !replyToId) return;
		addCommentMutation.mutate({
			discussionId,
			content: replyContent.trim(),
			parentId: replyToId,
		});
	};

	// Handle edit comment
	const handleEditComment = () => {
		if (!editContent.trim() || !editCommentId) return;
		updateCommentMutation.mutate({
			commentId: editCommentId,
			content: editContent.trim(),
		});
	};

	// Handle delete comment
	const handleDeleteComment = () => {
		if (!deleteCommentId) return;
		deleteCommentMutation.mutate(deleteCommentId);
	};

	// Format date based on language
	const formatDate = (date: string) => {
		try {
			const dateObj = new Date(date);
			return formatDistanceToNow(dateObj, {
				addSuffix: true,
				locale: lang === 'vi' ? vi : ja,
			});
		} catch (error) {
			return date;
		}
	};

	// Render comment recursively
	const renderComment = (comment: Comment, level = 0) => {
		const isOwner = currentUserId === comment.userId;
		const isEditing = editCommentId === comment.id;
		const isReplying = replyToId === comment.id;

		return (
			<div key={comment.id} className={`border-l-2 border-gray-200 pl-4 ${level > 0 ? 'ml-4' : ''}`}>
				<div className='flex gap-3 mb-2'>
					<Avatar className='w-8 h-8'>
						<AvatarImage src={comment.userAvatar} alt={comment.userName} />
						<AvatarFallback>{comment.userName?.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className='flex-1'>
						<div className='flex items-center gap-2 mb-1'>
							<span className='font-medium text-sm'>{comment.userName}</span>
							<span className='text-xs text-gray-500'>{formatDate(comment.createdAt)}</span>
						</div>

						{isEditing ? (
							<div className='space-y-2'>
								<Textarea
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									rows={3}
								/>
								<div className='flex gap-2'>
									<Button
										size='sm'
										onClick={handleEditComment}
										disabled={updateCommentMutation.isPending}
									>
										{updateCommentMutation.isPending ? (
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										) : null}
										{dict.common.save}
									</Button>
									<Button
										size='sm'
										variant='superOutline'
										onClick={() => {
											setEditCommentId(null);
											setEditContent('');
										}}
									>
										{dict.common.cancel}
									</Button>
								</div>
							</div>
						) : (
							<div className='space-y-2'>
								<p className='text-sm text-gray-700'>{comment.content}</p>

								<div className='flex items-center gap-2'>
									<Button
										size='sm'
										variant='ghost'
										onClick={() => {
											setReplyToId(comment.id);
											setReplyContent('');
										}}
									>
										<Reply size={14} className='mr-1' />
										{dict.common.reply}
									</Button>

									{isOwner && (
										<>
											<Button
												size='sm'
												variant='ghost'
												onClick={() => {
													setEditCommentId(comment.id);
													setEditContent(comment.content);
												}}
											>
												<Edit size={14} className='mr-1' />
												{dict.common.edit}
											</Button>

											<Button
												size='sm'
												variant='ghost'
												onClick={() => setDeleteCommentId(comment.id)}
												className='text-red-600 hover:text-red-800'
											>
												<Trash2 size={14} className='mr-1' />
												{dict.common.delete}
											</Button>
										</>
									)}
								</div>
							</div>
						)}

						{isReplying && (
							<div className='mt-3 space-y-2'>
								<Textarea
									value={replyContent}
									onChange={(e) => setReplyContent(e.target.value)}
									placeholder={dict.comments?.replyPlaceholder || 'Viết phản hồi...'}
									rows={2}
								/>
								<div className='flex gap-2'>
									<Button size='sm' onClick={handleReply} disabled={addCommentMutation.isPending}>
										{addCommentMutation.isPending ? (
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										) : null}
										{dict.common.reply}
									</Button>
									<Button
										size='sm'
										variant='superOutline'
										onClick={() => {
											setReplyToId(null);
											setReplyContent('');
										}}
									>
										{dict.common.cancel}
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Render replies */}
				{comment.replies && comment.replies.length > 0 && (
					<div className='mt-3'>{comment.replies.map((reply) => renderComment(reply, level + 1))}</div>
				)}
			</div>
		);
	};

	if (isDiscussionLoading || isCommentsLoading) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center gap-2 mb-6'>
					<Skeleton className='h-8 w-8' />
					<Skeleton className='h-6 w-40' />
				</div>
				<Skeleton className='h-8 w-3/4 mb-2' />
				<Skeleton className='h-4 w-1/2 mb-6' />
				<Skeleton className='h-24 w-full mb-6' />
				<Skeleton className='h-32 w-full' />
			</div>
		);
	}

	if (isDiscussionError || isCommentsError) {
		return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{dict.errors.failedToLoadDiscussion}</div>;
	}

	return (
		<div className='space-y-6'>
			{/* Back button */}
			<div className='mb-6'>
				<Link
					href={`/${lang}/learning/courses/${discussion?.lessonId}`}
					className='flex items-center text-gray-600 hover:text-gray-900'
				>
					<ArrowLeft size={16} className='mr-1' />
					{dict.common.back}
				</Link>
			</div>

			{/* Discussion header */}
			<div>
				<h1 className='text-2xl font-bold mb-2'>{discussion?.title}</h1>
				<div className='flex items-center text-sm text-gray-500 mb-4'>
					<div className='flex items-center'>
						{discussion?.userAvatar ? (
							<img
								src={discussion.userAvatar}
								alt={discussion.userName}
								className='w-5 h-5 rounded-full mr-2'
							/>
						) : (
							<div className='w-5 h-5 bg-gray-200 rounded-full mr-2'></div>
						)}
						<span>{discussion?.userName}</span>
					</div>
					<span className='mx-2'>•</span>
					<span>{formatDate(discussion?.createdAt || '')}</span>
				</div>
				<div className='prose max-w-none mb-8'>
					<p>{discussion?.content}</p>
				</div>
			</div>

			{/* Comments section */}
			<div>
				<h2 className='text-xl font-semibold mb-4'>
					{dict.comments?.title || 'Bình luận'} ({comments?.length || 0})
				</h2>

				{/* Add new comment */}
				<div className='mb-6'>
					<div className='flex gap-3'>
						<Avatar className='w-8 h-8'>
							<AvatarImage src={undefined} alt='' />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className='flex-1 space-y-2'>
							<Textarea
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								placeholder={dict.comments?.addCommentPlaceholder || 'Viết bình luận của bạn...'}
								rows={3}
							/>
							<div className='flex justify-end'>
								<Button
									onClick={handleAddComment}
									disabled={addCommentMutation.isPending || !newComment.trim()}
								>
									{addCommentMutation.isPending ? (
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									) : (
										<Send size={16} className='mr-2' />
									)}
									{dict.common.submit}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Error display */}
				{error && <div className='p-3 text-sm bg-red-50 text-red-700 rounded-md mb-4'>{error}</div>}

				{/* Comments list */}
				<div className='space-y-6'>
					{comments && comments.length > 0 ? (
						comments.map((comment) => renderComment(comment))
					) : (
						<div className='text-center py-8 text-gray-500'>
							{dict.comments?.noComments || 'Chưa có bình luận nào. Hãy là người đầu tiên bình luận!'}
						</div>
					)}
				</div>
			</div>

			{/* Delete confirmation dialog */}
			<AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dict.comments?.deleteConfirmTitle || 'Xác nhận xóa'}</AlertDialogTitle>
						<AlertDialogDescription>
							{dict.comments?.deleteConfirmMessage ||
								'Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteComment} className='bg-red-600 hover:bg-red-700'>
							{dict.common.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default DiscussionDetail;
