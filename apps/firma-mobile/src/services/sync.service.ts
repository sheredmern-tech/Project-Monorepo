import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api.service';
import storageService from './storage.service';
import networkService from './network.service';
import dataTransformService from './data-transform.service';
import { STORAGE_KEYS, SYNC_CONFIG } from '../utils/constants';
import type { 
  UploadQueueItem, 
  SyncStatus,
  Perkara,
  DokumenHukum,
  Case
} from '../types';

class SyncService {
  private syncInProgress = false;
  private uploadQueue: UploadQueueItem[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadUploadQueue();
    this.startAutoSync();
  }

  // ========================================
  // AUTO SYNC MANAGEMENT
  // ========================================

  /**
   * Start automatic sync interval
   */
  private startAutoSync() {
    // Clear existing interval if any
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up new interval
    this.syncInterval = setInterval(() => {
      if (networkService.getStatus() && !this.syncInProgress) {
        this.syncAll();
      }
    }, SYNC_CONFIG.AUTO_SYNC_INTERVAL);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ========================================
  // MAIN SYNC OPERATIONS
  // ========================================

  /**
   * Sync all data (cases, documents, etc.)
   */
  async syncAll(): Promise<void> {
    if (this.syncInProgress || !networkService.getStatus()) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting sync...');

    try {
      // 1. Process upload queue first
      await this.processUploadQueue();

      // 2. Pull latest data from server
      await this.pullLatestData();

      // 3. Update last sync time
      await this.updateLastSyncTime();

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Pull latest data from server
   */
  private async pullLatestData(): Promise<void> {
    try {
      // Get user to determine what to fetch
      const user = await storageService.getUser();
      if (!user) return;

      // Fetch based on user role
      await Promise.all([
        this.syncPerkara(user.id, user.role),
        this.syncDokumen(),
        this.syncTugas(user.id),
      ]);
    } catch (error) {
      console.error('Failed to pull data:', error);
      throw error;
    }
  }

  /**
   * Sync perkara (cases) data
   */
  private async syncPerkara(userId: string, userRole: string): Promise<void> {
    try {
      // Fetch perkara list
      const response = await apiService.getPerkara({
        limit: 100, // Get more cases
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });

      // Transform to Case format for compatibility
      const cases: Case[] = dataTransformService.perkaraListToCases(response.data);

      // Save to storage
      await storageService.saveCases(cases);

      console.log(`📥 Synced ${cases.length} cases`);
    } catch (error) {
      console.error('Failed to sync perkara:', error);
    }
  }

  /**
   * Sync dokumen (documents) data
   */
  private async syncDokumen(): Promise<void> {
    try {
      // Get all cached cases to fetch their documents
      const cases = await storageService.getCases();
      
      for (const caseData of cases) {
        try {
          // Fetch documents for each case
          const response = await apiService.getDokumen(caseData.id);
          
          // Save documents to storage
          await storageService.saveDocumentsForCase(caseData.id, response.data);
          
          console.log(`📥 Synced ${response.data.length} documents for case ${caseData.case_number}`);
        } catch (error) {
          console.error(`Failed to sync documents for case ${caseData.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync documents:', error);
    }
  }

  /**
   * Sync tugas (tasks) data
   */
  private async syncTugas(userId: string): Promise<void> {
    try {
      const response = await apiService.getTugas({
        assignedToId: userId,
        limit: 100,
      });

      await storageService.saveTasks(response.data);
      
      console.log(`📥 Synced ${response.data.length} tasks`);
    } catch (error) {
      console.error('Failed to sync tasks:', error);
    }
  }

  // ========================================
  // UPLOAD QUEUE MANAGEMENT
  // ========================================

  /**
   * Add item to upload queue
   */
  async addToUploadQueue(item: Omit<UploadQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
    const queueItem: UploadQueueItem = {
      ...item,
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: SYNC_CONFIG.MAX_RETRIES,
    };

    this.uploadQueue.push(queueItem);
    await this.saveUploadQueue();

    // Try to process immediately if online
    if (networkService.getStatus()) {
      this.processUploadQueue();
    }
  }

  /**
   * Process upload queue
   */
  private async processUploadQueue(): Promise<void> {
    const pendingItems = this.uploadQueue.filter(
      item => item.status === 'pending' || item.status === 'failed'
    );

    if (pendingItems.length === 0) {
      return;
    }

    console.log(`📤 Processing ${pendingItems.length} pending uploads...`);

    for (const item of pendingItems) {
      await this.processQueueItem(item);
    }

    // Save updated queue
    await this.saveUploadQueue();
  }

  /**
   * Process single queue item
   */
  private async processQueueItem(item: UploadQueueItem): Promise<void> {
    // Check retry limit
    if (item.retryCount >= item.maxRetries) {
      console.log(`⏭️ Skipping item ${item.id} - max retries reached`);
      return;
    }

    // Update status
    item.status = 'uploading';
    item.lastAttempt = Date.now();

    try {
      // Process based on type
      switch (item.type) {
        case 'document':
          await this.uploadDocument(item);
          break;
        case 'case':
          await this.uploadCase(item);
          break;
        case 'task':
          await this.uploadTask(item);
          break;
        case 'note':
          await this.uploadNote(item);
          break;
        default:
          throw new Error(`Unknown upload type: ${item.type}`);
      }

      // Success - remove from queue
      this.uploadQueue = this.uploadQueue.filter(i => i.id !== item.id);
      console.log(`✅ Upload successful: ${item.type} ${item.id}`);
    } catch (error: any) {
      // Failed - update retry count
      item.status = 'failed';
      item.retryCount++;
      item.error = error.message;
      
      console.error(`❌ Upload failed (attempt ${item.retryCount}):`, error.message);
      
      // If temporary error, schedule retry
      if (this.isRetryableError(error)) {
        setTimeout(() => {
          if (networkService.getStatus()) {
            this.processQueueItem(item);
          }
        }, SYNC_CONFIG.RETRY_DELAY * Math.pow(2, item.retryCount - 1)); // Exponential backoff
      }
    }
  }

  /**
   * Upload document from queue
   */
  private async uploadDocument(item: UploadQueueItem): Promise<void> {
    if (!item.fileUri || !item.fileName) {
      throw new Error('Missing file information');
    }

    const { perkaraId, kategori, phase, isRequired, isOptional } = item.payload;

    const result = await apiService.uploadDokumen(
      item.fileUri,
      item.fileName,
      item.fileType || 'application/octet-stream',
      perkaraId,
      kategori,
      phase,
      isRequired,
      isOptional
    );

    // Update local storage with synced document
    await storageService.updateDocumentSyncStatus(result.document.id, 'synced');
  }

  /**
   * Upload case from queue
   */
  private async uploadCase(item: UploadQueueItem): Promise<void> {
    const result = await apiService.createPerkara(item.payload);
    
    // Update local storage with server ID
    await storageService.updateCaseWithServerId(item.id, result.id);
  }

  /**
   * Upload task from queue
   */
  private async uploadTask(item: UploadQueueItem): Promise<void> {
    if (item.action === 'create') {
      await apiService.createTugas(item.payload);
    } else if (item.action === 'update') {
      await apiService.updateTugas(item.payload.id, item.payload);
    }
  }

  /**
   * Upload note from queue
   */
  private async uploadNote(item: UploadQueueItem): Promise<void> {
    await apiService.createCatatan(item.payload);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      return true;
    }

    // Server errors (5xx)
    if (error.response?.status >= 500) {
      return true;
    }

    // Rate limiting
    if (error.response?.status === 429) {
      return true;
    }

    // Timeout
    if (error.message?.includes('timeout')) {
      return true;
    }

    return false;
  }

  // ========================================
  // STORAGE OPERATIONS
  // ========================================

  /**
   * Load upload queue from storage
   */
  private async loadUploadQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_QUEUE);
      if (queueData) {
        this.uploadQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load upload queue:', error);
    }
  }

  /**
   * Save upload queue to storage
   */
  private async saveUploadQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.UPLOAD_QUEUE,
        JSON.stringify(this.uploadQueue)
      );
    } catch (error) {
      console.error('Failed to save upload queue:', error);
    }
  }

  /**
   * Update last sync time
   */
  private async updateLastSyncTime(): Promise<void> {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
    } catch (error) {
      console.error('Failed to update last sync time:', error);
    }
  }

  // ========================================
  // STATUS & MONITORING
  // ========================================

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const lastSyncData = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const lastSyncTime = lastSyncData ? parseInt(lastSyncData, 10) : null;

    const pendingUploads = this.uploadQueue.filter(
      item => item.status === 'pending' || item.status === 'uploading'
    ).length;

    const failedUploads = this.uploadQueue.filter(
      item => item.status === 'failed' && item.retryCount >= item.maxRetries
    ).length;

    return {
      isOnline: networkService.getStatus(),
      isSyncing: this.syncInProgress,
      lastSyncTime,
      pendingUploads,
      failedUploads,
      lastError: this.uploadQueue.find(i => i.error)?.error,
    };
  }

  /**
   * Clear failed uploads
   */
  async clearFailedUploads(): Promise<void> {
    this.uploadQueue = this.uploadQueue.filter(
      item => !(item.status === 'failed' && item.retryCount >= item.maxRetries)
    );
    await this.saveUploadQueue();
  }

  /**
   * Retry failed uploads
   */
  async retryFailedUploads(): Promise<void> {
    // Reset retry count for failed items
    this.uploadQueue.forEach(item => {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.retryCount = 0;
      }
    });

    await this.saveUploadQueue();
    await this.processUploadQueue();
  }

  /**
   * Force sync (ignores sync in progress flag)
   */
  async forceSync(): Promise<void> {
    this.syncInProgress = false;
    await this.syncAll();
  }

  /**
   * Clear all data and resync
   */
  async resetAndSync(): Promise<void> {
    console.log('🔄 Resetting and resyncing all data...');
    
    // Clear all cached data
    await storageService.clearCache();
    
    // Clear upload queue
    this.uploadQueue = [];
    await this.saveUploadQueue();
    
    // Force sync
    await this.forceSync();
  }
}

export default new SyncService();
