import api from "@/lib/api";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const NotificationService = {
  // Get user notifications with pagination
  async getMyNotifications(page: number = 0, size: number = 20): Promise<NotificationResponse> {
    const response = await api.get(`/api/notifications/my-notifications?page=${page}&size=${size}`);
    return response.data;
  },

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    await api.put(`/api/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/api/notifications/mark-all-read');
  }
};

export default NotificationService;