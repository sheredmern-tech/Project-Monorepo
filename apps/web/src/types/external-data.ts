// Types for External Legal Reference Data

export interface LegalReferenceItem {
  id: string | number
  title?: string
  judul?: string
  content?: string
  isi?: string
  deskripsi?: string
  description?: string
  pasal?: string
  ayat?: string
  bab?: string
  bagian?: string
  chapter?: string
  article?: string
  [key: string]: any // Allow for flexible API responses
}

export interface LegalReferenceResponse {
  success: boolean
  data: LegalReferenceItem[]
  timestamp?: string
  message?: string
}

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
  icon: string
  color: string
}

export const LEGAL_CATEGORIES: LegalCategoryConfig[] = [
  {
    id: 'pancasila',
    label: 'Pancasila',
    description: 'Dasar Negara Indonesia',
    icon: '🇮🇩',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400'
  },
  {
    id: 'uud1945',
    label: 'UUD 1945',
    description: 'Undang-Undang Dasar 1945',
    icon: '📜',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
  },
  {
    id: 'kuhp',
    label: 'KUHP',
    description: 'Kitab Undang-Undang Hukum Pidana',
    icon: '⚖️',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
  },
  {
    id: 'kuhperdata',
    label: 'KUH Perdata',
    description: 'Kitab Undang-Undang Hukum Perdata',
    icon: '📋',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400'
  },
  {
    id: 'kuhd',
    label: 'KUHD',
    description: 'Kitab Undang-Undang Hukum Dagang',
    icon: '💼',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
  },
  {
    id: 'kuhap',
    label: 'KUHAP',
    description: 'Kitab Undang-Undang Hukum Acara Pidana',
    icon: '🏛️',
    color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
  }
]
