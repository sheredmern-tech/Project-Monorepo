// ============================================
// FILE: app/home/_constants/services-data.ts
// ============================================

import { Heart, Briefcase, Users, ShieldCheck, Home as HomeIcon, FileText } from 'lucide-react'

export const servicesData = [
  {
    slug: 'hukum-keluarga',
    icon: Heart,
    title: 'Hukum Keluarga',
    tagline: 'Karena setiap keluarga punya cerita unik',
    description: 'Kami memahami setiap keluarga punya cerita unik. Dengan pendekatan yang empatik dan profesional, kami siap membantu menyelesaikan permasalahan keluarga Anda.',
    features: [
      'Mediasi keluarga dan penyelesaian damai',
      'Konsultasi hak asuh anak',
      'Pembuatan perjanjian pranikah',
      'Konsultasi warisan dan hibah'
    ],
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    category: 'personal',
    price: 'Mulai dari Rp 2.500.000',
  },
  {
    slug: 'konsultasi-bisnis-umkm',
    icon: Briefcase,
    title: 'Konsultasi Bisnis & UMKM',
    tagline: 'Wujudkan bisnis impian Anda dengan aman',
    description: 'Mulai atau kembangkan bisnis Anda dengan aman. Kami hadir untuk mendampingi pengusaha pemula hingga UMKM dengan solusi hukum yang mudah dipahami.',
    features: [
      'Pendirian PT, CV, dan badan usaha',
      'Pembuatan kontrak bisnis sederhana',
      'Pendaftaran merek dan hak cipta',
      'Review perjanjian kerjasama'
    ],
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    category: 'bisnis',
    price: 'Mulai dari Rp 3.000.000',
  },
  {
    slug: 'hukum-ketenagakerjaan',
    icon: Users,
    title: 'Hukum Ketenagakerjaan',
    tagline: 'Hubungan kerja yang adil untuk semua',
    description: 'Baik Anda karyawan atau pengusaha, kami bantu pastikan hubungan kerja berjalan adil dan sesuai aturan.',
    features: [
      'Konsultasi pemutusan hubungan kerja',
      'Pembuatan kontrak kerja',
      'Konsultasi hak dan kompensasi karyawan',
      'Mediasi masalah tempat kerja'
    ],
    gradient: 'from-orange-500 to-amber-600',
    bgGradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    category: 'bisnis',
    price: 'Mulai dari Rp 2.000.000',
  },
  {
    slug: 'perlindungan-konsumen',
    icon: ShieldCheck,
    title: 'Perlindungan Konsumen',
    tagline: 'Hak Anda sebagai konsumen adalah prioritas kami',
    description: 'Merasa dirugikan sebagai konsumen? Kami siap membela hak Anda dengan pendekatan yang sederhana dan efektif.',
    features: [
      'Keluhan produk/jasa bermasalah',
      'Masalah dengan developer properti',
      'Masalah transaksi online dan e-commerce',
      'Konsultasi klaim asuransi'
    ],
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    category: 'personal',
    price: 'Mulai dari Rp 1.500.000',
  },
  {
    slug: 'legalitas-properti',
    icon: HomeIcon,
    title: 'Legalitas Properti & Pertanahan',
    tagline: 'Investasi properti Anda dalam lindungan hukum',
    description: 'Transaksi properti tanpa risiko. Kami pastikan dokumen Anda aman dan sah secara hukum.',
    features: [
      'Pengecekan legalitas tanah/rumah',
      'Pendampingan jual-beli properti',
      'Pembuatan perjanjian sewa',
      'Balik nama sertifikat'
    ],
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    category: 'personal',
    price: 'Mulai dari Rp 2.500.000',
  },
  {
    slug: 'pembuatan-dokumen',
    icon: FileText,
    title: 'Pembuatan Dokumen Hukum',
    tagline: 'Dokumen legal yang sah dan mudah dipahami',
    description: 'Butuh dokumen legal yang sah? Kami siap membuatkan dengan bahasa yang jelas dan mudah dipahami.',
    features: [
      'Surat kuasa dan pernyataan',
      'Perjanjian sewa-menyewa',
      'Kontrak kerjasama',
      'Akta notaris (via mitra notaris)'
    ],
    gradient: 'from-slate-500 to-gray-600',
    bgGradient: 'from-slate-500/10 via-gray-500/5 to-transparent',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    category: 'bisnis',
    price: 'Mulai dari Rp 1.000.000',
  }
]

export const serviceCategories = [
  { value: 'all', label: 'Semua Layanan', count: servicesData.length },
  { value: 'personal', label: 'Keluarga & Personal', count: servicesData.filter(s => s.category === 'personal').length },
  { value: 'bisnis', label: 'Bisnis & Usaha', count: servicesData.filter(s => s.category === 'bisnis').length },
]