import api from './api';
import Cookies from 'js-cookie';



export interface RegisterParams {
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface TutorRegisterParams {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  teachingRequirements: string;
  educations: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experiences: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }[];
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string;
  data: any
  avatarUrl: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  data: any;
  roles: any;
}

export interface VerifyEmailResponse {
  message: string;
}

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: 'strict' as const,     // Prevent CSRF attacks
  expires: 30                      // 30 days expiration for refreshToken
};

const AuthService = {
  // Register a new user
  async register(params: RegisterParams): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/student', params);
    const { token, refreshToken } = response.data;

    // Save tokens to cookies with proper configuration
    Cookies.set('token', token, {
      ...COOKIE_OPTIONS,
      expires: 1 // 1 day for access token
    });
    Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);

    return response.data;
  },

  // Register a new tutor
  async registerTutor(params: TutorRegisterParams): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/tutor', params);
    const { token, refreshToken } = response.data;

    // Save tokens to cookies with proper configuration
    Cookies.set('token', token, {
      ...COOKIE_OPTIONS,
      expires: 1 // 1 day for access token
    });
    Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);

    return response.data;
  },

  // Verify email with token
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    try {
      const response = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
      // Đảm bảo luôn trả về đúng định dạng phản hồi
      return {
        message: response.data.message || "Email của bạn đã được xác thực thành công."
      };
    } catch (error) {
      console.error("Email verification error:", error);
      // Trả về lỗi để component xử lý
      throw error;
    }
  },

  // Login with existing credentials
  async login(params: LoginParams): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', params);
    const { token, refreshToken } = response.data;

    // Save tokens to cookies with proper configuration
    Cookies.set('token', token, {
      ...COOKIE_OPTIONS,
      expires: 1 // 1 day for access token
    });
    Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);

    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  // Log out the current user
  logout(): void {
    Cookies.remove('token');
    Cookies.remove('token');
  },

  // Get the current user information from the token
  async getCurrentUser(): Promise<User | null> {
    const token = Cookies.get('token');
    if (!token) return null;

    try {
      // Fetch user profile from the API
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      // If the request fails (e.g., token expired), try to refresh the token
      const newToken = await this.refreshToken();

      // If token refresh was successful, try again
      if (newToken) {
        try {
          const response = await api.get<User>('/users/me');
          return response.data;
        } catch {
          return null;
        }
      }

      return null;
    }
  },

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!Cookies.get('token');
  },

  // Refresh the access token using the refresh token
  async refreshToken(): Promise<string | null> {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken
      });

      const { accessToken } = response.data;

      // Save new access token to cookies
      Cookies.set('token', accessToken, {
        ...COOKIE_OPTIONS,
        expires: 1
      });

      return accessToken;
    } catch (error) {
      // If refresh fails, clear cookies and force re-login
      AuthService.logout();
      return null;
    }
  }
};

export default AuthService;