import { sanityFetch } from '@/lib/sanity/client'
import { artikelListQuery, kategoriesQuery } from '@/lib/sanity/queries'
import { ArtikelList } from '@/components/publikasi/artikel/artikel-list'
import { ContentFilter } from '@/components/publikasi/shared/content-filter'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'

export const revalidate = 3600

export const metadata = {
  title: 'Artikel Hukum | FIRMA-PERARI',
  description: 'Koleksi artikel dan analisis hukum Indonesia',
}

export default async function ArtikelPage() {
  const [articles, categories] = await Promise.all([
    sanityFetch(artikelListQuery),
    sanityFetch(kategoriesQuery),
  ])

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
            <BreadcrumbPage>Artikel Hukum</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Artikel Hukum</h1>
        <p className="text-lg text-gray-600">
          Analisis mendalam dan pembahasan komprehensif tentang berbagai topik hukum
        </p>
      </div>

      {/* Filter */}
      <ContentFilter categories={categories} contentType="artikel" />

      {/* List */}
      <ArtikelList articles={articles} />
    </div>
  )
}