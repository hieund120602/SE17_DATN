import api from '@/lib/api';

export interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
  interests?: string[];
  language?: 'vi' | 'en' | 'jp';
}

export interface NewsletterSubscriptionResponse {
  id: number;
  email: string;
  name?: string;
  interests: string[];
  language: string;
  subscribed: boolean;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterUnsubscribeResponse {
  message: string;
  success: boolean;
}

const NewsletterService = {
  /**
   * Subscribe to newsletter
   * @param subscriptionData Email and optional preferences
   * @returns Subscription confirmation
   */
  subscribe: async (subscriptionData: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse> => {
    const response = await api.post<NewsletterSubscriptionResponse>('/newsletter/subscribe', subscriptionData);
    return response.data;
  },

  /**
   * Unsubscribe from newsletter
   * @param email Email to unsubscribe
   * @returns Unsubscribe confirmation
   */
  unsubscribe: async (email: string): Promise<NewsletterUnsubscribeResponse> => {
    const response = await api.post<NewsletterUnsubscribeResponse>('/newsletter/unsubscribe', { email });
    return response.data;
  },

  /**
   * Confirm newsletter subscription via token
   * @param token Confirmation token from email
   * @returns Confirmation result
   */
  confirmSubscription: async (token: string): Promise<NewsletterSubscriptionResponse> => {
    const response = await api.get<NewsletterSubscriptionResponse>(`/newsletter/confirm/${token}`);
    return response.data;
  },

  /**
   * Update newsletter preferences
   * @param email Email address
   * @param preferences Updated preferences
   * @returns Updated subscription
   */
  updatePreferences: async (
    email: string,
    preferences: {
      interests?: string[];
      language?: string;
      name?: string;
    }
  ): Promise<NewsletterSubscriptionResponse> => {
    const response = await api.put<NewsletterSubscriptionResponse>('/newsletter/preferences', {
      email,
      ...preferences
    });
    return response.data;
  },

  /**
   * Get subscription status
   * @param email Email to check
   * @returns Subscription status
   */
  getSubscriptionStatus: async (email: string): Promise<NewsletterSubscriptionResponse> => {
    const response = await api.get<NewsletterSubscriptionResponse>(`/newsletter/status/${email}`);
    return response.data;
  }
};

export default NewsletterService; 