import axios from 'axios';
import { useAuthStore } from '../store/auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Required to send and receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Backend wraps JSON in { success, data, timestamp } via TransformInterceptor */
function unwrapApiEnvelope<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload &&
    (payload as { success: unknown }).success === true
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

// Flag to prevent multiple concurrent refresh mechanisms
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper to notify all queued requests that refresh is done
const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s, Token Refresh, and Unwrap Envelope
apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrapApiEnvelope(response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh route itself fails
    if (originalRequest.url === '/auth/refresh' && error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle standard 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, wait for it to finish and retry
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt token refresh (cookies sent automatically)
        const response = await axios.post(
          `${originalRequest.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = unwrapApiEnvelope<{ accessToken: string }>(response.data);
        
        // Update store
        useAuthStore.getState().updateToken(accessToken);

        // Notify queued requests
        isRefreshing = false;
        onRefreshed(accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired or missing)
        isRefreshing = false;
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
