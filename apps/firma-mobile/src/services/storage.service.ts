import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  // Auth Token
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // User Data
  async saveUser(user: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  async getUser(): Promise<any | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Documents Cache
  async saveDocuments(documents: any[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DOCUMENTS_CACHE,
      JSON.stringify(documents)
    );
  }

  async getDocuments(): Promise<any[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS_CACHE);
    return data ? JSON.parse(data) : [];
  }

  // Upload Queue
  async saveUploadQueue(queue: any[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.UPLOAD_QUEUE,
      JSON.stringify(queue)
    );
  }

  async getUploadQueue(): Promise<any[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  // Last Sync Time
  async saveLastSyncTime(timestamp: number): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      timestamp.toString()
    );
  }

  async getLastSyncTime(): Promise<number | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return data ? parseInt(data, 10) : null;
  }

  // Clear All
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.DOCUMENTS_CACHE,
      STORAGE_KEYS.UPLOAD_QUEUE,
      STORAGE_KEYS.LAST_SYNC,
    ]);
  }
}

export default new StorageService();