import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity/client'
import { contentByKategoriQuery, kategoriesQuery } from '@/lib/sanity/queries'
import { ArtikelCard } from '@/components/publikasi/artikel/artikel-card'
import { KasusCard } from '@/components/publikasi/kasus/kasus-card'
import { BeritaCard } from '@/components/publikasi/berita/berita-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Scale, FileText, Gavel, Newspaper } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export default async function KategoriPage({ params }: Props) {
  const categories = await sanityFetch(kategoriesQuery)
  const category = categories.find((c: any) => c.slug.current === params.slug)

  if (!category) {
    notFound()
  }

  const categoryId = category._id
  const content = await sanityFetch(contentByKategoriQuery, { categoryId })

  const totalContent = 
    content.articles.length + 
    content.cases.length + 
    content.news.length

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div 
        className="py-16 text-white"
        style={{ backgroundColor: category.color || '#3B82F6' }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb className="mb-6">
              <BreadcrumbList className="text-white/90">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/publikasi" className="hover:text-white">
                    Publikasi
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    {category.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4 mb-4">
              {category.icon && <Scale className="w-12 h-12" />}
              <h1 className="text-5xl font-bold">{category.title}</h1>
            </div>

            {category.description && (
              <p className="text-xl text-white/90 mb-6">{category.description}</p>
            )}

            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                {totalContent} Konten
              </Badge>
              <Badge className="bg-white/20 text-white">
                {content.articles.length} Artikel
              </Badge>
              <Badge className="bg-white/20 text-white">
                {content.cases.length} Kasus
              </Badge>
              <Badge className="bg-white/20 text-white">
                {content.news.length} Berita
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {totalContent === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Belum ada konten untuk kategori ini
              </p>
            </div>
          ) : (
            <Tabs defaultValue="semua">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                <TabsTrigger value="semua">
                  Semua ({totalContent})
                </TabsTrigger>
                <TabsTrigger value="artikel">
                  Artikel ({content.articles.length})
                </TabsTrigger>
                <TabsTrigger value="kasus">
                  Kasus ({content.cases.length})
                </TabsTrigger>
                <TabsTrigger value="berita">
                  Berita ({content.news.length})
                </TabsTrigger>
              </TabsList>

              {/* Semua Tab */}
              <TabsContent value="semua" className="space-y-12">
                {/* Artikel */}
                {content.articles.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h2 className="text-2xl font-bold">Artikel Hukum</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {content.articles.map((article: any) => (
                        <ArtikelCard key={article._id} artikel={article} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Kasus */}
                {content.cases.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Gavel className="w-5 h-5 text-blue-600" />
                      <h2 className="text-2xl font-bold">Studi Kasus</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {content.cases.map((kasus: any) => (
                        <KasusCard key={kasus._id} kasus={kasus} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Berita */}
                {content.news.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Newspaper className="w-5 h-5 text-blue-600" />
                      <h2 className="text-2xl font-bold">Berita Hukum</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {content.news.map((berita: any) => (
                        <BeritaCard key={berita._id} berita={berita} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Artikel Tab */}
              <TabsContent value="artikel">
                {content.articles.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">Belum ada artikel</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content.articles.map((article: any) => (
                      <ArtikelCard key={article._id} artikel={article} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Kasus Tab */}
              <TabsContent value="kasus">
                {content.cases.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">Belum ada studi kasus</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content.cases.map((kasus: any) => (
                      <KasusCard key={kasus._id} kasus={kasus} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Berita Tab */}
              <TabsContent value="berita">
                {content.news.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">Belum ada berita</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.news.map((berita: any) => (
                      <BeritaCard key={berita._id} berita={berita} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

// Generate static params
export async function generateStaticParams() {
  const categories = await sanityFetch(kategoriesQuery)
  return categories.map((cat: any) => ({
    slug: cat.slug.current,
  }))
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const categories = await sanityFetch(kategoriesQuery)
  const category = categories.find((c: any) => c.slug.current === params.slug)

  if (!category) return {}

  return {
    title: `${category.title} | Publikasi FIRMA-PERARI`,
    description: category.description || `Konten hukum kategori ${category.title}`,
    keywords: category.seoKeywords,
  }
}