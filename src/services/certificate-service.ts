import api from '@/lib/api';

export interface Certificate {
  id: string;
  courseName: string;
  completionDate: string;
  certificateUrl: string;
  score?: number;
  level?: string;
  courseId: number;
}

export interface CertificateResponse {
  content: Certificate[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const CertificateService = {
  /**
   * Lấy danh sách chứng chỉ của học viên hiện tại
   */
  getMyCertificates: async (page = 0, size = 10): Promise<CertificateResponse> => {
    const response = await api.get<CertificateResponse>(`/enrollments/my-certificates?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Lấy chứng chỉ cho một khóa học cụ thể
   */
  getCourseCertificate: async (enrollmentId: number): Promise<string> => {
    const response = await api.get<string>(`/enrollments/${enrollmentId}/certificate`);
    return response.data;
  },

  /**
   * Tạo chứng chỉ mới cho khóa học đã hoàn thành
   */
  generateCertificate: async (enrollmentId: number): Promise<string> => {
    const response = await api.post<string>(`/enrollments/${enrollmentId}/certificate`);
    return response.data;
  },

  /**
   * Lấy chứng chỉ theo ID
   */
  getCertificateById: async (certificateId: string): Promise<Certificate> => {
    const response = await api.get<Certificate>(`/certificates/${certificateId}`);
    return response.data;
  },

  /**
   * Tải xuống chứng chỉ
   */
  downloadCertificate: async (certificateUrl: string, fileName: string): Promise<void> => {
    const response = await api.get(certificateUrl, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default CertificateService;
