import api from '../lib/api';

// Resource Response Interface
export interface ResourceResponse {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  mimeType?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Document Access Response Interface  
export interface DocumentAccessResponse {
  resourceId: string;
  signedUrl: string;
  expiresAt: string;
  accessGranted: boolean;
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

const DocumentService = {
  /**
   * Get document with signed URL for secure access
   * @param resourceId Resource ID of the document
   * @returns Document access response with signed URL
   */
  getDocument: async (resourceId: string): Promise<DocumentAccessResponse> => {
    try {
      const response = await api.get<DocumentAccessResponse>(`/documents/${resourceId}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Get direct signed URL for document (shortcut method)
   * @param resourceId Resource ID of the document
   * @returns Signed URL string
   */
  getSignedUrl: async (resourceId: string): Promise<string> => {
    try {
      const documentAccess = await DocumentService.getDocument(resourceId);
      return documentAccess.signedUrl;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Download document directly
   * @param resourceId Resource ID of the document
   * @param filename Optional filename for download
   * @returns Blob data for download
   */
  downloadDocument: async (resourceId: string, filename?: string): Promise<Blob> => {
    try {
      const signedUrl = await DocumentService.getSignedUrl(resourceId);

      // Use fetch to download from signed URL
      const response = await fetch(signedUrl);

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`);
      }

      const blob = await response.blob();

      // If filename provided, trigger download
      if (filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        try {
          document.body.appendChild(a);
          a.click();
        } finally {
          // Use element.remove() to avoid NotFoundError if node was detached
          a.remove();
          window.URL.revokeObjectURL(url);
        }
      }

      return blob;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Open document in new tab/window
   * @param resourceId Resource ID of the document
   * @returns Promise that resolves when document is opened
   */
  openDocument: async (resourceId: string): Promise<void> => {
    try {
      const signedUrl = await DocumentService.getSignedUrl(resourceId);
      window.open(signedUrl, '_blank');
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  /**
   * Check if user has access to document
   * @param resourceId Resource ID to check access for
   * @returns Boolean indicating access permission
   */
  checkDocumentAccess: async (resourceId: string): Promise<boolean> => {
    try {
      const documentAccess = await DocumentService.getDocument(resourceId);
      return documentAccess.accessGranted;
    } catch (error: any) {
      // If we get an error, assume no access
      return false;
    }
  },

  /**
   * Get document metadata without accessing the file
   * @param resourceId Resource ID to get metadata for
   * @returns Resource metadata
   */
  getDocumentMetadata: async (resourceId: string): Promise<ResourceResponse> => {
    try {
      const response = await api.get<ResourceResponse>(`/documents/${resourceId}/metadata`);
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

  // Handle specific document access errors
  if (error.response?.status === 403) {
    return new Error('Bạn không có quyền truy cập tài liệu này.');
  }

  if (error.response?.status === 404) {
    return new Error('Không tìm thấy tài liệu.');
  }

  return new Error(error.message || 'Đã xảy ra lỗi khi truy cập tài liệu. Vui lòng thử lại sau.');
};

export default DocumentService;