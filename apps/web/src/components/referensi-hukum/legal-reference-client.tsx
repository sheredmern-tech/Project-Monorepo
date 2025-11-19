'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search,
  Copy,
  Share2,
  Check,
  Flag,
  ScrollText,
  Scale,
  FileText,
  Briefcase,
  Gavel,
  Loader2,
  ChevronDown,
  FileSearch
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  LegalReferenceItem,
  LegalCategory,
  LEGAL_CATEGORIES
} from '@/types/external-data'

interface LegalReferenceClientProps {
  data: Record<LegalCategory, LegalReferenceItem[]>
}

// Icon mapping for categories
const CATEGORY_ICONS = {
  pancasila: Flag,
  uud1945: ScrollText,
  kuhp: Scale,
  kuhperdata: FileText,
  kuhd: Briefcase,
  kuhap: Gavel
}

const ITEMS_PER_PAGE = 30

export function LegalReferenceClient({ data }: LegalReferenceClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [visibleCounts, setVisibleCounts] = useState<Record<LegalCategory, number>>({
    pancasila: ITEMS_PER_PAGE,
    uud1945: ITEMS_PER_PAGE,
    kuhp: ITEMS_PER_PAGE,
    kuhperdata: ITEMS_PER_PAGE,
    kuhd: ITEMS_PER_PAGE,
    kuhap: ITEMS_PER_PAGE
  })

  const observerTargets = useRef<Record<string, HTMLDivElement | null>>({})

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    const filtered: Record<LegalCategory, LegalReferenceItem[]> = {} as any

    Object.entries(data).forEach(([category, items]) => {
      const filteredItems = items.filter((item) => {
        const searchableText = [
          item.title,
          item.judul,
          item.content,
          item.isi,
          item.description,
          item.deskripsi,
          item.pasal,
          item.ayat,
          item.bab,
          item.bagian
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(query)
      })

      filtered[category as LegalCategory] = filteredItems
    })

    return filtered
  }, [data, searchQuery])

  // Get display text for item
  const getItemTitle = (item: LegalReferenceItem) => {
    return (
      item.title ||
      item.judul ||
      item.pasal ||
      item.bab ||
      item.article ||
      `Item ${item.id}`
    )
  }

  const getItemContent = (item: LegalReferenceItem) => {
    return (
      item.content ||
      item.isi ||
      item.description ||
      item.deskripsi ||
      'Konten tidak tersedia'
    )
  }

  // Copy text to clipboard
  const handleCopy = async (text: string, id: string | number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(String(id))
      toast.success('Teks berhasil disalin')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Gagal menyalin teks')
    }
  }

  // Share functionality
  const handleShare = async (title: string, content: string) => {
    const shareText = `${title}\n\n${content}\n\nSumber: Referensi Hukum`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText
        })
        toast.success('Berhasil dibagikan')
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(shareText)
        }
      }
    } else {
      fallbackShare(shareText)
    }
  }

  const fallbackShare = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Teks disalin ke clipboard')
    } catch (error) {
      toast.error('Gagal membagikan')
    }
  }

  // Get result count for each category
  const getResultCount = (category: LegalCategory) => {
    return filteredData[category]?.length || 0
  }

  // Load more items for a category
  const loadMore = useCallback((category: LegalCategory) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [category]: prev[category] + ITEMS_PER_PAGE
    }))
  }, [])

  // Intersection Observer for infinity scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    Object.keys(observerTargets.current).forEach((key) => {
      const target = observerTargets.current[key]
      if (!target) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const category = key.split('-')[0] as LegalCategory
              loadMore(category)
            }
          })
        },
        { threshold: 0.1, rootMargin: '100px' }
      )

      observer.observe(target)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [loadMore])

  // Get icon component for category
  const getCategoryIcon = (category: LegalCategory) => {
    const Icon = CATEGORY_ICONS[category]
    return Icon
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pasal, ayat, bab, atau konten hukum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                Bersihkan
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <FileSearch className="h-3 w-3" />
                Hasil: {Object.values(filteredData).reduce((acc, items) => acc + items.length, 0)} item
              </Badge>
              <p className="text-sm text-muted-foreground">
                untuk &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Categories */}
      <Tabs defaultValue="pancasila" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
          {LEGAL_CATEGORIES.map((category) => {
            const count = getResultCount(category.id)
            const Icon = getCategoryIcon(category.id)
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex-col h-auto py-4 px-4 border-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all"
              >
                <Icon className="h-6 w-6 mb-2" strokeWidth={2} />
                <span className="font-bold text-xs">{category.label}</span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="mt-2 text-xs data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {LEGAL_CATEGORIES.map((category) => {
          const items = filteredData[category.id] || []
          const visibleItems = items.slice(0, visibleCounts[category.id])
          const hasMore = visibleItems.length < items.length
          const Icon = getCategoryIcon(category.id)

          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card className="border-2">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-3 rounded-xl ${category.color} border`}>
                        <Icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{category.label}</CardTitle>
                        <CardDescription className="text-sm">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${category.color} border text-sm px-3 py-1`} variant="secondary">
                      {items.length} Item
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className={`p-4 rounded-2xl ${category.color} border-2 mb-4`}>
                        <FileSearch className="h-12 w-12" strokeWidth={1.5} />
                      </div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        Tidak ada hasil ditemukan
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Coba ubah kata kunci pencarian atau pilih kategori lain
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Accordion type="single" collapsible className="w-full space-y-2">
                        {visibleItems.map((item, index) => {
                          const itemId = String(item.id || index)
                          const title = getItemTitle(item)
                          const content = getItemContent(item)
                          const isCopied = copiedId === itemId

                          return (
                            <AccordionItem
                              key={itemId}
                              value={itemId}
                              className="border-2 rounded-lg px-4 data-[state=open]:bg-muted/30"
                            >
                              <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-start gap-3 text-left w-full">
                                  <Badge
                                    variant="outline"
                                    className={`mt-0.5 min-w-[3rem] justify-center ${category.color} border`}
                                  >
                                    {index + 1}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="font-semibold text-base mb-1">{title}</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                      {item.pasal && (
                                        <Badge variant="secondary" className="font-normal">
                                          Pasal {item.pasal}
                                          {item.ayat && ` Ayat ${item.ayat}`}
                                        </Badge>
                                      )}
                                      {item.bab && (
                                        <Badge variant="secondary" className="font-normal">
                                          Bab {item.bab}
                                          {item.bagian && ` - ${item.bagian}`}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pl-14 pr-2 pb-2">
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="p-4 bg-muted/50 rounded-lg border">
                                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {content}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopy(content, itemId)}
                                      className="gap-2"
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="h-4 w-4" />
                                          Tersalin
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-4 w-4" />
                                          Salin Teks
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleShare(title, content)}
                                      className="gap-2"
                                    >
                                      <Share2 className="h-4 w-4" />
                                      Bagikan
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>

                      {/* Load More Trigger & Button */}
                      {hasMore && (
                        <div className="space-y-4 pt-4">
                          {/* Intersection Observer Trigger */}
                          <div
                            ref={(el) => {
                              observerTargets.current[`${category.id}-trigger`] = el
                            }}
                            className="h-4"
                          />

                          {/* Loading Indicator */}
                          <div className="flex flex-col items-center gap-3 py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Memuat lebih banyak item...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Menampilkan {visibleItems.length} dari {items.length} item
                            </p>
                            {/* Manual Load More Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadMore(category.id)}
                              className="gap-2 mt-2"
                            >
                              <ChevronDown className="h-4 w-4" />
                              Muat Lebih Banyak ({items.length - visibleItems.length} tersisa)
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* All Loaded Message */}
                      {!hasMore && items.length > ITEMS_PER_PAGE && (
                        <div className="text-center py-6 border-t">
                          <p className="text-sm text-muted-foreground">
                            ✓ Semua {items.length} item telah dimuat
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
