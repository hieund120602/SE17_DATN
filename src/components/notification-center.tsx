'use client';

import React, { useState, useEffect } from 'react';
import {
	Bell,
	Check,
	CheckCheck,
	X,
	AlertCircle,
	Info,
	CheckCircle,
	XCircle,
	CreditCard,
	BookOpen,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

import NotificationService, { NotificationResponse } from '@/services/notification-service';
import { useAuth } from '@/context/AuthContext';

interface NotificationCenterProps {
	className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);

	// Fetch unread count
	const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
		queryKey: ['notificationUnreadCount'],
		queryFn: NotificationService.getUnreadCount,
		enabled: !!user,
		refetchInterval: 15000, // Refetch every 15 seconds
		refetchOnWindowFocus: true, // Refetch when window gains focus
		refetchOnMount: true, // Refetch when component mounts
	});

	// Refetch unread count when popup opens
	useEffect(() => {
		if (isOpen && user) {
			refetchUnreadCount();
		}
	}, [isOpen, user, refetchUnreadCount]);

	// Fetch notifications
	const {
		data: notificationsData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['notifications', isOpen],
		queryFn: () => NotificationService.getMyNotifications(0, 20),
		enabled: !!user && isOpen,
	});

	// Mark as read mutation
	const markAsReadMutation = useMutation({
		mutationFn: NotificationService.markAsRead,
		onSuccess: () => {
			refetch();
			refetchUnreadCount();
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: error.response?.data?.message || 'Không thể đánh dấu thông báo đã đọc',
			});
		},
	});

	// Mark all as read mutation
	const markAllAsReadMutation = useMutation({
		mutationFn: NotificationService.markAllAsRead,
		onSuccess: () => {
			refetch();
			refetchUnreadCount();
			toast({
				title: 'Thành công',
				description: 'Đã đánh dấu tất cả thông báo là đã đọc',
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: error.response?.data?.message || 'Không thể đánh dấu tất cả thông báo',
			});
		},
	});

	// Delete notification mutation
	const deleteNotificationMutation = useMutation({
		mutationFn: NotificationService.deleteNotification,
		onSuccess: () => {
			refetch();
			refetchUnreadCount();
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: error.response?.data?.message || 'Không thể xóa thông báo',
			});
		},
	});

	const handleMarkAsRead = (notificationId: number) => {
		markAsReadMutation.mutate(notificationId);
	};

	const handleMarkAllAsRead = () => {
		markAllAsReadMutation.mutate();
	};

	const handleDeleteNotification = (notificationId: number) => {
		deleteNotificationMutation.mutate(notificationId);
	};

	const getNotificationIcon = (type: NotificationResponse['type']) => {
		switch (type) {
			case 'COURSE_APPROVAL':
			case 'COURSE_COMPLETION':
				return <CheckCircle className='h-5 w-5 text-green-500' />;
			case 'PAYMENT_FAILED':
				return <XCircle className='h-5 w-5 text-red-500' />;
			case 'ASSIGNMENT_DUE':
				return <AlertCircle className='h-5 w-5 text-yellow-500' />;
			case 'PAYMENT_SUCCESS':
				return <CreditCard className='h-5 w-5 text-blue-500' />;
			case 'COURSE_ENROLLMENT':
				return <BookOpen className='h-5 w-5 text-purple-500' />;
			case 'DISCUSSION_REPLY':
				return <Info className='h-5 w-5 text-indigo-500' />;
			case 'SYSTEM_ANNOUNCEMENT':
			case 'GENERAL':
			default:
				return <Info className='h-5 w-5 text-blue-500' />;
		}
	};

	const getNotificationColor = (type: NotificationResponse['type']) => {
		switch (type) {
			case 'COURSE_APPROVAL':
			case 'COURSE_COMPLETION':
				return 'border-l-green-500 bg-green-50';
			case 'PAYMENT_FAILED':
				return 'border-l-red-500 bg-red-50';
			case 'ASSIGNMENT_DUE':
				return 'border-l-yellow-500 bg-yellow-50';
			case 'PAYMENT_SUCCESS':
				return 'border-l-blue-500 bg-blue-50';
			case 'COURSE_ENROLLMENT':
				return 'border-l-purple-500 bg-purple-50';
			case 'DISCUSSION_REPLY':
				return 'border-l-indigo-500 bg-indigo-50';
			case 'SYSTEM_ANNOUNCEMENT':
			case 'GENERAL':
			default:
				return 'border-l-gray-500 bg-gray-50';
		}
	};

	if (!user) {
		return null;
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					className={`relative ${className} ${unreadCount > 0 ? 'text-red-600 hover:text-red-700' : ''}`}
				>
					<Bell className={`h-5 w-5 ${unreadCount > 0 ? 'fill-red-100' : ''}`} />
					{unreadCount > 0 && (
						<span className='absolute -top-2 -right-2 min-h-6 min-w-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold z-10 border-2 border-white shadow-lg animate-pulse px-1'>
							{unreadCount > 999 ? '999+' : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80 p-0' align='end'>
				<div className='p-4 border-b'>
					<div className='flex items-center justify-between'>
						<h3 className='font-semibold text-lg'>Thông báo</h3>
						<div className='flex items-center gap-2'>
							{unreadCount > 0 && (
								<Button
									variant='ghost'
									size='sm'
									onClick={handleMarkAllAsRead}
									disabled={markAllAsReadMutation.isPending}
									className='text-xs h-auto py-1 px-2'
								>
									<CheckCheck className='h-3 w-3 mr-1' />
									Đánh dấu tất cả
								</Button>
							)}
						</div>
					</div>
					{unreadCount > 0 && <p className='text-sm text-gray-500 mt-1'>{unreadCount} thông báo chưa đọc</p>}
				</div>

				<ScrollArea className='h-96'>
					{isLoading ? (
						<div className='p-4 space-y-3'>
							{[1, 2, 3].map((i) => (
								<div key={i} className='animate-pulse'>
									<div className='flex space-x-3'>
										<div className='w-5 h-5 bg-gray-200 rounded-full'></div>
										<div className='flex-1 space-y-2'>
											<div className='h-4 bg-gray-200 rounded w-3/4'></div>
											<div className='h-3 bg-gray-200 rounded w-1/2'></div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : notificationsData?.content?.length === 0 ? (
						<div className='p-8 text-center'>
							<Bell className='h-12 w-12 text-gray-300 mx-auto mb-4' />
							<p className='text-gray-500'>Không có thông báo nào</p>
						</div>
					) : (
						<div className='divide-y'>
							{notificationsData?.content?.map((notification, index) => (
								<div
									key={notification.id}
									className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
										!notification.isRead ? 'font-medium' : 'opacity-75'
									} transition-all hover:bg-gray-50`}
								>
									<div className='flex items-start space-x-3'>
										<div className='flex-shrink-0 mt-0.5'>
											{getNotificationIcon(notification.type)}
										</div>
										<div className='flex-1 min-w-0'>
											<div className='flex items-start justify-between'>
												<div className='flex-1'>
													<p className='text-sm font-medium text-gray-900 line-clamp-2'>
														{notification.title}
													</p>
													<p className='text-sm text-gray-600 mt-1 line-clamp-3'>
														{notification.message}
													</p>
													<p className='text-xs text-gray-400 mt-2'>
														{format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', {
															locale: vi,
														})}
													</p>
												</div>
												<div className='flex items-center space-x-1 ml-2'>
													{!notification.isRead && (
														<Button
															variant='ghost'
															size='icon'
															className='h-6 w-6'
															onClick={() => handleMarkAsRead(notification.id)}
															disabled={markAsReadMutation.isPending}
														>
															<Check className='h-3 w-3' />
														</Button>
													)}
													<Button
														variant='ghost'
														size='icon'
														className='h-6 w-6 text-gray-400 hover:text-red-500'
														onClick={() => handleDeleteNotification(notification.id)}
														disabled={deleteNotificationMutation.isPending}
													>
														<X className='h-3 w-3' />
													</Button>
												</div>
											</div>

											{notification.actionUrl && (
												<div className='mt-2'>
													<Link href={notification.actionUrl}>
														<Button
															variant='primaryOutline'
															size='sm'
															className='text-xs h-7'
															onClick={() => {
																setIsOpen(false);
																if (!notification.isRead) {
																	handleMarkAsRead(notification.id);
																}
															}}
														>
															Xem chi tiết
														</Button>
													</Link>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>

				{notificationsData?.content && notificationsData.content.length > 0 && (
					<div className='p-4 border-t'>
						<Button
							variant='ghost'
							className='w-full text-sm'
							onClick={() => {
								setIsOpen(false);
								// Navigate to full notifications page if it exists
								// router.push('/notifications');
							}}
						>
							Xem tất cả thông báo
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
