import api from '@/lib/api';

export interface UploadFileResponse {
  url: string;
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: string;
  [key: string]: string | number; // For any additional properties
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
  [key: string]: string | boolean | number; // For any additional properties
}

const FileUploadService = {
  /**
   * Uploads a video file to cloud storage
   * @param file The video file to upload
   * @returns Promise with the upload response details
   */
  uploadVideo: async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadFileResponse>(
      '/files/upload/video',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Uploads an image file to cloud storage
   * @param file The image file to upload
   * @returns Promise with the upload response details
   */
  uploadImage: async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadFileResponse>(
      '/files/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Uploads a document file to cloud storage
   * @param file The document file to upload
   * @returns Promise with the upload response details
   */
  uploadDocument: async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadFileResponse>(
      '/files/upload/document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Deletes a file from cloud storage by its public ID
   * @param publicId The public ID of the file to delete
   * @returns Promise with the delete response details
   */
  deleteFile: async (publicId: string): Promise<DeleteFileResponse> => {
    const response = await api.delete<DeleteFileResponse>(
      `/files/delete/${publicId}`
    );

    return response.data;
  }
};

export default FileUploadService;