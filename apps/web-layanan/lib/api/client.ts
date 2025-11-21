import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Response from ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      // 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // 403 Forbidden
      if (status === 403) {
        if (typeof window !== 'undefined') {
          alert('Anda tidak memiliki akses ke resource ini');
        }
      }

      // 500 Server Error
      if (status === 500) {
        if (typeof window !== 'undefined') {
          alert('Terjadi kesalahan pada server. Silakan coba lagi.');
        }
      }

      console.error(`❌ API Error [${status}]:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response from server');
      if (typeof window !== 'undefined') {
        alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;