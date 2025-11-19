import { Metadata } from 'next'
import { Suspense } from 'react'
import { Scale, BookOpen, Library, Sparkles } from 'lucide-react'
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
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1/external-data'

// Fetch data for a specific category
async function fetchCategoryData(
  category: LegalCategory
): Promise<LegalReferenceItem[]> {
  try {
    const url = `${API_BASE_URL}/${category}`
    console.log(`[Referensi Hukum] Fetching ${category} from ${url}`)

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(
        `[Referensi Hukum] Failed to fetch ${category}: ${response.status} ${response.statusText}`
      )
      return []
    }

    const json = await response.json()
    console.log(
      `[Referensi Hukum] Response for ${category}:`,
      JSON.stringify(json).substring(0, 200)
    )

    // Handle response wrapped by TransformInterceptor
    // Expected structure: { success: true, data: [...], timestamp: "..." }
    if (json.success && json.data) {
      // If data is already an array, use it directly
      if (Array.isArray(json.data)) {
        console.log(`[Referensi Hukum] ${category}: Found ${json.data.length} items`)
        return json.data
      }
      // If data is an object, check if it has a data property (double wrapped)
      if (json.data.data && Array.isArray(json.data.data)) {
        console.log(
          `[Referensi Hukum] ${category}: Found ${json.data.data.length} items (double wrapped)`
        )
        return json.data.data
      }
      // If data is an object but not an array, wrap it in an array
      console.log(`[Referensi Hukum] ${category}: Converting object to array`)
      return [json.data]
    }

    // Fallback: if response is directly an array
    if (Array.isArray(json)) {
      console.log(`[Referensi Hukum] ${category}: Direct array with ${json.length} items`)
      return json
    }

    console.warn(`[Referensi Hukum] ${category}: Unexpected response structure`, json)
    return []
  } catch (error) {
    console.error(`[Referensi Hukum] Error fetching ${category}:`, error)
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
      <Card className="border-2">
        <CardContent className="pt-6">
          <Skeleton className="h-12 w-full rounded-xl" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
      <header className="border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20">
                  <Scale className="h-7 w-7 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    Referensi Hukum
                    <Sparkles className="h-5 w-5 text-primary" />
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    Database Perundang-undangan Indonesia
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 px-5 py-3">
                <BookOpen className="h-5 w-5 text-primary" strokeWidth={2} />
                <div className="text-sm">
                  <p className="font-bold text-lg text-foreground">
                    {Object.values(data).reduce((acc, items) => acc + items.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Total Item</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border-2 px-5 py-3">
                <Library className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                <div className="text-sm">
                  <p className="font-bold text-lg text-foreground">6 Kategori</p>
                  <p className="text-xs text-muted-foreground font-medium">Perundangan</p>
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
      <footer className="border-t-2 mt-16 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Scale className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-foreground">
                Referensi Hukum Indonesia
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Database lengkap perundang-undangan Indonesia. Gunakan fitur pencarian untuk menemukan pasal, ayat, bab, atau konten yang Anda butuhkan dengan mudah dan cepat.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Data dari API External Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
