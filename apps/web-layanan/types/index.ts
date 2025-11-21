// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  nama_lengkap: string;
  role: 'ADMIN' | 'ADVOKAT' | 'PARALEGAL' | 'STAFF' | 'KLIEN';
  avatar_url?: string;
  no_hp?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nama_lengkap: string;
  no_hp?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ============================================================================
// DOKUMEN TYPES
// ============================================================================

export type DocumentType =
  | 'surat_kuasa'
  | 'gugatan'
  | 'putusan'
  | 'bukti'
  | 'kontrak'
  | 'surat_menyurat'
  | 'lainnya';

export interface Dokumen {
  id: string;
  nama_dokumen: string;
  tipe_dokumen: DocumentType;
  deskripsi?: string;
  kategori?: string;
  tags?: string[];
  file_url: string;
  google_drive_file_id: string;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface BulkFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedData?: Dokumen;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  total_dokumen: number;
  dokumen_bulan_ini: number;
  dokumen_minggu_ini: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}