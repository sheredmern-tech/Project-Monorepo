import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../utils/constants';
import storageService from './storage.service';
import networkService from './network.service';
import type { LoginResponse, DocumentsResponse } from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storageService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired - logout
          await storageService.clearAll();
        }
        return Promise.reject(error);
      }
    );
  }

  // Check if request should be attempted
  private async shouldAttemptRequest(): Promise<boolean> {
    return networkService.getStatus();
  }

  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Get Documents
  async getDocuments(): Promise<DocumentsResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get<DocumentsResponse>('/documents');
    return response.data;
  }

  // Upload Document
  async uploadDocument(
    fileUri: string,
    fileName: string,
    fileType: string,
    category: string
  ): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    console.log('📤 Uploading:', { fileUri, fileName, fileType, category });

    const formData = new FormData();

    // React Native FormData format
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    formData.append('category', category);

    // Get token manually for upload (bypass interceptor issue)
    const token = await storageService.getToken();

    try {
      // Use direct axios call instead of client for multipart
      const response = await axios.post(
        `${API_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for upload
          transformRequest: (data, headers) => {
            // Let axios handle FormData transformation
            return data;
          },
        }
      );

      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      throw error;
    }
  }

  // Download Document
  async getDownloadUrl(documentId: string): Promise<string> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get(`/documents/${documentId}/download`);
    return response.data.downloadUrl;
  }
}

export default new ApiService();