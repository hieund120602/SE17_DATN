import api from '@/lib/api';

export interface Level {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  title: string;
  level: Level;
  price: number;
  thumbnailUrl: string;
  tutor: {
    id: number;
    fullName: string;
    avatarUrl: string;
    teachingRequirements: string;
  };
}

export interface Combo {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  thumbnailUrl: string;
  courses: Course[];
  validUntil: string;
  accessPeriodMonths: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface ComboCreateUpdateRequest {
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  thumbnailUrl: string;
  isActive: boolean;
  courseIds: number[];
  validUntil: string;
  accessPeriodMonths: number;
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

const ComboService = {
  getAllCombos: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Combo>> => {
    const response = await api.get<PaginationResponse<Combo>>(
      `/admin/combos?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  getPublicCombo: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Combo>> => {
    const response = await api.get<PaginationResponse<Combo>>(
      `/combos?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  getComboById: async (comboId: number): Promise<Combo> => {
    const response = await api.get<Combo>(`/admin/combos/${comboId}`);
    return response.data;
  },

  createCombo: async (comboData: ComboCreateUpdateRequest): Promise<Combo> => {
    const response = await api.post<Combo>('/admin/combos', comboData);
    return response.data;
  },

  updateCombo: async (comboId: number, comboData: ComboCreateUpdateRequest): Promise<Combo> => {
    const response = await api.put<Combo>(`/admin/combos/${comboId}`, comboData);
    return response.data;
  },

  deleteCombo: async (comboId: number): Promise<void> => {
    await api.delete(`/admin/combos/${comboId}`);
  },

  uploadThumbnail: async (comboId: number, file: File): Promise<Combo> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Combo>(
      `/admin/combos/${comboId}/thumbnail`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default ComboService;