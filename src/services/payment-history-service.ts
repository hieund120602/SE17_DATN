import api from '@/lib/api';

export interface PaymentHistoryResponse {
  id: number;
  studentId: number;
  studentName: string;
  courseId?: number;
  courseName?: string;
  comboId?: number;
  comboName?: string;
  amount: number;
  pricePaid: number;
  voucherCode?: string;
  voucherDiscount?: number;
  paymentMethod: string;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  orderInfo: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentHistoryService = {
  /**
   * Get payment history for the current authenticated student
   * @returns List of payment history records
   */
  getMyPaymentHistory: async (): Promise<PaymentHistoryResponse[]> => {
    const response = await api.get<PaymentHistoryResponse[]>('/payment-history/my-history');
    return response.data;
  },

  /**
   * Get payment history for a specific student (admin only)
   * @param studentId ID of the student
   * @returns List of payment history records
   */
  getStudentPaymentHistory: async (studentId: number): Promise<PaymentHistoryResponse[]> => {
    const response = await api.get<PaymentHistoryResponse[]>(`/payment-history/student/${studentId}`);
    return response.data;
  }
};

export default PaymentHistoryService; 