// ===================================================================
// REFACTORED: 1 USER = 1 ACTIVE CASE + HISTORY
// ===================================================================

export interface CaseDocument {
  id: string;
  document_type: string;
  is_required: boolean;
  is_optional: boolean;
  file_name: string | null;
  file_url: string | null;
  uploaded_at: string | null;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
}

export interface TimelineEvent {
  id: string;
  phase: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  skipped?: boolean;
}

export interface MyCase {
  id: string;
  case_number: string;
  service_name: string;
  service_category: string;
  service_icon: string;
  current_phase: 0 | 1 | 2 | 3;
  status: 'active' | 'completed' | 'cancelled';
  phase_2_skipped: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  deadline: string | null;
  meeting_date: string | null;
  meeting_location: string | null;
  phase_1_docs: CaseDocument[];
  phase_2_docs: CaseDocument[];
  timeline: TimelineEvent[];
}

// ===================================================================
// USER'S CURRENT ACTIVE CASE (ONLY 1!)
// ===================================================================

export const MY_ACTIVE_CASE: MyCase = {
  id: 'case-active-001',
  case_number: 'CS-20250115-001',
  service_name: 'Sertifikat Tanah',
  service_category: 'Pertanahan',
  service_icon: '🏡',
  current_phase: 2,
  status: 'active',
  phase_2_skipped: false,
  created_at: '2025-01-10T08:00:00Z',
  updated_at: '2025-01-15T14:30:00Z',
  completed_at: null,
  deadline: '2025-01-20T23:59:59Z',
  meeting_date: null,
  meeting_location: null,

  // Phase 1 Documents (Approved)
  phase_1_docs: [
    {
      id: 'doc-p1-001',
      document_type: 'KTP',
      is_required: true,
      is_optional: false,
      file_name: 'ktp.jpg',
      file_url: 'https://storage.firma.com/ktp.jpg',
      uploaded_at: '2025-01-10T09:00:00Z',
      review_status: 'approved',
      review_notes: 'Dokumen valid',
    },
    {
      id: 'doc-p1-002',
      document_type: 'Kartu Keluarga',
      is_required: true,
      is_optional: false,
      file_name: 'kk.jpg',
      file_url: 'https://storage.firma.com/kk.jpg',
      uploaded_at: '2025-01-10T09:05:00Z',
      review_status: 'approved',
      review_notes: null,
    },
    {
      id: 'doc-p1-003',
      document_type: 'Girik/Surat Tanah',
      is_required: true,
      is_optional: false,
      file_name: 'girik_tanah.pdf',
      file_url: 'https://storage.firma.com/girik.pdf',
      uploaded_at: '2025-01-10T09:10:00Z',
      review_status: 'approved',
      review_notes: 'Surat tanah valid',
    },
  ],

  // Phase 2 Documents (REQUIRED - belum upload)
  phase_2_docs: [
    {
      id: 'doc-p2-001',
      document_type: 'Surat Ukur Tanah',
      is_required: true,
      is_optional: false,
      file_name: null,
      file_url: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
    {
      id: 'doc-p2-002',
      document_type: 'PBB (Pajak Bumi & Bangunan) 5 Tahun Terakhir',
      is_required: true,
      is_optional: false,
      file_name: null,
      file_url: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
    {
      id: 'doc-p2-003',
      document_type: 'Surat Pernyataan Tidak Sengketa',
      is_required: false,
      is_optional: true,
      file_name: null,
      file_url: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
  ],

  timeline: [
    {
      id: 'tl-001',
      phase: 0,
      title: 'Pengajuan Dibuat',
      description: 'Anda membuat pengajuan Sertifikat Tanah',
      date: '2025-01-10T08:00:00Z',
      completed: true,
    },
    {
      id: 'tl-002',
      phase: 1,
      title: 'Upload Dokumen Awal',
      description: 'Dokumen awal berhasil diupload',
      date: '2025-01-10T09:15:00Z',
      completed: true,
    },
    {
      id: 'tl-003',
      phase: 1,
      title: 'Dokumen Disetujui',
      description: 'Tim telah menyetujui dokumen awal Anda',
      date: '2025-01-12T14:00:00Z',
      completed: true,
    },
    {
      id: 'tl-004',
      phase: 2,
      title: 'Perlu Dokumen Tambahan',
      description: 'Tim meminta dokumen tambahan untuk melanjutkan proses',
      date: '2025-01-12T15:00:00Z',
      completed: false,
    },
  ],
};

// ===================================================================
// USER'S CASE HISTORY (Completed/Cancelled)
// ===================================================================

export const MY_CASE_HISTORY: MyCase[] = [
  {
    id: 'case-history-001',
    case_number: 'CS-20241220-089',
    service_name: 'Konsultasi Hukum',
    service_category: 'Konsultasi',
    service_icon: '⚖️',
    current_phase: 3,
    status: 'completed',
    phase_2_skipped: true,
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2024-12-28T16:00:00Z',
    completed_at: '2024-12-28T16:00:00Z',
    deadline: null,
    meeting_date: '2024-12-27T10:00:00Z',
    meeting_location: 'Kantor Firma Hukum',
    phase_1_docs: [
      {
        id: 'doc-h1-001',
        document_type: 'Surat Masalah',
        is_required: true,
        is_optional: false,
        file_name: 'surat_masalah.pdf',
        file_url: 'https://storage.firma.com/surat.pdf',
        uploaded_at: '2024-12-20T11:00:00Z',
        review_status: 'approved',
        review_notes: 'Lengkap',
      },
    ],
    phase_2_docs: [],
    timeline: [
      {
        id: 'tl-h1-001',
        phase: 0,
        title: 'Pengajuan Dibuat',
        description: 'Konsultasi Hukum',
        date: '2024-12-20T10:00:00Z',
        completed: true,
      },
      {
        id: 'tl-h1-002',
        phase: 1,
        title: 'Dokumen Disetujui',
        description: 'Semua dokumen lengkap',
        date: '2024-12-21T14:00:00Z',
        completed: true,
      },
      {
        id: 'tl-h1-003',
        phase: 2,
        title: 'Phase 2 Skipped',
        description: 'Tidak ada dokumen tambahan yang diperlukan',
        date: '2024-12-21T14:00:00Z',
        completed: true,
        skipped: true,
      },
      {
        id: 'tl-h1-004',
        phase: 3,
        title: 'Meeting Selesai',
        description: 'Konsultasi telah dilakukan',
        date: '2024-12-27T10:00:00Z',
        completed: true,
      },
      {
        id: 'tl-h1-005',
        phase: 3,
        title: 'Case Selesai',
        description: 'Pengajuan selesai',
        date: '2024-12-28T16:00:00Z',
        completed: true,
      },
    ],
  },
];

// ===================================================================
// NOTIFICATIONS (ONLY FOR ACTIVE CASE + RECENT HISTORY)
// ===================================================================

export interface Notification {
  id: string;
  case_number: string;
  type: 'info' | 'warning' | 'success' | 'action_required';
  title: string;
  message: string;
  date: string;
  read: boolean;
  action_url?: string; // Deep link to relevant screen
  priority?: 'high' | 'medium' | 'low'; // Priority level
}

export const MY_NOTIFICATIONS: Notification[] = [
  // ACTIVE CASE - ACTION REQUIRED (Highest Priority)
  {
    id: 'notif-001',
    case_number: 'CS-20250115-001',
    type: 'action_required',
    title: '🚨 Dokumen Tambahan Diperlukan',
    message: 'Tim meminta dokumen tambahan untuk melanjutkan proses Sertifikat Tanah. Upload sebelum 20 Jan 2025 (5 hari lagi).',
    date: '2025-01-12T15:00:00Z',
    read: false,
    action_url: 'Phase2Upload',
    priority: 'high',
  },

  // ACTIVE CASE - INFO
  {
    id: 'notif-002',
    case_number: 'CS-20250115-001',
    type: 'success',
    title: '✅ Dokumen Phase 1 Disetujui',
    message: 'Semua dokumen awal Anda telah disetujui oleh tim. Pengajuan dilanjutkan ke tahap berikutnya.',
    date: '2025-01-12T14:00:00Z',
    read: false,
    priority: 'medium',
  },

  {
    id: 'notif-003',
    case_number: 'CS-20250115-001',
    type: 'info',
    title: 'ℹ️ Dokumen Sedang Direview',
    message: 'Tim sedang mereview dokumen yang Anda upload. Estimasi 1-2 hari kerja.',
    date: '2025-01-10T10:00:00Z',
    read: true,
    priority: 'low',
  },

  // HISTORY - COMPLETED CASE (Read)
  {
    id: 'notif-004',
    case_number: 'CS-20241220-089',
    type: 'success',
    title: '🎉 Pengajuan Selesai',
    message: 'Pengajuan Konsultasi Hukum telah selesai. Terima kasih telah menggunakan layanan kami!',
    date: '2024-12-28T16:00:00Z',
    read: true,
    priority: 'medium',
  },

  {
    id: 'notif-005',
    case_number: 'CS-20241220-089',
    type: 'success',
    title: '✅ Meeting Selesai',
    message: 'Meeting konsultasi telah dilakukan. Hasil konsultasi telah dikirim via email.',
    date: '2024-12-27T11:00:00Z',
    read: true,
    priority: 'low',
  },
];

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

export const hasActiveCase = (): boolean => {
  return MY_ACTIVE_CASE.status === 'active';
};

export const canCreateNewCase = (): boolean => {
  return !hasActiveCase();
};

export const getUnreadNotificationsCount = (): number => {
  return MY_NOTIFICATIONS.filter((n) => !n.read).length;
};

export const getActiveCaseProgress = (): number => {
  return (MY_ACTIVE_CASE.current_phase / 3) * 100;
};

export const getDaysUntilDeadline = (): number | null => {
  if (!MY_ACTIVE_CASE.deadline) return null;
  const days = Math.ceil(
    (new Date(MY_ACTIVE_CASE.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return days;
};