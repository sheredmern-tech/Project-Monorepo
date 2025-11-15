import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/client'
import { peraturanBySlugQuery } from '@/lib/sanity/queries'
import { PortableTextRenderer } from '@/components/publikasi/shared/portable-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { 
  BookOpen, 
  Calendar, 
  ExternalLink, 
  FileText, 
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

const typeLabels: Record<string, string> = {
  uud: 'UUD 1945',
  uu: 'Undang-Undang',
  perppu: 'Peraturan Pemerintah Pengganti Undang-Undang',
  pp: 'Peraturan Pemerintah',
  perpres: 'Peraturan Presiden',
  permen: 'Peraturan Menteri',
  perma: 'Peraturan Mahkamah Agung',
  perda: 'Peraturan Daerah',
  pergub: 'Peraturan Gubernur',
  perbup: 'Peraturan Bupati/Walikota',
}

const statusInfo: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'Berlaku', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  revoked: { label: 'Dicabut', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  amended: { label: 'Diubah', color: 'bg-yellow-100 text-yellow-800', icon: History },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
}

export default async function PeraturanDetailPage({ params }: Props) {
  const peraturan = await sanityFetch(peraturanBySlugQuery, { slug: params.slug })

  if (!peraturan) {
    notFound()
  }

  const StatusIcon = statusInfo[peraturan.status]?.icon || FileText

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
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
                  <BreadcrumbLink href="/publikasi/peraturan" className="hover:text-white">
                    Peraturan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    {peraturan.type.toUpperCase()} No. {peraturan.number} Tahun {peraturan.year}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-10 h-10" />
              <Badge className="bg-white/20 text-white text-lg px-4 py-1">
                {typeLabels[peraturan.type] || peraturan.type.toUpperCase()}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Nomor {peraturan.number} Tahun {peraturan.year}
            </h1>

            <p className="text-2xl mb-6">Tentang: {peraturan.title}</p>

            <div className="flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              <Badge className={statusInfo[peraturan.status]?.color || 'bg-gray-100'}>
                {statusInfo[peraturan.status]?.label || peraturan.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="container mx-auto px-4 -mt-8 mb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {peraturan.promulgationDate && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold">Tanggal Diundangkan</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {format(new Date(peraturan.promulgationDate), 'dd MMMM yyyy', { locale: id })}
                </p>
              </CardContent>
            </Card>
          )}

          {peraturan.effectiveDate && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Tanggal Berlaku</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {format(new Date(peraturan.effectiveDate), 'dd MMMM yyyy', { locale: id })}
                </p>
              </CardContent>
            </Card>
          )}

          {peraturan.officialSource && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-xs font-semibold">Sumber Resmi</span>
                </div>
              </CardHeader>
              <CardContent>
                <Button size="sm" variant="outline" asChild className="w-full">
                  <a href={peraturan.officialSource} target="_blank" rel="noopener noreferrer">
                    Buka Dokumen
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Categories */}
          {peraturan.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {peraturan.categories.map((cat) => (
                <Badge
                  key={cat._id}
                  style={{ backgroundColor: cat.color }}
                  className="text-white"
                >
                  {cat.title}
                </Badge>
              ))}
            </div>
          )}

          {/* Summary */}
          {peraturan.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{peraturan.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Points */}
          {peraturan.keyPoints && peraturan.keyPoints.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Poin-Poin Penting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {peraturan.keyPoints.map((point, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-blue-600 font-bold flex-shrink-0">
                        {index + 1}.
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Full Content */}
          {peraturan.content && (
            <Card>
              <CardHeader>
                <CardTitle>Isi Peraturan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <PortableTextRenderer value={peraturan.content} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amendments */}
          {peraturan.amendments && peraturan.amendments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Riwayat Perubahan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {peraturan.amendments.map((amendment, index) => (
                    <AccordionItem key={index} value={`amendment-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 text-left">
                          <Badge variant="outline">
                            {amendment.date && format(new Date(amendment.date), 'dd MMM yyyy', { locale: id })}
                          </Badge>
                          <span>{amendment.description}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {amendment.regulation && (
                          <p className="text-sm text-gray-600">
                            Diubah oleh: {amendment.regulation.title}
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Related Regulations */}
          {peraturan.relatedRegulations && peraturan.relatedRegulations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Peraturan Terkait</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {peraturan.relatedRegulations.map((related) => (
                    <Link
                      key={related._id}
                      href={`/publikasi/peraturan/${related.slug.current}`}
                      className="block p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <p className="font-semibold">
                        {related.type.toUpperCase()} No. {related.number} Tahun {related.year}
                      </p>
                      <p className="text-sm text-gray-600">Tentang: {related.title}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {peraturan.tags && peraturan.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {peraturan.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// Generate static params
export async function generateStaticParams() {
  const regulations = await sanityFetch(`*[_type == "regulation"]{ "slug": slug.current }`)
  return regulations.map((r: any) => ({ slug: r.slug }))
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const peraturan = await sanityFetch(peraturanBySlugQuery, { slug: params.slug })
  if (!peraturan) return {}

  return {
    title: `${peraturan.type.toUpperCase()} No. ${peraturan.number} Tahun ${peraturan.year} - ${peraturan.title}`,
    description: peraturan.summary || `Peraturan tentang ${peraturan.title}`,
  }
}