import api from '@/lib/api';

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

export interface UpdateTutorProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  teachingRequirements?: string;
  educations?: Education[];
  experiences?: Experience[];
}

export interface Tutor {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  roles: string[];
  userType: string;
  createdAt: string;
  updatedAt: string;
  teachingRequirements: string;
  educations: Education[];
  experiences: Experience[];
  certificateUrls: any;
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

const TutorService = {
  getAllTutors: async (page = 0, size = 10): Promise<PaginationResponse<Tutor>> => {
    const response = await api.get<PaginationResponse<Tutor>>(`/admin/users/tutors?page=${page}&size=${size}`);
    return response.data;
  },

  getPendingTutors: async (page = 0, size = 10): Promise<PaginationResponse<Tutor>> => {
    const response = await api.get<PaginationResponse<Tutor>>(`/admin/users/tutors/pending?page=${page}&size=${size}`);
    return response.data;
  },

  approveTutor: async (tutorId: number): Promise<Tutor> => {
    const response = await api.put<Tutor>(`/admin/users/tutors/${tutorId}/approve`);
    return response.data;
  },

  rejectTutor: async (tutorId: number, reason: string): Promise<Tutor> => {
    const response = await api.put<Tutor>(`/admin/users/tutors/${tutorId}/reject`, null, {
      params: { reason },
    });
    return response.data;
  },

  // New method to update tutor profile by ID (for admin use)
  updateTutorProfile: async (tutorId: number, profileData: UpdateTutorProfileRequest): Promise<Tutor> => {
    const response = await api.put<Tutor>(`/users/${tutorId}/tutor-profile`, profileData);
    return response.data;
  },
};

export default TutorService;