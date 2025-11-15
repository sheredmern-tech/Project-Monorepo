import { sanityFetch } from '@/lib/sanity/client'
import { 
  featuredArtikelQuery, 
  artikelListQuery, 
  kasusListQuery,
  beritaListQuery 
} from '@/lib/sanity/queries'
import { FeaturedContent } from '@/components/publikasi/shared/featured-content'
import { ArtikelCard } from '@/components/publikasi/artikel/artikel-card'
import { KasusCard } from '@/components/publikasi/kasus/kasus-card'
import { BeritaCard } from '@/components/publikasi/berita/berita-card'
import { CategoryBadge } from '@/components/publikasi/shared/category-badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const revalidate = 3600

export default async function PublikasiPage() {
  const [featured, artikelList, kasusList, beritaList] = await Promise.all([
    sanityFetch(featuredArtikelQuery),
    sanityFetch(artikelListQuery + ' [0...6]'),
    sanityFetch(kasusListQuery + ' [0...3]'),
    sanityFetch(beritaListQuery + ' [0...4]'),
  ])

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Publikasi Hukum</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Artikel, analisis, dan update terkini seputar hukum Indonesia dari para ahli FIRMA-PERARI
        </p>
      </section>

      {/* Featured Content */}
      {featured.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Artikel Unggulan</h2>
          <FeaturedContent articles={featured} />
        </section>
      )}

      {/* Tabs Content */}
      <Tabs defaultValue="artikel" className="mb-16">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="artikel">Artikel</TabsTrigger>
          <TabsTrigger value="kasus">Studi Kasus</TabsTrigger>
          <TabsTrigger value="berita">Berita</TabsTrigger>
          <TabsTrigger value="semua">Semua</TabsTrigger>
        </TabsList>

        {/* Artikel Tab */}
        <TabsContent value="artikel" className="mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artikelList.map((artikel: any) => (
              <ArtikelCard key={artikel._id} artikel={artikel} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/publikasi/artikel">
                Lihat Semua Artikel
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Kasus Tab */}
        <TabsContent value="kasus" className="mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kasusList.map((kasus: any) => (
              <KasusCard key={kasus._id} kasus={kasus} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/publikasi/kasus">
                Lihat Semua Studi Kasus
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Berita Tab */}
        <TabsContent value="berita" className="mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beritaList.map((berita: any) => (
              <BeritaCard key={berita._id} berita={berita} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/publikasi/berita">
                Lihat Semua Berita
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Semua Tab */}
        <TabsContent value="semua" className="mt-8">
          <div className="space-y-12">
            {/* Artikel Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Artikel Terbaru</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artikelList.slice(0, 3).map((artikel: any) => (
                  <ArtikelCard key={artikel._id} artikel={artikel} />
                ))}
              </div>
            </div>

            {/* Kasus Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Studi Kasus Terbaru</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kasusList.map((kasus: any) => (
                  <KasusCard key={kasus._id} kasus={kasus} />
                ))}
              </div>
            </div>

            {/* Berita Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Berita Terbaru</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {beritaList.map((berita: any) => (
                  <BeritaCard key={berita._id} berita={berita} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}