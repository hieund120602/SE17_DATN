import api from '@/lib/api';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Level {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tutor {
  id: number;
  fullName: string;
  avatarUrl: string;
  teachingRequirements: string;
}

export interface CourseBasic {
  id: number;
  title: string;
  level: Level;
  price: number;
  thumbnailUrl: string;
  tutor: Tutor;
}

export interface ComboBasic {
  id: number;
  title: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  thumbnailUrl: string;
  courseCount: number;
  validUntil: string;
}

export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchaseAmount: number;
  maximumDiscountAmount: number;
  validFrom: string;
  validUntil: string;
  totalUsageLimit: number;
  perUserLimit: number;
  usageCount: number;
  applicableCourses: CourseBasic[];
  applicableCombos: ComboBasic[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface VoucherCreateUpdateRequest {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchaseAmount: number;
  maximumDiscountAmount: number;
  validFrom: string;
  validUntil: string;
  totalUsageLimit: number;
  perUserLimit: number;
  applicableCourseIds: number[];
  applicableComboIds: number[];
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

const VoucherService = {
  getAllVouchers: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<PaginationResponse<Voucher>> => {
    const response = await api.get<PaginationResponse<Voucher>>(
      `/vouchers?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  getVoucherById: async (voucherId: number): Promise<Voucher> => {
    const response = await api.get<Voucher>(`/vouchers/${voucherId}`);
    return response.data;
  },

  createVoucher: async (voucherData: VoucherCreateUpdateRequest): Promise<Voucher> => {
    const response = await api.post<Voucher>('/vouchers', voucherData);
    return response.data;
  },

  updateVoucher: async (voucherId: number, voucherData: VoucherCreateUpdateRequest): Promise<Voucher> => {
    const response = await api.put<Voucher>(`/vouchers/${voucherId}`, voucherData);
    return response.data;
  },

  deleteVoucher: async (voucherId: number): Promise<void> => {
    await api.delete(`/vouchers/${voucherId}`);
  },

  validateVoucher: async (code: string, courseId?: number, comboId?: number): Promise<Voucher> => {
    const params = new URLSearchParams();

    if (courseId !== undefined) {
      params.append('courseId', courseId.toString());
    }

    if (comboId !== undefined) {
      params.append('comboId', comboId.toString());
    }

    const url = `/vouchers/validate/${code}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<Voucher>(url);
    return response.data;
  }
};

export default VoucherService;