'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search,
  Copy,
  Share2,
  Check,
  Loader2,
  X,
  Flag,
  ScrollText,
  Scale,
  FileText,
  Briefcase,
  Landmark,
  LucideIcon
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
  LegalCategory,
  LEGAL_CATEGORIES,
  ProcessedLegalData,
  PancasilaItem,
  LegalDataItem
} from '@/types/external-data'

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Flag,
  ScrollText,
  Scale,
  FileText,
  Briefcase,
  Landmark
}

interface LegalReferenceClientProps {
  data: Record<LegalCategory, ProcessedLegalData>
}

export function LegalReferenceClient({ data }: LegalReferenceClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<LegalCategory>('pancasila')
  const [visibleCounts, setVisibleCounts] = useState<Record<LegalCategory, number>>({
    pancasila: 30,
    uud1945: 30,
    kuhp: 30,
    kuhperdata: 30,
    kuhd: 30,
    kuhap: 30
  })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const ITEMS_PER_BATCH = 30

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    const filtered: Record<LegalCategory, ProcessedLegalData> = {} as any

    Object.entries(data).forEach(([category, processedData]) => {
      const filteredItems = processedData.items.filter((item) => {
        const isPancasila = 'butir' in item

        if (isPancasila) {
          const pancasilaItem = item as PancasilaItem
          const searchText = [pancasilaItem.nama, pancasilaItem.isi, ...pancasilaItem.butir]
            .join(' ')
            .toLowerCase()
          return searchText.includes(query)
        } else {
          const legalItem = item as LegalDataItem
          const searchText = [legalItem.nama, legalItem.isi].join(' ').toLowerCase()
          return searchText.includes(query)
        }
      })

      filtered[category as LegalCategory] = {
        ...processedData,
        items: filteredItems
      }
    })

    return filtered
  }, [data, searchQuery])

  // Load more items when scrolling
  const loadMore = () => {
    const currentCount = visibleCounts[activeTab]
    const totalItems = filteredData[activeTab]?.items.length || 0

    if (currentCount < totalItems) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setVisibleCounts((prev) => ({
          ...prev,
          [activeTab]: Math.min(currentCount + ITEMS_PER_BATCH, totalItems)
        }))
        setIsLoadingMore(false)
      }, 300)
    }
  }

  // Setup intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [activeTab, isLoadingMore, visibleCounts])

  // Attach observer to load more trigger
  useEffect(() => {
    const currentRef = loadMoreRef.current
    const currentObserver = observerRef.current

    if (currentRef && currentObserver) {
      currentObserver.observe(currentRef)
    }

    return () => {
      if (currentRef && currentObserver) {
        currentObserver.unobserve(currentRef)
      }
    }
  }, [activeTab, filteredData])

  // Reset visible count when search changes or tab changes
  useEffect(() => {
    setVisibleCounts({
      pancasila: 30,
      uud1945: 30,
      kuhp: 30,
      kuhperdata: 30,
      kuhd: 30,
      kuhap: 30
    })
  }, [searchQuery])

  // Get item display text
  const getItemTitle = (item: PancasilaItem | LegalDataItem) => {
    return item.nama || 'Untitled'
  }

  const getItemContent = (item: PancasilaItem | LegalDataItem) => {
    const isPancasila = 'butir' in item

    if (isPancasila) {
      const pancasilaItem = item as PancasilaItem
      return `${pancasilaItem.isi}\n\nButir-butir:\n${pancasilaItem.butir.map((b, i) => `${i + 1}. ${b}`).join('\n')}`
    }

    return (item as LegalDataItem).isi || 'Konten tidak tersedia'
  }

  // Copy to clipboard
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Teks berhasil disalin')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Gagal menyalin teks')
    }
  }

  // Share functionality
  const handleShare = async (title: string, content: string) => {
    const shareText = `${title}\n\n${content}\n\nSumber: Referensi Hukum - Firma App`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText
        })
        toast.success('Berhasil dibagikan')
      } catch (error) {
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

  // Get result count
  const getResultCount = (category: LegalCategory) => {
    return filteredData[category]?.items.length || 0
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    return CATEGORY_ICONS[iconName] || FileText
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar with Clear Button */}
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari sila, pasal, ayat, atau konten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10 h-12 text-base border-2"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Menampilkan hasil pencarian untuk &quot;{searchQuery}&quot;
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Categories */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LegalCategory)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
          {LEGAL_CATEGORIES.map((category) => {
            const count = getResultCount(category.id)
            const IconComponent = getIconComponent(category.iconName)
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={`flex-col h-auto py-4 px-4 rounded-xl transition-all ${category.color.border} ${category.color.bg} data-[state=active]:shadow-lg data-[state=active]:scale-105`}
              >
                <IconComponent className={`h-6 w-6 mb-2 ${category.color.text}`} />
                <span className={`font-semibold text-xs ${category.color.text}`}>
                  {category.label}
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {LEGAL_CATEGORIES.map((category) => {
          const processedData = filteredData[category.id]
          const items = processedData?.items || []
          const metadata = processedData?.metadata
          const visibleItems = items.slice(0, visibleCounts[category.id])
          const IconComponent = getIconComponent(category.iconName)

          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card className={`${category.color.border} shadow-xl`}>
                <CardHeader className={category.color.bg}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${category.color.bg} ${category.color.border}`}
                        >
                          <IconComponent className={`h-6 w-6 ${category.color.text}`} />
                        </div>
                        <span className={category.color.text}>{category.label}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {category.description}
                      </CardDescription>
                      {metadata?.uu && (
                        <p className="text-sm font-medium text-muted-foreground">
                          {metadata.uu}
                        </p>
                      )}
                      {metadata?.keterangan && (
                        <p className="text-xs text-muted-foreground italic">
                          {metadata.keterangan}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`${category.color.bg} ${category.color.text} ${category.color.border} text-base px-4 py-2`}
                      variant="secondary"
                    >
                      {items.length} Item
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <p className="text-xl font-semibold text-muted-foreground">
                        Tidak ada hasil ditemukan
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Coba ubah kata kunci pencarian Anda
                      </p>
                    </div>
                  ) : (
                    <>
                      <Accordion type="single" collapsible className="w-full">
                        {visibleItems.map((item, index) => {
                          const itemId = `${category.id}-${index}`
                          const title = getItemTitle(item)
                          const content = getItemContent(item)
                          const isCopied = copiedId === itemId
                          const isPancasila = 'butir' in item

                          return (
                            <AccordionItem
                              key={itemId}
                              value={itemId}
                              className="border-l-4 border-l-transparent hover:border-l-primary/50 transition-all"
                            >
                              <AccordionTrigger className="hover:no-underline px-4 hover:bg-muted/50 rounded-lg">
                                <div className="flex items-start gap-3 text-left w-full">
                                  <Badge
                                    variant="outline"
                                    className={`mt-0.5 shrink-0 ${category.color.border} ${category.color.text} font-mono`}
                                  >
                                    {index + 1}
                                  </Badge>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-base">{title}</p>
                                    {isPancasila && (
                                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                                        {(item as PancasilaItem).isi}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pl-16 pr-4">
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                      {content}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopy(content, itemId)}
                                      className={`gap-2 ${isCopied ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' : ''}`}
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="h-4 w-4" />
                                          Tersalin
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-4 w-4" />
                                          Salin
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

                      {/* Infinite Scroll Trigger & Loading Indicator */}
                      {visibleCounts[category.id] < items.length && (
                        <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                          {isLoadingMore ? (
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span className="text-base font-medium">Memuat lebih banyak...</span>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground bg-muted/50 px-6 py-3 rounded-full">
                              Menampilkan {visibleCounts[category.id]} dari {items.length} item
                            </div>
                          )}
                        </div>
                      )}

                      {/* All items loaded */}
                      {visibleCounts[category.id] >= items.length && items.length > 0 && (
                        <div className="flex items-center justify-center gap-2 py-8 mt-4 text-sm font-medium text-muted-foreground border-t-2 border-dashed">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>Semua data telah dimuat ({items.length} item)</span>
                        </div>
                      )}
                    </>
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
