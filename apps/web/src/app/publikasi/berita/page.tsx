import { sanityFetch } from '@/lib/sanity/client'
import { beritaListQuery, kategoriesQuery } from '@/lib/sanity/queries'
import { BeritaList } from '@/components/publikasi/berita/berita-list'
import { ContentFilter } from '@/components/publikasi/shared/content-filter'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { AlertCircle } from 'lucide-react'

export const revalidate = 1800 // Revalidate setiap 30 menit (berita lebih fresh)

export const metadata = {
  title: 'Berita Hukum Terkini | FIRMA-PERARI',
  description: 'Update berita dan perkembangan hukum terbaru di Indonesia',
}

export default async function BeritaPage() {
  const [news, categories] = await Promise.all([
    sanityFetch(beritaListQuery),
    sanityFetch(kategoriesQuery),
  ])

  const urgentNews = news.filter((n: any) => n.urgent)
  const regularNews = news.filter((n: any) => !n.urgent)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/publikasi">Publikasi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Berita Hukum</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Berita Hukum</h1>
        <p className="text-lg text-gray-600">
          Update dan perkembangan terkini seputar hukum di Indonesia
        </p>
      </div>

      {/* Breaking News Alert */}
      {urgentNews.length > 0 && (
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Breaking News</AlertTitle>
          <AlertDescription className="text-red-700">
            Ada {urgentNews.length} berita penting yang perlu Anda ketahui
          </AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <ContentFilter categories={categories} contentType="berita" />

      {/* Urgent News Section */}
      {urgentNews.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-2">
            <span className="animate-pulse">🔴</span>
            Breaking News
          </h2>
          <BeritaList news={urgentNews} />
        </div>
      )}

      {/* Regular News Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Berita Terbaru</h2>
        <BeritaList news={regularNews} />
      </div>
    </div>
  )
}