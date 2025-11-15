// ============================================
// FILE: app/home/_constants/team-data.ts
// ============================================

export const teamData = [
  {
    name: 'Dr. Ahmad Santoso, S.H., M.H.',
    role: 'Managing Partner',
    specialization: ['Hukum Pidana', 'Hukum Bisnis', 'Litigasi'],
    initials: 'AS',
    gradient: 'from-blue-500 to-blue-600',
    experience: '20+ tahun',
    description: 'Spesialis hukum pidana dengan track record menangani kasus-kasus high profile',
    education: [
      'S3 Ilmu Hukum - Universitas Indonesia',
      'S2 Hukum Bisnis - Universitas Gadjah Mada',
      'S1 Ilmu Hukum - Universitas Indonesia',
    ],
    achievements: [
      'Best Criminal Lawyer 2023',
      'Advokat Terbaik Pilihan Klien 2022',
      '500+ Kasus Berhasil Ditangani',
    ],
    category: 'partner',
    email: 'ahmad.santoso@firmaperairi.com',
    phone: '+62 812 3456 7890',
  },
  {
    name: 'Maria Wijaya, S.H., M.H.',
    role: 'Senior Partner',
    specialization: ['Hukum Perdata', 'Hukum Keluarga', 'Mediasi'],
    initials: 'MW',
    gradient: 'from-purple-500 to-purple-600',
    experience: '18+ tahun',
    description: 'Ahli dalam penyelesaian sengketa perdata dan hukum keluarga',
    education: [
      'S2 Hukum Keluarga - Universitas Padjajaran',
      'S1 Ilmu Hukum - Universitas Indonesia',
      'Certified Mediator - PERADI',
    ],
    achievements: [
      'Top Family Lawyer 2024',
      'Mediator Bersertifikat Nasional',
      '300+ Mediasi Sukses',
    ],
    category: 'partner',
    email: 'maria.wijaya@firmaperairi.com',
    phone: '+62 812 3456 7891',
  },
  {
    name: 'Budi Hartono, S.H.',
    role: 'Associate Partner',
    specialization: ['Hukum Ketenagakerjaan', 'Hukum Kontrak'],
    initials: 'BH',
    gradient: 'from-green-500 to-green-600',
    experience: '15+ tahun',
    description: 'Expert dalam hubungan industrial dan perselisihan ketenagakerjaan',
    education: [
      'S2 Hukum Ketenagakerjaan - Universitas Trisakti',
      'S1 Ilmu Hukum - Universitas Airlangga',
    ],
    achievements: [
      'Labor Law Expert 2023',
      '200+ Kasus Ketenagakerjaan',
      'Corporate Legal Advisor',
    ],
    category: 'associate',
    email: 'budi.hartono@firmaperairi.com',
    phone: '+62 812 3456 7892',
  },
  {
    name: 'Siti Nurhaliza, S.H., M.H.',
    role: 'Senior Associate',
    specialization: ['Hukum Bisnis', 'Hukum Korporasi', 'M&A'],
    initials: 'SN',
    gradient: 'from-pink-500 to-pink-600',
    experience: '12+ tahun',
    description: 'Spesialis dalam transaksi bisnis dan corporate law',
    education: [
      'S2 Hukum Bisnis - Universitas Indonesia',
      'S1 Ilmu Hukum - Universitas Gadjah Mada',
      'Corporate Law Certificate - Harvard Extension',
    ],
    achievements: [
      'M&A Deal Advisor 2024',
      '50+ Transaksi Bisnis',
      'Corporate Compliance Expert',
    ],
    category: 'associate',
    email: 'siti.nurhaliza@firmaperairi.com',
    phone: '+62 812 3456 7893',
  },
  {
    name: 'Rudi Setiawan, S.H.',
    role: 'Associate',
    specialization: ['Hukum Properti', 'Hukum Kontrak'],
    initials: 'RS',
    gradient: 'from-orange-500 to-orange-600',
    experience: '8+ tahun',
    description: 'Fokus pada transaksi properti dan real estate',
    education: [
      'S1 Ilmu Hukum - Universitas Padjajaran',
      'Property Law Specialist - APPI',
    ],
    achievements: [
      'Property Law Specialist',
      '100+ Transaksi Properti',
      'Real Estate Legal Advisor',
    ],
    category: 'associate',
    email: 'rudi.setiawan@firmaperairi.com',
    phone: '+62 812 3456 7894',
  },
  {
    name: 'Dewi Kusuma, S.H.',
    role: 'Junior Associate',
    specialization: ['Hukum Perdata', 'Legal Research'],
    initials: 'DK',
    gradient: 'from-teal-500 to-teal-600',
    experience: '5+ tahun',
    description: 'Spesialis penelitian hukum dan drafting legal documents',
    education: [
      'S1 Ilmu Hukum - Universitas Indonesia',
      'Legal Research Training - PERADI',
    ],
    achievements: [
      'Best Legal Researcher 2024',
      'Document Drafting Expert',
      '200+ Legal Documents',
    ],
    category: 'junior',
    email: 'dewi.kusuma@firmaperairi.com',
    phone: '+62 812 3456 7895',
  }
]

export const teamCategories = [
  { value: 'all', label: 'Semua Tim', count: teamData.length },
  { value: 'partner', label: 'Partners', count: teamData.filter(t => t.category === 'partner').length },
  { value: 'associate', label: 'Associates', count: teamData.filter(t => t.category === 'associate').length },
  { value: 'junior', label: 'Junior Associates', count: teamData.filter(t => t.category === 'junior').length },
]