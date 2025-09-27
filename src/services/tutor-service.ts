import api from '../lib/api';

// User Response Interface (for certificate management)
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
}

// Tutor Interface for admin management
export interface Tutor {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  teachingRequirements?: string;
  enabled: boolean;
  blocked: boolean;
  educations?: Education[];
  experiences?: Experience[];
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current: boolean;
}

// Paginated Response Interface
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const TutorService = {
  /**
   * Get all tutors with pagination (Admin only)
   * @param page Page number (0-based)
   * @param size Page size
   * @returns Paginated list of tutors
   */
  getAllTutors: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Tutor>> => {
    try {
      const response = await api.get<PaginatedResponse<Tutor>>(`/admin/tutors?page=${page}&size=${size}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get pending tutors (Admin only)
   * @returns List of pending tutors
   */
  getPendingTutors: async (): Promise<PaginatedResponse<Tutor>> => {
    try {
      const response = await api.get<PaginatedResponse<Tutor>>('/admin/tutors/pending');
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Approve tutor (Admin only)
   * @param tutorId ID of the tutor to approve
   * @returns Success message
   */
  approveTutor: async (tutorId: number): Promise<any> => {
    try {
      const response = await api.post(`/admin/tutors/${tutorId}/approve`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Reject tutor (Admin only)
   * @param tutorId ID of the tutor to reject
   * @param reason Reason for rejection
   * @returns Success message
   */
  rejectTutor: async (tutorId: number, reason: string): Promise<any> => {
    try {
      const response = await api.post(`/admin/tutors/${tutorId}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Update tutor profile (Admin only)
   * @param tutorId ID of the tutor to update
   * @param profileData Profile data to update
   * @returns Updated tutor data
   */
  updateTutorProfile: async (tutorId: number, profileData: any): Promise<Tutor> => {
    try {
      const response = await api.put(`/admin/tutors/${tutorId}/profile`, profileData);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Upload certificate for current tutor
   * @param file Certificate file to upload
   * @returns Updated user response with certificates
   */
  uploadCertificate: async (file: File): Promise<UserResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UserResponse>(
        '/tutors/me/certificates',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete certificate for current tutor
   * @param certificateUrl Certificate URL to delete
   * @returns Updated user response with certificates
   */
  deleteCertificate: async (certificateUrl: string): Promise<UserResponse> => {
    try {
      const response = await api.delete<UserResponse>(
        `/tutors/me/certificates?certificateUrl=${encodeURIComponent(certificateUrl)}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get certificates for current tutor
   * @returns List of certificate URLs
   */
  getCertificates: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/tutors/me/certificates');
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Upload certificate for any tutor (Admin only)
   * @param tutorId Tutor ID to upload certificate for
   * @param file Certificate file to upload
   * @returns Updated user response with certificates
   */
  uploadCertificateForTutor: async (tutorId: number, file: File): Promise<UserResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UserResponse>(
        `/tutors/${tutorId}/certificates`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete certificate for any tutor (Admin only)
   * @param tutorId Tutor ID to delete certificate for
   * @param certificateUrl Certificate URL to delete
   * @returns Updated user response with certificates
   */
  deleteCertificateForTutor: async (tutorId: number, certificateUrl: string): Promise<UserResponse> => {
    try {
      const response = await api.delete<UserResponse>(
        `/tutors/${tutorId}/certificates?certificateUrl=${encodeURIComponent(certificateUrl)}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get certificates for any tutor (Admin only)
   * @param tutorId Tutor ID to get certificates for
   * @returns List of certificate URLs
   */
  getCertificatesForTutor: async (tutorId: number): Promise<string[]> => {
    try {
      const response = await api.get<string[]>(`/tutors/${tutorId}/certificates`);
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

export default TutorService;