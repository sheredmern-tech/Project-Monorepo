// ========================================
// USER & AUTH TYPES
// ========================================

export type UserRole = 'admin' | 'advokat' | 'paralegal' | 'staff' | 'klien';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  alamat?: string;
  nomorIdentitas?: string;
  jenisIdentitas?: string;
  fotoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ========================================
// PERKARA (CASE) TYPES
// ========================================

export interface Perkara {
  id: string;
  nomorPerkara: string;
  judulPerkara: string;
  jenisPerkara: string;
  statusPerkara: string;
  tanggalRegistrasi: string;
  klienId: string;
  klien?: Klien;
  advokatPenanggungjawabId?: string;
  advokatPenanggungjawab?: User;
  tanggalSelesai?: string;
  currentPhase: 0 | 1 | 2 | 3;
  phase2Skipped?: boolean;
  skipReason?: string;
  nilaiSengketa?: number;
  deskripsi?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  dokumen?: DokumenHukum[];
  sidang?: JadwalSidang[];
  tugas?: Tugas[];
  timPerkara?: TimPerkara[];
  catatan_perkara?: Catatan[];
  konflik?: KonflikKepentingan[];
}

export interface PerkaraListResponse {
  data: Perkara[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PerkaraDetail extends Perkara {
  statistics?: {
    totalDokumen: number;
    totalTugas: number;
    tugasSelesai: number;
    tugasPending: number;
    totalSidang: number;
  };
  timeline?: TimelineEvent[];
}

export interface CreatePerkaraDto {
  nomorPerkara: string;
  judulPerkara: string;
  jenisPerkara: string;
  statusPerkara?: string;
  tanggalRegistrasi: string;
  klienId: string;
  advokatPenanggungjawabId?: string;
  nilaiSengketa?: number;
  deskripsi?: string;
  catatan?: string;
}

export interface UpdatePerkaraDto {
  judulPerkara?: string;
  jenisPerkara?: string;
  statusPerkara?: string;
  advokatPenanggungjawabId?: string;
  tanggalSelesai?: string;
  currentPhase?: 0 | 1 | 2 | 3;
  phase2Skipped?: boolean;
  skipReason?: string;
  nilaiSengketa?: number;
  deskripsi?: string;
  catatan?: string;
}

// ========================================
// DOKUMEN (DOCUMENT) TYPES
// ========================================

export interface DokumenHukum {
  id: string;
  perkaraId?: string;
  perkara?: Perkara;
  namaDokumen: string;
  jenisDokumen?: string;
  kategori?: string;
  nomorDokumen?: string;
  tanggalDokumen?: string;
  deskripsi?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedById: string;
  uploadedBy?: User;
  uploadedAt: string;
  
  // Phase tracking
  phase?: 0 | 1 | 2 | 3;
  isRequired?: boolean;
  isOptional?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedById?: string;
  reviewedBy?: User;
  reviewedAt?: string;
  
  // Offline sync
  localUri?: string;
  syncStatus?: 'synced' | 'pending' | 'uploading' | 'failed';
  retryCount?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface DokumenListResponse {
  data: DokumenHukum[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadDokumenResponse {
  id: string;
  message: string;
  document: DokumenHukum;
}

// ========================================
// KLIEN (CLIENT) TYPES
// ========================================

export interface Klien {
  id: string;
  nama: string;
  email?: string;
  noTelepon?: string;
  alamat?: string;
  jenisKlien: 'individual' | 'company';
  nomorIdentitas?: string;
  jenisIdentitas?: string;
  tanggalLahir?: string;
  pekerjaanId?: string;
  pekerjaan?: { id: string; nama: string; };
  pendidikanTerakhir?: string;
  statusPerkawinan?: string;
  kewarganegaraan?: string;
  namaPerusahaan?: string;
  jabatan?: string;
  npwp?: string;
  catatan?: string;
  fotoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  perkara?: Perkara[];
}

export interface KlienListResponse {
  data: Klien[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// TUGAS (TASK) TYPES
// ========================================

export interface Tugas {
  id: string;
  judul: string;
  deskripsi?: string;
  prioritas: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tanggalDeadline?: string;
  tanggalSelesai?: string;
  perkaraId?: string;
  perkara?: Perkara;
  assignedToId?: string;
  assignedTo?: User;
  assignedById?: string;
  assignedBy?: User;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// SIDANG (COURT SESSION) TYPES
// ========================================

export interface JadwalSidang {
  id: string;
  perkaraId: string;
  perkara?: Perkara;
  tanggalSidang: string;
  waktuSidang?: string;
  lokasi?: string;
  ruangSidang?: string;
  agenda?: string;
  hakim?: string;
  jaksa?: string;
  pengacara?: string;
  catatan?: string;
  hasil?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'postponed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIM PERKARA (CASE TEAM) TYPES
// ========================================

export interface TimPerkara {
  id: string;
  perkaraId: string;
  perkara?: Perkara;
  userId: string;
  user?: User;
  peran: string; // 'Lead Lawyer', 'Lawyer', 'Paralegal', etc.
  tanggalMulai: string;
  tanggalSelesai?: string;
  isActive: boolean;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// CATATAN (NOTES) TYPES
// ========================================

export interface Catatan {
  id: string;
  perkaraId: string;
  perkara?: Perkara;
  userId: string;
  user?: User;
  isi: string;
  kategori?: string;
  isImportant: boolean;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// KONFLIK KEPENTINGAN (CONFLICT OF INTEREST) TYPES
// ========================================

export interface KonflikKepentingan {
  id: string;
  perkaraId: string;
  perkara?: Perkara;
  pihakTerkait: string;
  jenisKonflik: string;
  deskripsi?: string;
  tanggalIdentifikasi: string;
  tanggalResolusi?: string;
  tindakanDiambil?: string;
  status: 'identified' | 'under_review' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TIMELINE & ACTIVITY LOG TYPES
// ========================================

export interface TimelineEvent {
  id: string;
  phase: number;
  event: string;
  description: string;
  createdAt: string;
  skipped?: boolean;
  userId?: string;
  user?: User;
  metadata?: Record<string, any>;
}

export interface LogAktivitas {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  userId: string;
  user?: User;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ========================================
// OFFLINE SYNC TYPES
// ========================================

export interface UploadQueueItem {
  id: string;
  type: 'document' | 'case' | 'task' | 'note';
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  payload: any;
  fileUri?: string;
  fileName?: string;
  fileType?: string;
  status: 'pending' | 'uploading' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastAttempt?: number;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingUploads: number;
  failedUploads: number;
  lastError?: string;
}

// ========================================
// STATISTICS & DASHBOARD TYPES
// ========================================

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalClients: number;
  totalDocuments: number;
  totalTasks: number;
  pendingTasks: number;
  upcomingSessions: number;
  recentActivities: LogAktivitas[];
  casesByStatus: {
    status: string;
    count: number;
  }[];
  casesByPhase: {
    phase: number;
    count: number;
  }[];
}

// ========================================
// PAGINATION & FILTERS
// ========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// ========================================
// API RESPONSE WRAPPER
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: any;
}

// ========================================
// LEGACY COMPATIBILITY (for existing screens)
// ========================================

// Alias for backward compatibility
export type Document = DokumenHukum;
export type DocumentsResponse = DokumenListResponse;

// Convert Case to Perkara format
export interface Case {
  id: string;
  case_number: string;
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  service: {
    id: string;
    name: string;
    category: string;
  };
  assigned_to: {
    id: string;
    name: string;
    email: string;
  } | null;
  current_phase: 0 | 1 | 2 | 3;
  status: string;
  phase_2_skipped: boolean;
  skip_reason: string | null;
  meeting_date: string | null;
  meeting_location: string | null;
  created_at: string;
  updated_at: string;
  documents: CaseDocument[];
  timeline: TimelineEvent[];
}

export interface CaseDocument {
  id: string;
  case_id: string;
  phase: 0 | 1 | 2 | 3;
  document_type: string;
  is_required: boolean;
  is_optional: boolean;
  file_name: string | null;
  file_url: string | null;
  file_size: number | null;
  uploaded_at: string | null;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
}
