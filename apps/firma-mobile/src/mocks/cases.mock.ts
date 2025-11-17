// Mock data untuk Cases dengan Phase 2 scenarios
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

export interface TimelineEvent {
  id: string;
  phase: number;
  event: string;
  description: string;
  created_at: string;
  skipped?: boolean;
}

// ✅ SCENARIO 1: Case yang SKIP Phase 2 (Dokumen langsung lengkap)
export const CASE_SKIP_PHASE2: Case = {
  id: 'case-001',
  case_number: 'CS-20250115-001',
  client: {
    id: 'client-001',
    name: 'Pak Budi Santoso',
    phone: '+6281234567890',
    email: 'budi@test.com',
  },
  service: {
    id: 'service-001',
    name: 'Sertifikat Tanah',
    category: 'Pertanahan',
  },
  assigned_to: {
    id: 'lawyer-001',
    name: 'Pak Andi (Lawyer)',
    email: 'andi@firma.com',
  },
  current_phase: 3,
  status: 'phase_3',
  phase_2_skipped: true,
  skip_reason: 'All documents complete in Phase 1',
  meeting_date: '2025-01-20T10:00:00Z',
  meeting_location: 'Kantor Firma Hukum, Jl. Merdeka No. 123',
  created_at: '2025-01-15T08:00:00Z',
  updated_at: '2025-01-16T14:30:00Z',
  documents: [
    // Phase 1 docs (semua approved)
    {
      id: 'doc-001',
      case_id: 'case-001',
      phase: 1,
      document_type: 'KTP Pemohon',
      is_required: true,
      is_optional: false,
      file_name: 'ktp_budi.jpg',
      file_url: 'https://storage.firma.com/ktp_budi.jpg',
      file_size: 245000,
      uploaded_at: '2025-01-15T09:30:00Z',
      review_status: 'approved',
      review_notes: 'Dokumen valid dan jelas',
    },
    {
      id: 'doc-002',
      case_id: 'case-001',
      phase: 1,
      document_type: 'Kartu Keluarga',
      is_required: true,
      is_optional: false,
      file_name: 'kk_budi.jpg',
      file_url: 'https://storage.firma.com/kk_budi.jpg',
      file_size: 312000,
      uploaded_at: '2025-01-15T09:35:00Z',
      review_status: 'approved',
      review_notes: null,
    },
    {
      id: 'doc-003',
      case_id: 'case-001',
      phase: 1,
      document_type: 'Girik/Surat Tanah',
      is_required: true,
      is_optional: false,
      file_name: 'girik_tanah.pdf',
      file_url: 'https://storage.firma.com/girik_tanah.pdf',
      file_size: 1240000,
      uploaded_at: '2025-01-15T09:40:00Z',
      review_status: 'approved',
      review_notes: 'Dokumen asli tersedia',
    },
    {
      id: 'doc-004',
      case_id: 'case-001',
      phase: 1,
      document_type: 'Foto Lokasi',
      is_required: true,
      is_optional: false,
      file_name: 'foto_lokasi_1.jpg',
      file_url: 'https://storage.firma.com/foto_lokasi_1.jpg',
      file_size: 890000,
      uploaded_at: '2025-01-15T10:00:00Z',
      review_status: 'approved',
      review_notes: '4 foto dari berbagai sudut',
    },
  ],
  timeline: [
    {
      id: 'timeline-001',
      phase: 0,
      event: 'Case Created',
      description: 'Case dibuat oleh Pak Budi',
      created_at: '2025-01-15T08:00:00Z',
    },
    {
      id: 'timeline-002',
      phase: 1,
      event: 'Documents Uploaded',
      description: 'Semua dokumen Phase 1 berhasil diupload',
      created_at: '2025-01-15T10:05:00Z',
    },
    {
      id: 'timeline-003',
      phase: 1,
      event: 'Documents Approved',
      description: 'Semua dokumen Phase 1 disetujui oleh Tim',
      created_at: '2025-01-16T14:00:00Z',
    },
    {
      id: 'timeline-004',
      phase: 2,
      event: 'Phase 2 Skipped',
      description: 'Dokumen sudah lengkap, Phase 2 dilewati',
      created_at: '2025-01-16T14:30:00Z',
      skipped: true,
    },
    {
      id: 'timeline-005',
      phase: 3,
      event: 'Meeting Scheduled',
      description: 'Jadwal konsultasi: Senin, 20 Jan 2025 - 10.00 WIB',
      created_at: '2025-01-16T14:30:00Z',
    },
  ],
};

// ✅ SCENARIO 2: Case dengan Phase 2 ACTIVE (Ada required & optional docs)
export const CASE_WITH_PHASE2: Case = {
  id: 'case-002',
  case_number: 'CS-20250115-002',
  client: {
    id: 'client-002',
    name: 'Ibu Sari Wulandari',
    phone: '+6281234567891',
    email: 'sari@test.com',
  },
  service: {
    id: 'service-002',
    name: 'Pendirian PT',
    category: 'Badan Usaha',
  },
  assigned_to: {
    id: 'lawyer-002',
    name: 'Pak Doni (Lawyer)',
    email: 'doni@firma.com',
  },
  current_phase: 2,
  status: 'phase_2',
  phase_2_skipped: false,
  skip_reason: null,
  meeting_date: null,
  meeting_location: null,
  created_at: '2025-01-15T09:00:00Z',
  updated_at: '2025-01-16T10:00:00Z',
  documents: [
    // Phase 1 docs (approved)
    {
      id: 'doc-101',
      case_id: 'case-002',
      phase: 1,
      document_type: 'KTP Direktur',
      is_required: true,
      is_optional: false,
      file_name: 'ktp_direktur.jpg',
      file_url: 'https://storage.firma.com/ktp_direktur.jpg',
      file_size: 256000,
      uploaded_at: '2025-01-15T10:00:00Z',
      review_status: 'approved',
      review_notes: null,
    },
    {
      id: 'doc-102',
      case_id: 'case-002',
      phase: 1,
      document_type: 'KTP Komisaris',
      is_required: true,
      is_optional: false,
      file_name: 'ktp_komisaris.jpg',
      file_url: 'https://storage.firma.com/ktp_komisaris.jpg',
      file_size: 248000,
      uploaded_at: '2025-01-15T10:05:00Z',
      review_status: 'approved',
      review_notes: null,
    },
    {
      id: 'doc-103',
      case_id: 'case-002',
      phase: 1,
      document_type: 'NPWP',
      is_required: true,
      is_optional: false,
      file_name: 'npwp.jpg',
      file_url: 'https://storage.firma.com/npwp.jpg',
      file_size: 189000,
      uploaded_at: '2025-01-15T10:10:00Z',
      review_status: 'approved',
      review_notes: null,
    },
    // Phase 2 docs (MANDATORY - belum upload)
    {
      id: 'doc-201',
      case_id: 'case-002',
      phase: 2,
      document_type: 'Akta Pendirian (Notaris)',
      is_required: true,
      is_optional: false,
      file_name: null,
      file_url: null,
      file_size: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
    {
      id: 'doc-202',
      case_id: 'case-002',
      phase: 2,
      document_type: 'Susunan Pemegang Saham',
      is_required: true,
      is_optional: false,
      file_name: null,
      file_url: null,
      file_size: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
    // Phase 2 docs (OPTIONAL)
    {
      id: 'doc-203',
      case_id: 'case-002',
      phase: 2,
      document_type: 'Surat Domisili Perusahaan',
      is_required: false,
      is_optional: true,
      file_name: null,
      file_url: null,
      file_size: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
  ],
  timeline: [
    {
      id: 'timeline-101',
      phase: 0,
      event: 'Case Created',
      description: 'Case dibuat oleh Ibu Sari',
      created_at: '2025-01-15T09:00:00Z',
    },
    {
      id: 'timeline-102',
      phase: 1,
      event: 'Documents Uploaded',
      description: 'Dokumen Phase 1 berhasil diupload',
      created_at: '2025-01-15T10:15:00Z',
    },
    {
      id: 'timeline-103',
      phase: 1,
      event: 'Documents Approved',
      description: 'Dokumen Phase 1 disetujui',
      created_at: '2025-01-16T09:00:00Z',
    },
    {
      id: 'timeline-104',
      phase: 2,
      event: 'Phase 2 Documents Requested',
      description: 'Tim meminta dokumen tambahan',
      created_at: '2025-01-16T10:00:00Z',
    },
  ],
};

// ✅ SCENARIO 3: Case Phase 2 dengan beberapa docs sudah diupload
export const CASE_PHASE2_PARTIAL: Case = {
  id: 'case-003',
  case_number: 'CS-20250115-003',
  client: {
    id: 'client-003',
    name: 'Pak Joko Widodo',
    phone: '+6281234567892',
    email: 'joko@test.com',
  },
  service: {
    id: 'service-003',
    name: 'Perizinan Usaha',
    category: 'Perizinan',
  },
  assigned_to: {
    id: 'lawyer-001',
    name: 'Pak Andi (Lawyer)',
    email: 'andi@firma.com',
  },
  current_phase: 2,
  status: 'phase_2',
  phase_2_skipped: false,
  skip_reason: null,
  meeting_date: null,
  meeting_location: null,
  created_at: '2025-01-14T08:00:00Z',
  updated_at: '2025-01-16T15:00:00Z',
  documents: [
    // Phase 1 (approved)
    {
      id: 'doc-301',
      case_id: 'case-003',
      phase: 1,
      document_type: 'KTP Pemilik',
      is_required: true,
      is_optional: false,
      file_name: 'ktp_joko.jpg',
      file_url: 'https://storage.firma.com/ktp_joko.jpg',
      file_size: 234000,
      uploaded_at: '2025-01-14T09:00:00Z',
      review_status: 'approved',
      review_notes: null,
    },
    // Phase 2 - REQUIRED (1 uploaded, 1 pending)
    {
      id: 'doc-401',
      case_id: 'case-003',
      phase: 2,
      document_type: 'Surat Izin Tempat Usaha',
      is_required: true,
      is_optional: false,
      file_name: 'izin_tempat_usaha.pdf',
      file_url: 'https://storage.firma.com/izin_tempat_usaha.pdf',
      file_size: 450000,
      uploaded_at: '2025-01-16T14:00:00Z',
      review_status: 'pending',
      review_notes: null,
    },
    {
      id: 'doc-402',
      case_id: 'case-003',
      phase: 2,
      document_type: 'NIB (Nomor Induk Berusaha)',
      is_required: true,
      is_optional: false,
      file_name: null,
      file_url: null,
      file_size: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
    // Phase 2 - OPTIONAL (not uploaded)
    {
      id: 'doc-403',
      case_id: 'case-003',
      phase: 2,
      document_type: 'Sertifikat Halal (OPTIONAL)',
      is_required: false,
      is_optional: true,
      file_name: null,
      file_url: null,
      file_size: null,
      uploaded_at: null,
      review_status: 'pending',
      review_notes: null,
    },
  ],
  timeline: [
    {
      id: 'timeline-301',
      phase: 0,
      event: 'Case Created',
      description: 'Case dibuat oleh Pak Joko',
      created_at: '2025-01-14T08:00:00Z',
    },
    {
      id: 'timeline-302',
      phase: 1,
      event: 'Documents Approved',
      description: 'Dokumen Phase 1 disetujui',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 'timeline-303',
      phase: 2,
      event: 'Phase 2 Documents Requested',
      description: 'Tim meminta dokumen tambahan',
      created_at: '2025-01-15T11:00:00Z',
    },
    {
      id: 'timeline-304',
      phase: 2,
      event: 'Partial Upload',
      description: 'Sebagian dokumen Phase 2 sudah diupload',
      created_at: '2025-01-16T14:00:00Z',
    },
  ],
};

// Export all mock cases
export const MOCK_CASES: Case[] = [
  CASE_SKIP_PHASE2,
  CASE_WITH_PHASE2,
  CASE_PHASE2_PARTIAL,
];

// Helper function
export const getCaseById = (caseId: string): Case | undefined => {
  return MOCK_CASES.find((c) => c.id === caseId);
};

export const getCaseByCaseNumber = (caseNumber: string): Case | undefined => {
  return MOCK_CASES.find((c) => c.case_number === caseNumber);
};