import api from '@/lib/api';

export interface Student {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
}

const ProfileService = {
  /**
   * Cập nhật thông tin cá nhân của người dùng hiện tại
   * @param profileData Thông tin cần cập nhật
   */
  updateProfile: async (profileData: UpdateProfileRequest): Promise<Student> => {
    const response = await api.put<Student>('/users/me/profile', profileData);
    return response.data;
  },

  /**
   * Cập nhật thông tin cá nhân của bất kỳ người dùng nào (chỉ admin)
   * @param userId ID của người dùng cần cập nhật
   * @param profileData Thông tin cần cập nhật
   */
  updateUserProfile: async (userId: number, profileData: UpdateProfileRequest): Promise<Student> => {
    const response = await api.put<Student>(`/users/${userId}/profile`, profileData);
    return response.data;
  }
};

export default ProfileService;