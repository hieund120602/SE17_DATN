'use client';

import { Bell, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationService, Notification } from '@/services/notification-service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function NotificationBell() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadNotifications();
		loadUnreadCount();
	}, []);

	const loadNotifications = async () => {
		try {
			setLoading(true);
			const response = await NotificationService.getMyNotifications(0, 10);
			setNotifications(response.content);
		} catch (error) {
			console.error('Failed to load notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadUnreadCount = async () => {
		try {
			const count = await NotificationService.getUnreadCount();
			setUnreadCount(count);
		} catch (error) {
			console.error('Failed to load unread count:', error);
		}
	};

	const handleMarkAsRead = async (notificationId: number) => {
		try {
			await NotificationService.markAsRead(notificationId);
			setNotifications((prev) =>
				prev.map((notif) =>
					notif.id === notificationId ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
				)
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await NotificationService.markAllAsRead();
			setNotifications((prev) =>
				prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
			);
			setUnreadCount(0);
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		}
	};

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			handleMarkAsRead(notification.id);
		}

		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}

		setIsOpen(false);
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'DISCUSSION_REPLY':
				return '💬';
			case 'COURSE_ENROLLMENT':
				return '📚';
			case 'PAYMENT_SUCCESS':
				return '💰';
			case 'COURSE_APPROVAL':
				return '✅';
			default:
				return '🔔';
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='relative'>
					<Bell className='h-5 w-5' />
					{unreadCount > 0 && (
						<Badge
							variant='destructive'
							className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'
						>
							{unreadCount > 99 ? '99+' : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-80 max-h-96 overflow-y-auto'>
				<DropdownMenuLabel className='flex items-center justify-between'>
					<span>Thông báo</span>
					{unreadCount > 0 && (
						<Button variant='ghost' size='sm' onClick={handleMarkAllAsRead} className='h-6 px-2 text-xs'>
							Đánh dấu đã đọc
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{loading ? (
					<div className='p-4 text-center text-sm text-muted-foreground'>Đang tải thông báo...</div>
				) : notifications.length === 0 ? (
					<div className='p-4 text-center text-sm text-muted-foreground'>Không có thông báo nào</div>
				) : (
					notifications.map((notification) => (
						<DropdownMenuItem
							key={notification.id}
							className='flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-muted'
							onClick={() => handleNotificationClick(notification)}
						>
							<div className='flex items-start gap-3 w-full'>
								<span className='text-lg'>{getNotificationIcon(notification.type)}</span>
								<div className='flex-1 min-w-0'>
									<div className='flex items-start justify-between gap-2'>
										<h4
											className={`text-sm font-medium ${
												!notification.isRead ? 'text-foreground' : 'text-muted-foreground'
											}`}
										>
											{notification.title}
										</h4>
										{!notification.isRead && (
											<Button
												variant='ghost'
												size='sm'
												onClick={(e) => {
													e.stopPropagation();
													handleMarkAsRead(notification.id);
												}}
												className='h-4 w-4 p-0'
											>
												<Check className='h-3 w-3' />
											</Button>
										)}
									</div>
									<p
										className={`text-xs mt-1 ${
											!notification.isRead ? 'text-foreground' : 'text-muted-foreground'
										}`}
									>
										{notification.message}
									</p>
									<div className='flex items-center justify-between mt-2'>
										<span className='text-xs text-muted-foreground'>
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
												locale: vi,
											})}
										</span>
										{notification.actionText && (
											<span className='text-xs text-blue-600 hover:text-blue-800'>
												{notification.actionText}
											</span>
										)}
									</div>
								</div>
							</div>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
