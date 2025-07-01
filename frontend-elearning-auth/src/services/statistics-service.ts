import api from '@/lib/api';

export interface MonthlyRevenue {
  year: number;
  month: number;
  amount: number;
  transactionCount: number;
}

export interface DashboardStatistics {
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  pendingTutorApprovals: number;
  pendingCourseApprovals: number;
  totalRevenue: number;
  totalEnrollments: number;
  recentRevenue: MonthlyRevenue[];
  enrollmentsByLevel: Record<string, number>;
}

const StatisticsService = {
  getDashboardStatistics: async (): Promise<DashboardStatistics> => {
    const response = await api.get<DashboardStatistics>('/statistics/dashboard');
    return response.data;
  }
};

export default StatisticsService;