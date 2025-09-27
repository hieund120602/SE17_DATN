import api from '../lib/api';

// User Response Interface
export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'STUDENT' | 'TUTOR' | 'ADMIN';
  enabled: boolean;
  blocked: boolean;
  profileImageUrl?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  // Tutor specific fields
  certificates?: string[];
  experience?: string;
  specializations?: string[];
  averageRating?: number;
  totalReviews?: number;
  // Student specific fields
  learningGoals?: string;
  currentLevel?: string;
}

// Pagination Response Interface
export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const AdminUserService = {
  /**
   * Get all students with pagination
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Sort field
   * @param direction Sort direction (asc/desc)
   * @returns Paginated list of students
   */
  getAllStudents: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<UserResponse>> => {
    try {
      const response = await api.get<PaginationResponse<UserResponse>>(
        `/admin/users/students?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all tutors with pagination
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Sort field
   * @param direction Sort direction (asc/desc)
   * @returns Paginated list of tutors
   */
  getAllTutors: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<UserResponse>> => {
    try {
      const response = await api.get<PaginationResponse<UserResponse>>(
        `/admin/users/tutors?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get pending tutors waiting for approval
   * @param page Page number (0-based)
   * @param size Page size
   * @returns Paginated list of pending tutors
   */
  getPendingTutors: async (page = 0, size = 10): Promise<PaginationResponse<UserResponse>> => {
    try {
      const response = await api.get<PaginationResponse<UserResponse>>(
        `/admin/users/tutors/pending?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Approve tutor account
   * @param tutorId Tutor ID to approve
   * @returns Updated user response
   */
  approveTutor: async (tutorId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/admin/users/tutors/${tutorId}/approve`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Reject tutor account
   * @param tutorId Tutor ID to reject
   * @param reason Optional rejection reason
   * @returns Updated user response
   */
  rejectTutor: async (tutorId: number, reason?: string): Promise<UserResponse> => {
    try {
      const url = `/admin/users/tutors/${tutorId}/reject`;
      const params = reason ? { reason } : {};

      const response = await api.put<UserResponse>(url, null, { params });
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Search users by email or name
   * @param query Search query (email or name)
   * @param page Page number (0-based)
   * @param size Page size
   * @returns Paginated search results
   */
  searchUsers: async (
    query: string,
    page = 0,
    size = 10
  ): Promise<PaginationResponse<UserResponse>> => {
    try {
      const response = await api.get<PaginationResponse<UserResponse>>(
        `/admin/users/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Enable user account
   * @param userId User ID to enable
   * @returns Updated user response
   */
  enableUser: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/admin/users/${userId}/enable`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Disable user account
   * @param userId User ID to disable
   * @returns Updated user response
   */
  disableUser: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/admin/users/${userId}/disable`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Block user account
   * @param userId User ID to block
   * @returns Updated user response
   */
  blockUser: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/admin/users/${userId}/block`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Unblock user account
   * @param userId User ID to unblock
   * @returns Updated user response
   */
  unblockUser: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/admin/users/${userId}/unblock`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user by ID
   * @param userId User ID to get
   * @returns User response
   */
  getUserById: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  }
};

const handleApiError = (error: any): Error => {
  if (error.response && error.response.data) {
    const errorData = error.response.data as ApiError;

    if (errorData.message) {
      return new Error(errorData.message);
    }
  }

  return new Error(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
};

export default AdminUserService;