import { sanityFetch } from '@/lib/sanity/client'
import { kasusListQuery, kategoriesQuery } from '@/lib/sanity/queries'
import { KasusList } from '@/components/publikasi/kasus/kasus-list'
import { ContentFilter } from '@/components/publikasi/shared/content-filter'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const revalidate = 3600

export const metadata = {
  title: 'Studi Kasus Hukum | FIRMA-PERARI',
  description: 'Analisis mendalam kasus-kasus hukum penting di Indonesia',
}

export default async function KasusPage() {
  const [cases, categories] = await Promise.all([
    sanityFetch(kasusListQuery),
    sanityFetch(kategoriesQuery),
  ])

  // Group by case type
  const pidana = cases.filter((c: any) => c.caseType === 'pidana')
  const perdata = cases.filter((c: any) => c.caseType === 'perdata')
  const tun = cases.filter((c: any) => c.caseType === 'tun')
  const other = cases.filter((c: any) => !['pidana', 'perdata', 'tun'].includes(c.caseType))

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
            <BreadcrumbPage>Studi Kasus</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Studi Kasus Hukum</h1>
        <p className="text-lg text-gray-600">
          Analisis mendalam dan pembelajaran dari kasus-kasus hukum penting
        </p>
      </div>

      {/* Filter */}
      <ContentFilter categories={categories} contentType="kasus" />

      {/* Tabs by Case Type */}
      <Tabs defaultValue="semua" className="mb-8">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="semua">Semua</TabsTrigger>
          <TabsTrigger value="pidana">Pidana</TabsTrigger>
          <TabsTrigger value="perdata">Perdata</TabsTrigger>
          <TabsTrigger value="tun">TUN</TabsTrigger>
          <TabsTrigger value="lainnya">Lainnya</TabsTrigger>
        </TabsList>

        <TabsContent value="semua" className="mt-8">
          <KasusList cases={cases} />
        </TabsContent>

        <TabsContent value="pidana" className="mt-8">
          <KasusList cases={pidana} />
        </TabsContent>

        <TabsContent value="perdata" className="mt-8">
          <KasusList cases={perdata} />
        </TabsContent>

        <TabsContent value="tun" className="mt-8">
          <KasusList cases={tun} />
        </TabsContent>

        <TabsContent value="lainnya" className="mt-8">
          <KasusList cases={other} />
        </TabsContent>
      </Tabs>
    </div>
  )
}