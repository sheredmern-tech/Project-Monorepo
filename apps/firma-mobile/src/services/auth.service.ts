import apiService from './api.service';
import storageService from './storage.service';
import syncService from './sync.service';
import type { LoginResponse } from '../types';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiService.login(email, password);

    // Validate role
    if (response.user.role !== 'client') {
      throw new Error('Only client users can access this app');
    }

    // Save auth data
    await storageService.saveToken(response.accessToken);
    await storageService.saveUser(response.user);

    // Start sync
    syncService.startAutoSync();

    return response;
  }

  async logout(): Promise<void> {
    // Stop sync
    syncService.stopAutoSync();

    // Clear all data
    await storageService.clearAll();
  }

  async getUser(): Promise<any> {
    return storageService.getUser();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await storageService.getToken();
    return !!token;
  }
}

export default new AuthService();