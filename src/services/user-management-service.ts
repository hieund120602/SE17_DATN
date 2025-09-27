import api from '../lib/api';

// User Response Interface (reuse from user-service if available)
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

// Message Response Interface
export interface MessageResponse {
  message: string;
  success?: boolean;
  timestamp?: string;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const UserManagementService = {
  /**
   * Enable user account (Admin only)
   * @param userId User ID to enable
   * @returns Updated user response
   */
  enableUserAccount: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/api/user-management/account/enable/${userId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Disable user account (Admin only)
   * @param userId User ID to disable
   * @returns Updated user response
   */
  disableUserAccount: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/api/user-management/account/disable/${userId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Block user account (Admin only)
   * @param userId User ID to block
   * @returns Updated user response
   */
  blockUserAccount: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/api/user-management/account/block/${userId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Unblock user account (Admin only)
   * @param userId User ID to unblock
   * @returns Updated user response
   */
  unblockUserAccount: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/api/user-management/account/unblock/${userId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Approve tutor account (Admin only)
   * @param tutorId Tutor ID to approve
   * @returns Updated user response
   */
  approveTutor: async (tutorId: number): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>(`/api/user-management/tutor/approve/${tutorId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Reject tutor account (Admin only)
   * @param tutorId Tutor ID to reject
   * @param reason Optional rejection reason
   * @returns Updated user response
   */
  rejectTutor: async (tutorId: number, reason?: string): Promise<UserResponse> => {
    try {
      const url = `/api/user-management/tutor/reject/${tutorId}`;
      const params = reason ? { reason } : {};

      const response = await api.put<UserResponse>(url, null, { params });
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get current user account status
   * @returns Account status message
   */
  getAccountStatus: async (): Promise<MessageResponse> => {
    try {
      const response = await api.get<MessageResponse>('/api/user-management/account/status');
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

export default UserManagementService;