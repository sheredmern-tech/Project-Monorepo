import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../utils/constants';
import storageService from './storage.service';
import networkService from './network.service';
import type { 
  LoginResponse, 
  PerkaraListResponse, 
  PerkaraDetail,
  DokumenListResponse,
  KlienListResponse,
  CreatePerkaraDto,
  UpdatePerkaraDto,
  UploadDokumenResponse 
} from '../types';

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
        console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Response ${response.config.url}:`, response.data);
        return response;
      },
      async (error) => {
        console.error(`❌ Error ${error.config?.url}:`, error.response?.data);
        
        if (error.response?.status === 401) {
          // Token expired - try refresh
          const refreshSuccessful = await this.refreshToken();
          
          if (refreshSuccessful) {
            // Retry original request
            return this.client.request(error.config);
          } else {
            // Refresh failed - logout
            await storageService.clearAll();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Check if request should be attempted
  private async shouldAttemptRequest(): Promise<boolean> {
    return networkService.getStatus();
  }

  // ========================================
  // AUTH ENDPOINTS
  // ========================================
  
  async login(email: string, password: string): Promise<LoginResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    // Save token
    if (response.data.accessToken) {
      await storageService.setToken(response.data.accessToken);
      await storageService.setUser(response.data.user);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    // Clear local storage
    await storageService.clearAll();
    // Optionally call server logout endpoint if exists
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.client.post('/auth/refresh');
      if (response.data.accessToken) {
        await storageService.setToken(response.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async getProfile(): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // ========================================
  // PERKARA (CASE) ENDPOINTS
  // ========================================

  async getPerkara(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PerkaraListResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get<PerkaraListResponse>('/perkara', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search,
        status: params?.status,
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || 'desc',
      },
    });
    return response.data;
  }

  async getPerkaraById(id: string): Promise<PerkaraDetail> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get<PerkaraDetail>(`/perkara/${id}`);
    return response.data;
  }

  async createPerkara(data: CreatePerkaraDto): Promise<PerkaraDetail> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post<PerkaraDetail>('/perkara', data);
    return response.data;
  }

  async updatePerkara(id: string, data: UpdatePerkaraDto): Promise<PerkaraDetail> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch<PerkaraDetail>(`/perkara/${id}`, data);
    return response.data;
  }

  async deletePerkara(id: string): Promise<void> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    await this.client.delete(`/perkara/${id}`);
  }

  // Update phase for a case
  async updatePerkaraPhase(id: string, phase: number): Promise<PerkaraDetail> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch<PerkaraDetail>(`/perkara/${id}`, {
      currentPhase: phase,
    });
    return response.data;
  }

  // ========================================
  // DOKUMEN (DOCUMENT) ENDPOINTS
  // ========================================

  async getDokumen(perkaraId?: string): Promise<DokumenListResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get<DokumenListResponse>('/dokumen', {
      params: {
        perkaraId,
        limit: 100, // Get all docs for a case
      },
    });
    return response.data;
  }

  async getDokumenById(id: string): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get(`/dokumen/${id}`);
    return response.data;
  }

  async uploadDokumen(
    fileUri: string,
    fileName: string,
    fileType: string,
    perkaraId: string,
    kategori: string,
    phase: number,
    isRequired: boolean = false,
    isOptional: boolean = false
  ): Promise<UploadDokumenResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    console.log('📤 Uploading document:', {
      fileName,
      perkaraId,
      kategori,
      phase,
    });

    const formData = new FormData();

    // React Native FormData format
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    // Additional metadata
    formData.append('perkaraId', perkaraId);
    formData.append('kategori', kategori);
    formData.append('phase', phase.toString());
    formData.append('isRequired', isRequired.toString());
    formData.append('isOptional', isOptional.toString());
    formData.append('namaDokumen', fileName);

    // Get token manually for upload
    const token = await storageService.getToken();

    try {
      // Use direct axios call for multipart
      const response = await axios.post<UploadDokumenResponse>(
        `${API_URL}/dokumen`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for upload
        }
      );

      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateDokumenStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch(`/dokumen/${id}`, {
      reviewStatus: status,
      reviewNotes: notes,
    });
    return response.data;
  }

  async deleteDokumen(id: string): Promise<void> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    await this.client.delete(`/dokumen/${id}`);
  }

  async getDownloadUrl(documentId: string): Promise<string> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get(`/dokumen/${documentId}/download`);
    return response.data.downloadUrl;
  }

  // ========================================
  // KLIEN (CLIENT) ENDPOINTS
  // ========================================

  async getKlien(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<KlienListResponse> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get<KlienListResponse>('/klien', {
      params,
    });
    return response.data;
  }

  async getKlienById(id: string): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get(`/klien/${id}`);
    return response.data;
  }

  async createKlien(data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post('/klien', data);
    return response.data;
  }

  async updateKlien(id: string, data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch(`/klien/${id}`, data);
    return response.data;
  }

  // ========================================
  // TUGAS (TASK) ENDPOINTS
  // ========================================

  async getTugas(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assignedToId?: string;
    perkaraId?: string;
  }): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get('/tugas', { params });
    return response.data;
  }

  async getTugasById(id: string): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get(`/tugas/${id}`);
    return response.data;
  }

  async createTugas(data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post('/tugas', data);
    return response.data;
  }

  async updateTugas(id: string, data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch(`/tugas/${id}`, data);
    return response.data;
  }

  async updateTugasStatus(id: string, status: string): Promise<any> {
    return this.updateTugas(id, { status });
  }

  // ========================================
  // SIDANG (COURT SESSION) ENDPOINTS
  // ========================================

  async getSidang(params?: {
    perkaraId?: string;
    status?: string;
  }): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get('/sidang', { params });
    return response.data;
  }

  async createSidang(data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post('/sidang', data);
    return response.data;
  }

  async updateSidang(id: string, data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch(`/sidang/${id}`, data);
    return response.data;
  }

  // ========================================
  // CATATAN (NOTES) ENDPOINTS
  // ========================================

  async getCatatan(perkaraId: string): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get('/catatan', {
      params: { perkaraId },
    });
    return response.data;
  }

  async createCatatan(data: {
    perkaraId: string;
    isi: string;
    kategori?: string;
  }): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.post('/catatan', data);
    return response.data;
  }

  async updateCatatan(id: string, data: any): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.patch(`/catatan/${id}`, data);
    return response.data;
  }

  async deleteCatatan(id: string): Promise<void> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    await this.client.delete(`/catatan/${id}`);
  }

  // ========================================
  // DASHBOARD & STATISTICS
  // ========================================

  async getDashboardStats(): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get('/dashboard/statistics');
    return response.data;
  }

  async getPerkaraStats(id: string): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get(`/perkara/${id}/statistics`);
    return response.data;
  }

  // ========================================
  // LOG AKTIVITAS (ACTIVITY LOG) ENDPOINTS
  // ========================================

  async getLogAktivitas(params?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    if (!(await this.shouldAttemptRequest())) {
      throw new Error('No internet connection');
    }

    const response = await this.client.get('/log-aktivitas', { params });
    return response.data;
  }
}

export default new ApiService();
