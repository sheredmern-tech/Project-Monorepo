import { Metadata } from 'next'
import { Suspense } from 'react'
import { Scale, BookOpen } from 'lucide-react'
import { LegalReferenceClient } from '@/components/referensi-hukum/legal-reference-client'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LegalReferenceResponse,
  LegalCategory,
  PancasilaItem,
  LegalData,
  ProcessedLegalData
} from '@/types/external-data'
import { EXTERNAL_DATA_API } from '@/lib/config/constants'

export const metadata: Metadata = {
  title: 'Referensi Hukum | Database Perundang-undangan Indonesia',
  description:
    'Akses lengkap Pancasila, UUD 1945, KUHP, KUH Perdata, KUHD, dan KUHAP. Referensi hukum Indonesia yang mudah dicari dan dibagikan.',
  keywords: 'pancasila, uud 1945, kuhp, kuh perdata, kuhd, kuhap, hukum indonesia'
}

// API Base URL
const API_BASE_URL = EXTERNAL_DATA_API

// Fetch data for a specific category
async function fetchCategoryData(
  category: LegalCategory
): Promise<ProcessedLegalData> {
  try {
    const response = await fetch(`${API_BASE_URL}/${category}`, {
      next: { revalidate: 3600 }, // Cache 1 hour
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${category}: ${response.statusText}`)
      return {
        category,
        items: [],
        metadata: {}
      }
    }

    const result = await response.json()

    // Pancasila returns array directly
    if (category === 'pancasila') {
      const data: LegalReferenceResponse<PancasilaItem[]> = result
      return {
        category,
        items: data.data || []
      }
    }

    // Other categories return object with nested data
    const data: LegalReferenceResponse<LegalData> = result
    return {
      category,
      items: data.data?.data || [],
      metadata: {
        uu: data.data?.uu,
        keterangan: data.data?.keterangan
      }
    }
  } catch (error) {
    console.error(`Error fetching ${category}:`, error)
    return {
      category,
      items: [],
      metadata: {}
    }
  }
}

// Fetch all legal reference data
async function fetchAllLegalData(): Promise<Record<LegalCategory, ProcessedLegalData>> {
  const categories: LegalCategory[] = [
    'pancasila',
    'uud1945',
    'kuhp',
    'kuhperdata',
    'kuhd',
    'kuhap'
  ]

  const results = await Promise.allSettled(
    categories.map((category) => fetchCategoryData(category))
  )

  const allData: Record<LegalCategory, ProcessedLegalData> = {} as any

  results.forEach((result, index) => {
    const category = categories[index]
    if (result.status === 'fulfilled') {
      allData[category] = result.value
    } else {
      console.error(`Failed to fetch ${category}:`, result.reason)
      allData[category] = {
        category,
        items: [],
        metadata: {}
      }
    }
  })

  return allData
}

// Simple Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {/* Search & Tabs Skeleton */}
      <div className="border-b pb-4 space-y-4">
        <Skeleton className="h-11 w-full" />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      {/* Content Skeleton */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-16 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// Calculate total items
function getTotalItems(data: Record<LegalCategory, ProcessedLegalData>): number {
  return Object.values(data).reduce((acc, cat) => acc + cat.items.length, 0)
}

// Main page component
export default async function ReferensiHukumPage() {
  const data = await fetchAllLegalData()
  const totalItems = getTotalItems(data)

  return (
    <div className="min-h-screen bg-background">
      {/* Elegant Minimal Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Referensi Hukum</h1>
                <p className="text-sm text-muted-foreground">
                  Database Perundang-undangan Indonesia
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{totalItems.toLocaleString()} Items</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <LegalReferenceClient data={data} />
        </Suspense>
      </main>

      {/* Simple Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span>Referensi Hukum Indonesia</span>
            </div>
            <div className="flex items-center gap-6">
              <span>{totalItems.toLocaleString()} Total Items</span>
              <span>6 Kategori</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}