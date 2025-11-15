import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sanityFetch } from '@/lib/sanity/client'
import { artikelBySlugQuery, artikelListQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { PortableTextRenderer } from '@/components/publikasi/shared/portable-text'
import { CategoryBadge } from '@/components/publikasi/shared/category-badge'
import { LegalReferences } from '@/components/publikasi/artikel/legal-references'
import { RelatedContent } from '@/components/publikasi/shared/related-content'
import { AuthorBio } from '@/components/publikasi/shared/author-bio'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Calendar, Clock, Tag, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export default async function ArtikelDetailPage({ params }: Props) {
  const artikel = await sanityFetch(artikelBySlugQuery, { slug: params.slug })

  if (!artikel) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={urlFor(artikel.mainImage).width(1920).height(1080).url()}
          alt={artikel.mainImage.alt || artikel.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
              <BreadcrumbList className="text-white/90">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/publikasi" className="hover:text-white">
                    Publikasi
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/publikasi/artikel" className="hover:text-white">
                    Artikel
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{artikel.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {artikel.categories.map((cat) => (
                <Badge
                  key={cat._id}
                  style={{ backgroundColor: cat.color }}
                  className="text-white"
                >
                  {cat.title}
                </Badge>
              ))}
              {artikel.featured && (
                <Badge className="bg-yellow-500">Unggulan</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {artikel.title}
            </h1>

            {artikel.subtitle && (
              <p className="text-xl text-white/90 mb-4">{artikel.subtitle}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={artikel.publishedAt}>
                  {format(new Date(artikel.publishedAt), 'dd MMMM yyyy', { locale: id })}
                </time>
              </div>
              {artikel.updatedAt && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    Update: {format(new Date(artikel.updatedAt), 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
              )}
              {artikel.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{artikel.readingTime} menit baca</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Excerpt */}
          {artikel.excerpt && (
            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-600">
              {artikel.excerpt}
            </div>
          )}

          {/* Body */}
          <div className="prose prose-lg max-w-none mb-12">
            <PortableTextRenderer value={artikel.body} />
          </div>

          <Separator className="my-12" />

          {/* Legal References */}
          {artikel.legalReferences && artikel.legalReferences.length > 0 && (
            <LegalReferences references={artikel.legalReferences} />
          )}

          {/* Tags */}
          {artikel.tags && artikel.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-600">Tags:</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {artikel.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t">
            <AuthorBio author={artikel.author} />
          </div>

          {/* Related Content */}
          {artikel.courtCases && artikel.courtCases.length > 0 && (
            <div className="mt-12">
              <RelatedContent 
                title="Studi Kasus Terkait" 
                items={artikel.courtCases}
                type="kasus"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// Generate static params
export async function generateStaticParams() {
  const articles = await sanityFetch(`*[_type == "legalArticle"]{ "slug": slug.current }`)
  return articles.map((article: any) => ({
    slug: article.slug,
  }))
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const artikel = await sanityFetch(artikelBySlugQuery, { slug: params.slug })
  
  if (!artikel) return {}

  return {
    title: artikel.seoTitle || artikel.title,
    description: artikel.seoDescription || artikel.excerpt,
    keywords: artikel.seoKeywords,
    openGraph: {
      title: artikel.seoTitle || artikel.title,
      description: artikel.seoDescription || artikel.excerpt,
      images: [urlFor(artikel.mainImage).width(1200).height(630).url()],
    },
  }
}