// API Configuration
export const API_URL = __DEV__
  ? 'http://192.168.1.2:3000' // ← GANTI dengan IP laptop lo!
  : 'https://api.firma.com';

// Document Categories
export const DOCUMENT_CATEGORIES = [
  'KTP',
  'KK (Kartu Keluarga)',
  'Akta Kelahiran',
  'Akta Nikah',
  'Surat Kuasa',
  'Surat Perjanjian',
  'Bukti Pembayaran',
  'Lainnya',
] as const;

// Sync Configuration
export const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 30000, // 30 seconds
  RETRY_DELAY: 5000, // 5 seconds
  MAX_RETRIES: 3,
  BATCH_SIZE: 5,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@firma_auth_token',
  USER_DATA: '@firma_user_data',
  DOCUMENTS_CACHE: '@firma_documents_cache',
  UPLOAD_QUEUE: '@firma_upload_queue',
  LAST_SYNC: '@firma_last_sync',
};