import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sanityFetch } from '@/lib/sanity/client'
import { beritaBySlugQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { PortableTextRenderer } from '@/components/publikasi/shared/portable-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Calendar, ExternalLink, Share2, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const revalidate = 1800

interface Props {
  params: { slug: string }
}

export default async function BeritaDetailPage({ params }: Props) {
  const berita = await sanityFetch(beritaBySlugQuery, { slug: params.slug })

  if (!berita) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <div className="relative">
        {berita.mainImage && (
          <div className="relative h-[60vh] w-full">
            <Image
              src={urlFor(berita.mainImage).width(1920).height(1080).url()}
              alt={berita.mainImage.alt || berita.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto max-w-4xl">
                <Breadcrumb className="mb-4">
                  <BreadcrumbList className="text-white/90">
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/publikasi" className="hover:text-white">
                        Publikasi
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/60" />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/publikasi/berita" className="hover:text-white">
                        Berita
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/60" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-white">{berita.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-wrap gap-2 mb-4">
                  {berita.urgent && (
                    <Badge className="bg-red-500 animate-pulse">
                      🔴 Breaking News
                    </Badge>
                  )}
                  {berita.categories.map((cat) => (
                    <Badge
                      key={cat._id}
                      style={{ backgroundColor: cat.color }}
                      className="text-white"
                    >
                      {cat.title}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {berita.title}
                </h1>

                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={berita.publishedAt}>
                      {format(new Date(berita.publishedAt), 'dd MMMM yyyy, HH:mm', { locale: id })} WIB
                    </time>
                  </div>
                  {berita.source?.name && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Sumber: {berita.source.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Excerpt */}
          {berita.excerpt && (
            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-gray-50 rounded-lg font-medium">
              {berita.excerpt}
            </div>
          )}

          {/* Share Button */}
          <div className="flex justify-end mb-6">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
          </div>

          {/* Body */}
          <div className="prose prose-lg max-w-none mb-12">
            <PortableTextRenderer value={berita.body} />
          </div>

          {/* Source Link */}
          {berita.source?.url && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-8">
              <p className="text-sm text-gray-600 mb-2">Sumber Berita:</p>
              <Button variant="outline" asChild>
                <a href={berita.source.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {berita.source.name || 'Buka Sumber'}
                </a>
              </Button>
            </div>
          )}

          <Separator className="my-8" />

          {/* Tags */}
          {berita.tags && berita.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-600">Tags:</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {berita.tags.map((tag) => (
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
  const news = await sanityFetch(`*[_type == "legalNews"]{ "slug": slug.current }`)
  return news.map((n: any) => ({ slug: n.slug }))
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const berita = await sanityFetch(beritaBySlugQuery, { slug: params.slug })
  if (!berita) return {}

  return {
    title: berita.title,
    description: berita.excerpt,
    openGraph: {
      title: berita.title,
      description: berita.excerpt,
      images: berita.mainImage ? [urlFor(berita.mainImage).width(1200).height(630).url()] : [],
    },
  }
}