// ============================================================================
// FILE 2: lib/api/client.ts - Improved Error Handling
// ============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/config/constants";
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ServerError,
  RateLimitError,
} from "@/lib/utils/errors";

interface BackendErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  errors?: Array<{
    property: string;
    constraints: Record<string, string>;
  }>;
  timestamp?: string;
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response) => {
    // Handle wrapped responses
    if (response.data?.success && response.data?.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError<BackendErrorResponse>) => {
    // Network errors
    if (!error.response) {
      throw new NetworkError(
        error.message || 'Tidak dapat terhubung ke server'
      );
    }

    const { status, data } = error.response;

    // Extract error message
    const backendMessage = data?.message;
    const errorMessage = Array.isArray(backendMessage)
      ? backendMessage.join(', ')
      : backendMessage || data?.error || 'Terjadi kesalahan';

    // Handle specific status codes
    switch (status) {
      case 400: {
        // Check if it's a validation error with field-specific errors
        if (data?.errors && Array.isArray(data.errors)) {
          const validationErrors: Record<string, string[]> = {};
          data.errors.forEach((err) => {
            validationErrors[err.property] = Object.values(err.constraints);
          });
          throw new ValidationError(errorMessage, validationErrors);
        }
        throw new ValidationError(errorMessage);
      }

      case 401: {
        // Clear auth data
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        
        // Redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        
        throw new AuthenticationError(errorMessage);
      }

      case 403:
        throw new AuthorizationError(errorMessage);

      case 404:
        throw new NotFoundError(errorMessage, data);

      case 409:
        throw new ConflictError(errorMessage, data);

      case 422:
        throw new ValidationError(errorMessage);

      case 429: {
        const retryAfter = error.response.headers['retry-after'];
        throw new RateLimitError(
          errorMessage,
          retryAfter ? parseInt(retryAfter, 10) : undefined
        );
      }

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(errorMessage, data);

      default:
        throw new ApiError(status, errorMessage, error.code, data);
    }
  }
);

export default apiClient;