import { Metadata } from 'next'
import { Suspense } from 'react'
import { Scale, BookOpen, Gavel, Library, Sparkles } from 'lucide-react'
import { LegalReferenceClient } from '@/components/referensi-hukum/legal-reference-client'
import { Card, CardContent } from '@/components/ui/card'
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

// Enhanced Loading component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardContent className="pt-6">
          <Skeleton className="h-12 w-full rounded-lg" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Card className="border-2 shadow-xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      {/* Modern Header with Gradient */}
      <header className="border-b-2 border-primary/10 bg-gradient-to-r from-background/95 via-background/98 to-primary/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 shadow-lg">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Referensi Hukum
                </h1>
                <p className="text-base text-muted-foreground flex items-center gap-2 mt-1">
                  <Library className="h-4 w-4" />
                  Database Perundang-undangan Indonesia
                </p>
              </div>
            </div>

            {/* Stats Cards with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalItems}</p>
                      <p className="text-xs text-muted-foreground">Total Item Hukum</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <Gavel className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">6 Kategori</p>
                      <p className="text-xs text-muted-foreground">Perundang-undangan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                      <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">Smart Search</p>
                      <p className="text-xs text-muted-foreground">Pencarian Cerdas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      {/* Enhanced Footer */}
      <footer className="border-t-2 border-primary/10 mt-16 bg-gradient-to-r from-muted/20 via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Referensi Hukum Indonesia</p>
                <p className="text-xs text-muted-foreground">Powered by Firma App</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Smart Batching (30 items/load)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Enhanced Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span>6 Kategori Hukum</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Gunakan fitur pencarian cerdas untuk menemukan pasal, ayat, atau konten hukum yang Anda butuhkan.
              Semua data dimuat secara efisien dengan teknologi infinite scroll.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}