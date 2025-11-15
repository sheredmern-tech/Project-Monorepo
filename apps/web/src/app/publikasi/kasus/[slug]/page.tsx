import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sanityFetch } from '@/lib/sanity/client'
import { kasusBySlugQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { PortableTextRenderer } from '@/components/publikasi/shared/portable-text'
import { CategoryBadge } from '@/components/publikasi/shared/category-badge'
import { AuthorBio } from '@/components/publikasi/shared/author-bio'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Calendar, Gavel, Building, CheckCircle, Lightbulb } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

const verdictLabels: Record<string, { label: string; color: string; icon: string }> = {
  granted: { label: 'Dikabulkan', color: 'bg-green-100 text-green-800', icon: '✓' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: '✗' },
  inadmissible: { label: 'Tidak Dapat Diterima', color: 'bg-gray-100 text-gray-800', icon: '○' },
  withdrawn: { label: 'Dicabut', color: 'bg-yellow-100 text-yellow-800', icon: '↩' },
}

const caseTypeLabels: Record<string, string> = {
  pidana: 'Pidana',
  perdata: 'Perdata',
  tun: 'Tata Usaha Negara',
  agama: 'Agama',
  niaga: 'Niaga',
  arbitrase: 'Arbitrase',
}

export default async function KasusDetailPage({ params }: Props) {
  const kasus = await sanityFetch(kasusBySlugQuery, { slug: params.slug })

  if (!kasus) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList className="text-white/90">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/publikasi" className="hover:text-white">
                    Publikasi
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/publikasi/kasus" className="hover:text-white">
                    Studi Kasus
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{kasus.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Type & Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {kasus.caseType && (
                <Badge className="bg-white/20 text-white">
                  {caseTypeLabels[kasus.caseType] || kasus.caseType}
                </Badge>
              )}
              {kasus.categories.map((cat) => (
                <Badge
                  key={cat._id}
                  style={{ backgroundColor: cat.color }}
                  className="text-white"
                >
                  {cat.title}
                </Badge>
              ))}
              {kasus.featured && (
                <Badge className="bg-yellow-500">Unggulan</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {kasus.title}
            </h1>

            {/* Case Number */}
            {kasus.caseNumber && (
              <p className="text-xl font-mono bg-white/10 inline-block px-4 py-2 rounded mb-6">
                {kasus.caseNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Case Info Cards */}
      <div className="container mx-auto px-4 -mt-8 mb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {/* Court */}
          {kasus.court && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span className="text-xs font-semibold">Pengadilan</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{kasus.court}</p>
              </CardContent>
            </Card>
          )}

          {/* Verdict Date */}
          {kasus.verdictDate && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold">Tanggal Putusan</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {format(new Date(kasus.verdictDate), 'dd MMMM yyyy', { locale: id })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Verdict */}
          {kasus.verdict && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Gavel className="w-4 h-4" />
                  <span className="text-xs font-semibold">Putusan</span>
                </div>
              </CardHeader>
              <CardContent>
                <Badge className={verdictLabels[kasus.verdict]?.color || 'bg-gray-100'}>
                  {verdictLabels[kasus.verdict]?.icon} {verdictLabels[kasus.verdict]?.label || kasus.verdict}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Image */}
          {kasus.mainImage && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-12">
              <Image
                src={urlFor(kasus.mainImage).width(1200).url()}
                alt={kasus.mainImage.alt || kasus.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {kasus.excerpt && (
            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              {kasus.excerpt}
            </div>
          )}

          {/* Body */}
          <div className="prose prose-lg max-w-none mb-12">
            <PortableTextRenderer value={kasus.body} />
          </div>

          <Separator className="my-12" />

          {/* Key Learnings */}
          {kasus.keyLearnings && kasus.keyLearnings.length > 0 && (
            <Card className="mb-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Poin Pembelajaran Penting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {kasus.keyLearnings.map((learning, index) => (
                    <li key={index} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{learning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t">
            <AuthorBio author={kasus.author} />
          </div>
        </div>
      </div>
    </article>
  )
}

// Generate static params
export async function generateStaticParams() {
  const cases = await sanityFetch(`*[_type == "caseStudy"]{ "slug": slug.current }`)
  return cases.map((c: any) => ({ slug: c.slug }))
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const kasus = await sanityFetch(kasusBySlugQuery, { slug: params.slug })
  if (!kasus) return {}

  return {
    title: kasus.seoTitle || kasus.title,
    description: kasus.seoDescription || kasus.excerpt,
    openGraph: {
      title: kasus.seoTitle || kasus.title,
      description: kasus.seoDescription || kasus.excerpt,
      images: kasus.mainImage ? [urlFor(kasus.mainImage).width(1200).height(630).url()] : [],
    },
  }
}