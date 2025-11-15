import { sanityFetch } from '@/lib/sanity/client'
import { peraturanListQuery, kategoriesQuery } from '@/lib/sanity/queries'
import { PeraturanList } from '@/components/publikasi/peraturan/peraturan-list'
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
import { BookOpen } from 'lucide-react'

export const revalidate = 3600

export const metadata = {
  title: 'Database Peraturan Perundang-undangan | FIRMA-PERARI',
  description: 'Koleksi lengkap peraturan perundang-undangan Indonesia',
}

export default async function PeraturanPage() {
  const [regulations, categories] = await Promise.all([
    sanityFetch(peraturanListQuery),
    sanityFetch(kategoriesQuery),
  ])

  // Group by type
  const uu = regulations.filter((r: any) => ['uu', 'perppu'].includes(r.type))
  const pp = regulations.filter((r: any) => ['pp', 'perpres'].includes(r.type))
  const permen = regulations.filter((r: any) => ['permen', 'perma'].includes(r.type))
  const perda = regulations.filter((r: any) => ['perda', 'pergub', 'perbup'].includes(r.type))

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
            <BreadcrumbPage>Database Peraturan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Database Peraturan</h1>
        </div>
        <p className="text-lg text-gray-600">
          Koleksi peraturan perundang-undangan yang komprehensif dan mudah diakses
        </p>
      </div>

      {/* Filter */}
      <ContentFilter categories={categories} contentType="peraturan" />

      {/* Tabs by Type */}
      <Tabs defaultValue="semua" className="mb-8">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="semua">Semua</TabsTrigger>
          <TabsTrigger value="uu">UU</TabsTrigger>
          <TabsTrigger value="pp">PP/Perpres</TabsTrigger>
          <TabsTrigger value="permen">Permen</TabsTrigger>
          <TabsTrigger value="perda">Perda</TabsTrigger>
        </TabsList>

        <TabsContent value="semua" className="mt-8">
          <PeraturanList regulations={regulations} />
        </TabsContent>

        <TabsContent value="uu" className="mt-8">
          <PeraturanList regulations={uu} />
        </TabsContent>

        <TabsContent value="pp" className="mt-8">
          <PeraturanList regulations={pp} />
        </TabsContent>

        <TabsContent value="permen" className="mt-8">
          <PeraturanList regulations={permen} />
        </TabsContent>

        <TabsContent value="perda" className="mt-8">
          <PeraturanList regulations={perda} />
        </TabsContent>
      </Tabs>
    </div>
  )
}