import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { 
  User, 
  Document, 
  DokumenHukum,
  Perkara,
  Case,
  Tugas,
  UploadQueueItem 
} from '../types';

class StorageService {
  // ========================================
  // AUTH STORAGE
  // ========================================

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save token:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // ========================================
  // CASE (PERKARA) STORAGE
  // ========================================

  async saveCases(cases: Case[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.CASES_CACHE}`;
      await AsyncStorage.setItem(key, JSON.stringify(cases));
    } catch (error) {
      console.error('Failed to save cases:', error);
      throw error;
    }
  }

  async getCases(): Promise<Case[]> {
    try {
      const key = `${STORAGE_KEYS.CASES_CACHE}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cases:', error);
      return [];
    }
  }

  async getCaseById(id: string): Promise<Case | null> {
    try {
      const cases = await this.getCases();
      return cases.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Failed to get case by ID:', error);
      return null;
    }
  }

  async updateCaseWithServerId(localId: string, serverId: string): Promise<void> {
    try {
      const cases = await this.getCases();
      const index = cases.findIndex(c => c.id === localId);
      
      if (index !== -1) {
        cases[index].id = serverId;
        await this.saveCases(cases);
      }
    } catch (error) {
      console.error('Failed to update case with server ID:', error);
    }
  }

  // ========================================
  // DOCUMENT STORAGE
  // ========================================

  async saveDocuments(documents: Document[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DOCUMENTS_CACHE,
        JSON.stringify(documents)
      );
    } catch (error) {
      console.error('Failed to save documents:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<Document[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS_CACHE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  async saveDocumentsForCase(caseId: string, documents: DokumenHukum[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.DOCUMENTS_CACHE}_${caseId}`;
      await AsyncStorage.setItem(key, JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to save documents for case:', error);
      throw error;
    }
  }

  async getDocumentsForCase(caseId: string): Promise<DokumenHukum[]> {
    try {
      const key = `${STORAGE_KEYS.DOCUMENTS_CACHE}_${caseId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get documents for case:', error);
      return [];
    }
  }

  async updateDocumentSyncStatus(
    documentId: string, 
    status: 'synced' | 'pending' | 'uploading' | 'failed'
  ): Promise<void> {
    try {
      // Update in general documents cache
      const documents = await this.getDocuments();
      const index = documents.findIndex(d => d.id === documentId);
      
      if (index !== -1) {
        documents[index].syncStatus = status;
        await this.saveDocuments(documents);
      }

      // Also update in case-specific cache if needed
      // This would require iterating through all case caches
    } catch (error) {
      console.error('Failed to update document sync status:', error);
    }
  }

  // ========================================
  // TASK (TUGAS) STORAGE
  // ========================================

  async saveTasks(tasks: Tugas[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.TASKS_CACHE}`;
      await AsyncStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
      throw error;
    }
  }

  async getTasks(): Promise<Tugas[]> {
    try {
      const key = `${STORAGE_KEYS.TASKS_CACHE}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  // ========================================
  // UPLOAD QUEUE STORAGE
  // ========================================

  async saveUploadQueue(queue: UploadQueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save upload queue:', error);
      throw error;
    }
  }

  async getUploadQueue(): Promise<UploadQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get upload queue:', error);
      return [];
    }
  }

  // ========================================
  // SYNC METADATA STORAGE
  // ========================================

  async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? parseInt(data, 10) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  // ========================================
  // OFFLINE DATA MANAGEMENT
  // ========================================

  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      const offlineKey = `${STORAGE_KEYS.OFFLINE_DATA}_${key}`;
      await AsyncStorage.setItem(offlineKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
      throw error;
    }
  }

  async getOfflineData(key: string): Promise<any | null> {
    try {
      const offlineKey = `${STORAGE_KEYS.OFFLINE_DATA}_${key}`;
      const data = await AsyncStorage.getItem(offlineKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async clearOfflineData(key: string): Promise<void> {
    try {
      const offlineKey = `${STORAGE_KEYS.OFFLINE_DATA}_${key}`;
      await AsyncStorage.removeItem(offlineKey);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  // ========================================
  // CACHE MANAGEMENT
  // ========================================

  async clearCache(): Promise<void> {
    try {
      const keysToKeep = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA];
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ All storage cleared');
    } catch (error) {
      console.error('Failed to clear all storage:', error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async getStorageInfo(): Promise<{
    keys: string[];
    totalSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        keys,
        totalSize,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { keys: [], totalSize: 0 };
    }
  }

  async exportData(): Promise<Record<string, any>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to export data:', error);
      return {};
    }
  }

  async importData(data: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
      }
      
      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

// Update STORAGE_KEYS in constants.ts to include new keys
export const STORAGE_KEYS_EXTENDED = {
  ...STORAGE_KEYS,
  CASES_CACHE: '@firma_cases_cache',
  TASKS_CACHE: '@firma_tasks_cache',
  OFFLINE_DATA: '@firma_offline_data',
};

export default new StorageService();
