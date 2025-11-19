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

import { LucideIcon } from 'lucide-react'

export interface LegalCategoryConfig {
  id: LegalCategory
  label: string
  description: string
  iconName: string // For reference
  color: string
}

export const LEGAL_CATEGORIES: LegalCategoryConfig[] = [
  {
    id: 'pancasila',
    label: 'Pancasila',
    description: 'Dasar Negara Indonesia',
    iconName: 'Flag',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
  },
  {
    id: 'uud1945',
    label: 'UUD 1945',
    description: 'Undang-Undang Dasar 1945',
    iconName: 'ScrollText',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  },
  {
    id: 'kuhp',
    label: 'KUHP',
    description: 'Kitab Undang-Undang Hukum Pidana',
    iconName: 'Scale',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
  },
  {
    id: 'kuhperdata',
    label: 'KUH Perdata',
    description: 'Kitab Undang-Undang Hukum Perdata',
    iconName: 'FileText',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  {
    id: 'kuhd',
    label: 'KUHD',
    description: 'Kitab Undang-Undang Hukum Dagang',
    iconName: 'Briefcase',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'kuhap',
    label: 'KUHAP',
    description: 'Kitab Undang-Undang Hukum Acara Pidana',
    iconName: 'Gavel',
    color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
  }
]
