import { Metadata } from 'next'
import { Suspense } from 'react'
import { Scale, BookOpen, Gavel } from 'lucide-react'
import { LegalReferenceClient } from '@/components/referensi-hukum/legal-reference-client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LegalReferenceResponse,
  LegalCategory,
  LegalReferenceItem
} from '@/types/external-data'

export const metadata: Metadata = {
  title: 'Referensi Hukum | Database Perundang-undangan Indonesia',
  description:
    'Akses lengkap Pancasila, UUD 1945, KUHP, KUH Perdata, KUHD, dan KUHAP. Referensi hukum Indonesia yang mudah dicari dan dibagikan.'
}

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api/v1/external-data'

// Fetch data for a specific category
async function fetchCategoryData(
  category: LegalCategory
): Promise<LegalReferenceItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${category}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${category}: ${response.statusText}`)
      return []
    }

    const data: LegalReferenceResponse = await response.json()

    if (data.success && Array.isArray(data.data)) {
      return data.data
    }

    return []
  } catch (error) {
    console.error(`Error fetching ${category}:`, error)
    return []
  }
}

// Fetch all legal reference data
async function fetchAllLegalData() {
  const categories: LegalCategory[] = [
    'pancasila',
    'uud1945',
    'kuhp',
    'kuhperdata',
    'kuhd',
    'kuhap'
  ]

  const results = await Promise.all(
    categories.map(async (category) => ({
      category,
      data: await fetchCategoryData(category)
    }))
  )

  const allData = results.reduce(
    (acc, { category, data }) => {
      acc[category] = data
      return acc
    },
    {} as Record<LegalCategory, LegalReferenceItem[]>
  )

  return allData
}

// Loading component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main page component
export default async function ReferensiHukumPage() {
  const data = await fetchAllLegalData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Referensi Hukum
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Database Perundang-undangan Indonesia
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">
                    {Object.values(data).reduce((acc, items) => acc + items.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Item</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
                <Gavel className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">6 Kategori</p>
                  <p className="text-xs text-muted-foreground">Perundangan</p>
                </div>
              </div>
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

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-5 w-5" />
              <p className="text-sm">
                Referensi Hukum Indonesia - Data dari API External Data
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Gunakan fitur pencarian untuk menemukan pasal, ayat, atau konten
              yang Anda butuhkan
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
