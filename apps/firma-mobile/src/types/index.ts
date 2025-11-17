export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'team';
  phone: string | null;
}

export interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null;
  category: string;
  uploadedAt: string | null;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  // Offline-first fields
  localUri?: string; // Local file URI
  syncStatus: 'synced' | 'pending' | 'uploading' | 'failed';
  retryCount?: number;
}

export interface UploadQueueItem {
  id: string; // local ID
  fileUri: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  status: 'pending' | 'uploading' | 'failed';
  retryCount: number;
  createdAt: number;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingUploads: number;
  failedUploads: number;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface DocumentsResponse {
  documents: Document[];
}