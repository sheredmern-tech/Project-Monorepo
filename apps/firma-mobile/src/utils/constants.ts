// API Configuration
// Backend uses 'api/v1' prefix (check apps/server/src/main.ts line 45)
export const API_URL = __DEV__
  ? 'http://192.168.1.2:3000/api/v1' // ← FIXED: api/v1 not api!
  : 'https://api.firma.com/api/v1';

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

// Document Types by Phase
export const PHASE_DOCUMENTS = {
  1: {
    required: [
      'KTP Pemohon',
      'KK (Kartu Keluarga)',
      'Surat Kuasa',
    ],
    optional: [
      'Akta Kelahiran',
      'Akta Nikah',
      'NPWP',
    ],
  },
  2: {
    required: [
      'Bukti Kepemilikan',
      'Surat Perjanjian',
    ],
    optional: [
      'Dokumen Pendukung',
      'Surat Keterangan',
    ],
  },
  3: {
    required: [],
    optional: [
      'Bukti Pembayaran',
      'Dokumentasi Meeting',
    ],
  },
};

// Case Status
export const CASE_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
} as const;

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Document Review Status
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Sync Configuration
export const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 30000, // 30 seconds
  RETRY_DELAY: 5000, // 5 seconds
  MAX_RETRIES: 3,
  BATCH_SIZE: 5,
  EXPONENTIAL_BACKOFF_BASE: 2,
};

// Storage Keys
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@firma_auth_token',
  USER_DATA: '@firma_user_data',
  
  // Cache
  DOCUMENTS_CACHE: '@firma_documents_cache',
  CASES_CACHE: '@firma_cases_cache',
  TASKS_CACHE: '@firma_tasks_cache',
  CLIENTS_CACHE: '@firma_clients_cache',
  
  // Sync
  UPLOAD_QUEUE: '@firma_upload_queue',
  LAST_SYNC: '@firma_last_sync',
  SYNC_STATUS: '@firma_sync_status',
  
  // Offline
  OFFLINE_DATA: '@firma_offline_data',
  PENDING_CHANGES: '@firma_pending_changes',
  
  // Settings
  APP_SETTINGS: '@firma_app_settings',
  NOTIFICATION_SETTINGS: '@firma_notification_settings',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Perkara (Cases)
  PERKARA: '/perkara',
  PERKARA_DETAIL: (id: string) => `/perkara/${id}`,
  PERKARA_STATS: (id: string) => `/perkara/${id}/statistics`,
  
  // Dokumen (Documents)
  DOKUMEN: '/dokumen',
  DOKUMEN_UPLOAD: '/dokumen',
  DOKUMEN_DETAIL: (id: string) => `/dokumen/${id}`,
  DOKUMEN_DOWNLOAD: (id: string) => `/dokumen/${id}/download`,
  
  // Klien (Clients)
  KLIEN: '/klien',
  KLIEN_DETAIL: (id: string) => `/klien/${id}`,
  
  // Tugas (Tasks)
  TUGAS: '/tugas',
  TUGAS_DETAIL: (id: string) => `/tugas/${id}`,
  
  // Sidang (Court Sessions)
  SIDANG: '/sidang',
  SIDANG_DETAIL: (id: string) => `/sidang/${id}`,
  
  // Catatan (Notes)
  CATATAN: '/catatan',
  CATATAN_DETAIL: (id: string) => `/catatan/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/statistics',
  
  // Logs
  LOG_AKTIVITAS: '/log-aktivitas',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No internet connection. Please check your network.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  UPLOAD_ERROR: 'Failed to upload document. Please try again.',
  SYNC_ERROR: 'Failed to sync data. Will retry automatically.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'Data not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  UPLOAD_SUCCESS: 'Document uploaded successfully!',
  SYNC_SUCCESS: 'Data synced successfully!',
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  CASE_CREATED: 'Case created successfully!',
  TASK_COMPLETED: 'Task marked as completed!',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+62|62|0)[0-9]{9,12}$/,
  PASSWORD_MIN_LENGTH: 8,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  LIST_PAGE_SIZE: 20,
  MAX_RETRY_ATTEMPTS: 3,
  PULL_TO_REFRESH_DISTANCE: 100,
};

// Colors (matching your design)
export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  dark: '#1f2937',
  light: '#f3f4f6',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Phase Configuration
export const PHASE_CONFIG = {
  0: {
    name: 'Intake',
    description: 'Initial case registration',
    color: COLORS.gray[500],
    icon: 'clipboard-list',
  },
  1: {
    name: 'Document Collection',
    description: 'Collecting required documents',
    color: COLORS.primary,
    icon: 'folder-open',
  },
  2: {
    name: 'Additional Documents',
    description: 'Additional documentation if needed',
    color: COLORS.warning,
    icon: 'document-add',
  },
  3: {
    name: 'Processing',
    description: 'Case is being processed',
    color: COLORS.secondary,
    icon: 'briefcase',
  },
};

// Date Format
export const DATE_FORMAT = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY, HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};
