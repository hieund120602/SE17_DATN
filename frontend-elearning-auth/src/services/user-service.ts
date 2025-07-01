import api from '@/lib/api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  roles: string[];
  userType: string;
  enabled: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  teachingRequirements: string | null;
  educations: any | null;
  experiences: any | null;
  certificateUrls: any | null;
}

export interface PaginationResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: any;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: any;
  empty: boolean;
}

const UserService = {
  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  getStudents: async (page = 0, size = 10): Promise<PaginationResponse<User>> => {
    const response = await api.get<PaginationResponse<User>>(`/admin/users/students?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Cập nhật avatar cho người dùng hiện tại
   * @param file File ảnh cần upload
   */
  updateCurrentUserAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật avatar cho người dùng bất kỳ (chỉ admin)
   * @param userId ID của người dùng
   * @param file File ảnh cần upload
   */
  updateUserAvatar: async (userId: number, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<User>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật thông tin người dùng hiện tại
   * @param userData Thông tin người dùng cần cập nhật
   */
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/me/profile', userData);
    return response.data;
  },

  /**
   * Lấy thông tin người dùng theo ID (chỉ admin)
   * @param userId ID của người dùng
   */
  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Lấy danh sách tất cả người dùng (chỉ admin)
   * @param page Số trang, bắt đầu từ 0
   * @param size Số lượng trên mỗi trang
   */
  getAllUsers: async (page = 0, size = 10): Promise<PaginationResponse<User>> => {
    const response = await api.get<PaginationResponse<User>>(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  /**
 * Lấy trạng thái block của người dùng (chỉ admin)
 * @param userId ID của người dùng
 */
  getUserBlockStatus: async (userId: number): Promise<User> => {
    const response = await api.get<User>(`/admin/user-management/${userId}/block-status`);
    return response.data;
  },

  /**
   * Block người dùng (chỉ admin)
   * @param userId ID của người dùng
   * @param reason Lý do block (tùy chọn)
   */
  blockUser: async (userId: number, reason?: string): Promise<User> => {
    const response = await api.post<User>('/admin/user-management/block', {
      userId,
      reason
    });
    return response.data;
  },

  /**
   * Block người dùng sử dụng path variable (chỉ admin)
   * @param userId ID của người dùng
   * @param reason Lý do block (tùy chọn)
   */
  blockUserWithPath: async (userId: number, reason?: string): Promise<User> => {
    const url = reason
      ? `/admin/users/${userId}/block?reason=${encodeURIComponent(reason)}`
      : `/admin/users/${userId}/block`;
    const response = await api.put<User>(url);
    return response.data;
  },

  /**
   * Unblock người dùng (chỉ admin)
   * @param userId ID của người dùng
   */
  unblockUser: async (userId: number): Promise<User> => {
    const response = await api.post<User>('/admin/user-management/unblock', {
      userId
    });
    return response.data;
  },

  /**
   * Unblock người dùng sử dụng path variable (chỉ admin)
   * @param userId ID của người dùng
   */
  unblockUserWithPath: async (userId: number): Promise<User> => {
    const response = await api.put<User>(`/admin/users/${userId}/unblock`);
    return response.data;
  }
};

export default UserService;