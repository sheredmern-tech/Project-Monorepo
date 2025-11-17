import { Alert } from 'react-native';
import apiService from './api.service';
import storageService from './storage.service';
import networkService from './network.service';
import { SYNC_CONFIG } from '../utils/constants';
import type { UploadQueueItem, Document } from '../types';

class SyncService {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  // Start auto-sync
  startAutoSync() {
    if (this.syncInterval) return;

    console.log('🔄 Auto-sync started');
    this.syncInterval = setInterval(() => {
      if (networkService.getStatus()) {
        this.syncAll();
      }
    }, SYNC_CONFIG.AUTO_SYNC_INTERVAL);
  }

  // Stop auto-sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Auto-sync stopped');
    }
  }

  // Sync all pending uploads
  async syncAll(): Promise<void> {
    if (this.isSyncing || !networkService.getStatus()) {
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Starting sync...');

    try {
      // 1. Sync documents from server
      await this.syncDocumentsFromServer();

      // 2. Process upload queue
      await this.processUploadQueue();

      // 3. Update last sync time
      await storageService.saveLastSyncTime(Date.now());

      console.log('✅ Sync completed');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync documents from server
  private async syncDocumentsFromServer(): Promise<void> {
    try {
      const response = await apiService.getDocuments();
      const documents: Document[] = response.documents.map((doc) => ({
        ...doc,
        syncStatus: 'synced' as const,
      }));

      // Save to cache
      await storageService.saveDocuments(documents);
      console.log(`📥 Synced ${documents.length} documents from server`);
    } catch (error) {
      console.error('Failed to sync documents:', error);
      throw error;
    }
  }

  // Process upload queue
  private async processUploadQueue(): Promise<void> {
    const queue = await storageService.getUploadQueue();

    // Skip items that already reached max retries
    const pendingItems = queue.filter(
      (item) => item.status === 'pending' ||
        (item.status === 'failed' && item.retryCount < SYNC_CONFIG.MAX_RETRIES)
    );

    if (pendingItems.length === 0) {
      return;
    }

    console.log(`📤 Processing ${pendingItems.length} pending uploads`);

    for (const item of pendingItems) {
      try {
        await this.uploadQueuedItem(item);
      } catch (error) {
        console.error(`Failed to upload ${item.fileName}:`, error);
      }
    }
  }

  // Upload a single queued item
  private async uploadQueuedItem(item: UploadQueueItem): Promise<void> {
    // Check retry limit
    if (item.retryCount >= SYNC_CONFIG.MAX_RETRIES) {
      console.log(`⚠️ Max retries reached for ${item.fileName}`);
      await this.updateQueueItemStatus(item.id, 'failed', 'Max retries reached');
      return;
    }

    // Update status to uploading
    await this.updateQueueItemStatus(item.id, 'uploading');

    try {
      // Attempt upload
      await apiService.uploadDocument(
        item.fileUri,
        item.fileName,
        item.fileType,
        item.category
      );

      // Success - remove from queue
      await this.removeFromQueue(item.id);
      console.log(`✅ Uploaded ${item.fileName}`);
    } catch (error: any) {
      // Failed - increment retry count
      const newRetryCount = item.retryCount + 1;
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';

      await this.updateQueueItemStatus(
        item.id,
        'failed',
        errorMessage,
        newRetryCount
      );

      console.error(`❌ Upload failed for ${item.fileName} (retry ${newRetryCount})`);
      console.error(`   Error: ${errorMessage}`);
      console.error(`   Status: ${error?.response?.status}`);
      console.error(`   Full error:`, error?.response?.data || error);
    }
  }

  // Add item to upload queue
  async addToQueue(
    fileUri: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    category: string
  ): Promise<string> {
    const queue = await storageService.getUploadQueue();

    const queueItem: UploadQueueItem = {
      id: `upload_${Date.now()}_${Math.random()}`,
      fileUri,
      fileName,
      fileSize,
      fileType,
      category,
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    queue.push(queueItem);
    await storageService.saveUploadQueue(queue);

    console.log(`📝 Added to queue: ${fileName}`);

    // Trigger immediate sync if online
    if (networkService.getStatus()) {
      setTimeout(() => this.syncAll(), 1000);
    }

    return queueItem.id;
  }

  // Update queue item status
  private async updateQueueItemStatus(
    id: string,
    status: 'pending' | 'uploading' | 'failed',
    error?: string,
    retryCount?: number
  ): Promise<void> {
    const queue = await storageService.getUploadQueue();
    const index = queue.findIndex((item) => item.id === id);

    if (index !== -1) {
      queue[index].status = status;
      if (error) queue[index].error = error;
      if (retryCount !== undefined) queue[index].retryCount = retryCount;
      await storageService.saveUploadQueue(queue);
    }
  }

  // Remove item from queue
  private async removeFromQueue(id: string): Promise<void> {
    const queue = await storageService.getUploadQueue();
    const newQueue = queue.filter((item) => item.id !== id);
    await storageService.saveUploadQueue(newQueue);
  }

  // Get sync status
  async getSyncStatus(): Promise<any> {
    const queue = await storageService.getUploadQueue();
    const lastSyncTime = await storageService.getLastSyncTime();

    return {
      isOnline: networkService.getStatus(),
      isSyncing: this.isSyncing,
      lastSyncTime,
      pendingUploads: queue.filter((item) => item.status === 'pending').length,
      failedUploads: queue.filter((item) => item.status === 'failed').length,
      uploadingCount: queue.filter((item) => item.status === 'uploading').length,
    };
  }

  // Get upload queue
  async getUploadQueue(): Promise<UploadQueueItem[]> {
    return storageService.getUploadQueue();
  }

  // Clear failed uploads (for debugging/manual cleanup)
  async clearFailedUploads(): Promise<void> {
    const queue = await storageService.getUploadQueue();
    const cleanQueue = queue.filter(
      (item) => item.status !== 'failed' || item.retryCount < SYNC_CONFIG.MAX_RETRIES
    );
    await storageService.saveUploadQueue(cleanQueue);
    console.log('🧹 Cleared failed uploads from queue');
  }

  // Clear all queue (for debugging)
  async clearAllQueue(): Promise<void> {
    await storageService.saveUploadQueue([]);
    console.log('🧹 Cleared entire upload queue');
  }
}

export default new SyncService();