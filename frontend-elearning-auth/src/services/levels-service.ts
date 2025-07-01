import api from '@/lib/api';

export interface Level {
  name: string;
  description: string;
  courseCount: number;
}

export interface CreateLevelRequest {
  name: string;
  description: string;
}

export interface UpdateLevelRequest {
  name: string;
  description: string;
}

export interface ApiError {
  timestamp: string;
  message: string;
  errorCode: string;
  path: string;
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

const LevelsService = {
  getAllLevels: async (
    page = 0,
    size = 10,
    sortBy = 'name',
    direction = 'desc'
  ): Promise<PaginationResponse<Level>> => {
    try {
      const response = await api.get<PaginationResponse<Level>>(
        `/levels/paginated?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  getLevels: async (): Promise<PaginationResponse<Level>> => {
    try {
      const response = await api.get<PaginationResponse<Level>>(
        `/levels`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  createLevel: async (levelData: CreateLevelRequest): Promise<Level> => {
    try {
      const response = await api.post<Level>('/levels', levelData);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  updateLevel: async (id: number, levelData: UpdateLevelRequest): Promise<Level> => {
    try {
      const response = await api.put<Level>(`/levels/${id}`, levelData);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  deleteLevel: async (id: number): Promise<void> => {
    try {
      await api.delete(`/levels/${id}`);
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

export default LevelsService;