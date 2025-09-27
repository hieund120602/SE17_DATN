import api from '@/lib/api';

export interface CreatePaymentRequest {
  amount: number;
  orderInfo: string;
  studentId?: number;
  courseId?: number;
  comboId?: number;
  voucherCode?: string;
  successRedirectUrl: string;
  cancelRedirectUrl: string;
}

export interface GuestPurchaseRequest {
  // Guest user information
  fullName: string;
  email: string;
  phoneNumber?: string;
  subscribeNewsletter?: boolean;

  // Payment information
  amount: number;
  orderInfo: string;
  courseId?: number;
  comboId?: number;
  voucherCode?: string;
  successRedirectUrl: string;
  cancelRedirectUrl: string;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  transactionId: string;
  orderInfo: string;
}

// QR Transfer Payment Interfaces
export interface QRTransferPaymentRequest {
  amount: number;
  orderInfo: string;
  successRedirectUrl?: string;
  cancelRedirectUrl?: string;
  bankAccountInfo?: string;
}

export interface QRTransferResponse {
  paymentId: number;
  transactionId: string;
  amount: number;
  orderInfo: string;
  qrCodeUrl: string;
  bankAccountInfo: string;
  status: string;
  createdAt: string;
  message: string;
}

export interface AdminProcessPaymentRequest {
  paymentId: number;
  action: 'approve' | 'reject';
  adminNotes?: string;
}

export interface PaymentResponse {
  id: number;
  transactionId: string;
  orderInfo: string;
  amount: number;
  status: string;
  method: string;
  successRedirectUrl?: string;
  cancelRedirectUrl?: string;
  student?: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  paidAt?: string;
  qrCodeUrl?: string;
  bankAccountInfo?: string;
  adminNotes?: string;
  adminProcessedAt?: string;
}

export interface VnpayReturnParams {
  vnp_ResponseCode?: string;
  vnp_TxnRef?: string;
  vnp_Amount?: string;
  vnp_OrderInfo?: string;
  vnp_SecureHash?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_TransactionNo?: string;
  [key: string]: string | undefined; // Allow for any other VNPay params
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  orderInfo?: string;
  amount?: number;
  redirectUrl?: string;
}

const PaymentService = {
  /**
   * Creates a payment for authenticated users ONLY
   */
  createPayment: async (paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    console.log('Calling createPayment API with data:', paymentData);
    const response = await api.post<CreatePaymentResponse>('/payments/create', paymentData);
    console.log('Payment API response:', response.data);
    return response.data;
  },

  /**
   * Creates a QR transfer payment
   */
  createQRTransferPayment: async (paymentData: QRTransferPaymentRequest): Promise<QRTransferResponse> => {
    console.log('Calling createQRTransferPayment API with data:', paymentData);
    const response = await api.post<QRTransferResponse>('/payments/qr-transfer', paymentData);
    console.log('QR Transfer Payment API response:', response.data);
    return response.data;
  },

  /**
   * Gets QR transfer payment details
   */
  getQRTransferPayment: async (paymentId: number): Promise<QRTransferResponse> => {
    const response = await api.get<QRTransferResponse>(`/payments/qr-transfer/${paymentId}`);
    return response.data;
  },

  /**
   * Gets payment details
   */
  getPayment: async (paymentId: number): Promise<PaymentResponse> => {
    const response = await api.get<PaymentResponse>(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Gets user's payment history
   */
  getMyPaymentHistory: async (page: number = 0, size: number = 10): Promise<{
    content: PaymentResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> => {
    const response = await api.get(`/payments/my-history?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Admin: Gets payments waiting for confirmation
   */
  getPaymentsWaitingConfirmation: async (page: number = 0, size: number = 10): Promise<{
    content: PaymentResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> => {
    const response = await api.get(`/payments/admin/waiting-confirmation?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Admin: Gets pending payments
   */
  getPendingPayments: async (page: number = 0, size: number = 10): Promise<{
    content: PaymentResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> => {
    const response = await api.get(`/payments/admin/pending?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Admin: Processes payment (approve/reject)
   */
  processPayment: async (request: AdminProcessPaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payments/admin/process', request);
    return response.data;
  },

  /**
   * Processes the VNPay return callback
   */
  processVnpayReturn: async (queryParams: VnpayReturnParams): Promise<PaymentVerificationResponse> => {
    const response = await api.get<PaymentVerificationResponse>('/payments/vnpay-return', {
      params: queryParams
    });
    return response.data;
  }
};

export default PaymentService;