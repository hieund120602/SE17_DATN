import api from '../lib/api';

// Dashboard Statistics Response Types
export interface DashboardStatisticsResponse {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  activeCourses: number;
  completedEnrollments: number;
  averageRating: number;
  newUsersThisMonth: number;
  newCoursesThisMonth: number;
  recentActivity?: string[];
}

// Payment Statistics Response Types
export interface PaymentStatisticsResponse {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  dailyRevenue: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  paymentMethodStats: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

// Payment History Response Types
export interface PaymentHistoryResponse {
  id: number;
  studentName: string;
  studentEmail: string;
  courseName?: string;
  comboName?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  description?: string;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const StatisticsService = {
  /**
   * Get dashboard statistics for admin
   * @returns Dashboard statistics with various metrics
   */
  getDashboardStatistics: async (): Promise<DashboardStatisticsResponse> => {
    try {
      const response = await api.get<DashboardStatisticsResponse>('/statistics/dashboard');
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get payment statistics for a date range
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @returns Payment statistics with various metrics
   */
  getPaymentStatistics: async (startDate: string, endDate: string): Promise<PaymentStatisticsResponse> => {
    try {
      const response = await api.get<PaymentStatisticsResponse>(
        `/statistics/payments?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all payment history for admin
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @returns All payment history for the date range
   */
  getAllPaymentHistory: async (startDate: string, endDate: string): Promise<PaymentHistoryResponse[]> => {
    try {
      const response = await api.get<PaymentHistoryResponse[]>(
        `/statistics/payments/history?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get payment history for a specific course
   * @param courseId Course ID
   * @returns Payment history for the course
   */
  getCoursePaymentHistory: async (courseId: number): Promise<PaymentHistoryResponse[]> => {
    try {
      const response = await api.get<PaymentHistoryResponse[]>(`/statistics/payments/history/course/${courseId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get tutor payment history (for current tutor)
   * @returns Payment history for current tutor's courses
   */
  getTutorPaymentHistory: async (): Promise<PaymentHistoryResponse[]> => {
    try {
      const response = await api.get<PaymentHistoryResponse[]>('/statistics/payments/history/tutor');
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get tutor payment history by ID (admin only)
   * @param tutorId Tutor ID
   * @returns Payment history for the specific tutor's courses
   */
  getTutorPaymentHistoryById: async (tutorId: number): Promise<PaymentHistoryResponse[]> => {
    try {
      const response = await api.get<PaymentHistoryResponse[]>(`/statistics/payments/history/tutor/${tutorId}`);
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

export default StatisticsService;