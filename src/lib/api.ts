import axios from 'axios';

// Sử dụng domain mới với HTTPS
export const API_BASE_URL = 'https://backendlearning.xyz/api';

// Create an axios instance with custom config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from cookies or localStorage
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    // Add token to headers if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Special handling for FormData (don't set Content-Type as axios will set it with boundary)
    if (config.data instanceof FormData) {
      // Let the browser set the correct content type with boundary for multipart/form-data
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Handle different error scenarios
    if (error.response) {
      // Server responded with non-2xx status
      const { status, data } = error.response;

      console.log(`Error ${status}:`, data);

      if (status === 401) {
        // Handle auth error - redirect to login
        console.log('Authentication error. Redirecting to login...');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      console.log('Network error. No response received.');
    } else {
      // Error in request setup
      console.log('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;