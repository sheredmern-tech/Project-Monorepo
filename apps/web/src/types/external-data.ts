// types/external-data.ts
import { LucideIcon } from 'lucide-react'

// ========== PANCASILA ==========
export interface PancasilaItem {
  isi: string
  nama: string
  butir: string[]
}

// ========== UUD, KUHP, KUHPERDATA, KUHD, KUHAP ==========
export interface LegalDataItem {
  isi: string
  nama: string
}

export interface LegalData {
  uu: string
  keterangan: string
  data: LegalDataItem[]
}

// ========== API RESPONSE ==========
export interface LegalReferenceResponse<T = any> {
  success: boolean
  data: T
  timestamp: string
}

// ========== CATEGORY ==========
export type LegalCategory =
  | 'pancasila'
  | 'uud1945'
  | 'kuhp'
  | 'kuhperdata'
  | 'kuhd'
  | 'kuhap'

export interface LegalCategoryConfig {
  id: LegalCategory
  label: string
  description: string
  iconName: string
  color: {
    bg: string
    text: string
    border: string
  }
}

export const LEGAL_CATEGORIES: LegalCategoryConfig[] = [
  {
    id: 'pancasila',
    label: 'Pancasila',
    description: 'Dasar Negara Indonesia - 5 Sila',
    iconName: 'Flag',
    color: {
      bg: 'bg-gradient-to-br from-red-500/10 to-red-600/5',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-2 border-red-500/20 hover:border-red-500/40'
    }
  },
  {
    id: 'uud1945',
    label: 'UUD 1945',
    description: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
    iconName: 'ScrollText',
    color: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-2 border-blue-500/20 hover:border-blue-500/40'
    }
  },
  {
    id: 'kuhp',
    label: 'KUHP',
    description: 'Kitab Undang-Undang Hukum Pidana',
    iconName: 'Scale',
    color: {
      bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-2 border-purple-500/20 hover:border-purple-500/40'
    }
  },
  {
    id: 'kuhperdata',
    label: 'KUH Perdata',
    description: 'Kitab Undang-Undang Hukum Perdata',
    iconName: 'FileText',
    color: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-600/5',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-2 border-green-500/20 hover:border-green-500/40'
    }
  },
  {
    id: 'kuhd',
    label: 'KUHD',
    description: 'Kitab Undang-Undang Hukum Dagang',
    iconName: 'Briefcase',
    color: {
      bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-2 border-amber-500/20 hover:border-amber-500/40'
    }
  },
  {
    id: 'kuhap',
    label: 'KUHAP',
    description: 'Kitab Undang-Undang Hukum Acara Pidana',
    iconName: 'Landmark',
    color: {
      bg: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-2 border-indigo-500/20 hover:border-indigo-500/40'
    }
  }
]

// ========== UNIFIED DATA TYPE ==========
export type UnifiedLegalItem = PancasilaItem | LegalDataItem

export interface ProcessedLegalData {
  category: LegalCategory
  items: UnifiedLegalItem[]
  metadata?: {
    uu?: string
    keterangan?: string
  }
}