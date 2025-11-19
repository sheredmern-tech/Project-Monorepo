'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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

  // Load more items when scrolling (wrapped with useCallback)
  const loadMore = useCallback(() => {
    if (isLoadingMore) return

    const currentCount = visibleCounts[activeTab]
    const totalItems = filteredData[activeTab]?.items.length || 0

    if (currentCount < totalItems) {
      setIsLoadingMore(true)
      // Small delay for smooth UX
      setTimeout(() => {
        setVisibleCounts((prev) => ({
          ...prev,
          [activeTab]: Math.min(prev[activeTab] + ITEMS_PER_BATCH, totalItems)
        }))
        setIsLoadingMore(false)
      }, 300)
    }
  }, [activeTab, visibleCounts, filteredData, isLoadingMore])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        // When the load more trigger is visible, load more items
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before reaching the trigger
      }
    )

    observer.observe(currentRef)

    return () => {
      observer.disconnect()
    }
  }, [loadMore])

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
    <div className="space-y-0">
      {/* Sticky Search & Navigation Bar */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="space-y-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pasal, ayat, sila, atau konten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10 h-11"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as LegalCategory)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
              {LEGAL_CATEGORIES.map((category) => {
                const count = getResultCount(category.id)
                const IconComponent = getIconComponent(category.iconName)
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 h-10 px-3 data-[state=active]:bg-foreground data-[state=active]:text-background"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">{category.label}</span>
                    {searchQuery && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      <Tabs value={activeTab} className="w-full">
        {LEGAL_CATEGORIES.map((category) => {
          const processedData = filteredData[category.id]
          const items = processedData?.items || []
          const metadata = processedData?.metadata
          const visibleItems = items.slice(0, visibleCounts[category.id])

          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              {/* Category Header */}
              <div className="mb-6 pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{category.label}</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    {metadata?.uu && (
                      <p className="text-xs text-muted-foreground font-medium">{metadata.uu}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {items.length} Items
                  </Badge>
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Tidak ada hasil ditemukan
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coba ubah kata kunci pencarian Anda
                  </p>
                </div>
              ) : (
                <>
                  <Accordion type="single" collapsible className="w-full space-y-2">
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
                          className="border rounded-lg px-4 hover:bg-muted/50 transition-colors"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-start gap-3 text-left w-full">
                              <Badge variant="outline" className="mt-0.5 shrink-0 font-mono text-xs">
                                {index + 1}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base">{title}</p>
                                {isPancasila && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {(item as PancasilaItem).isi}
                                  </p>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pl-10 pr-4 pb-4">
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {content}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
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
                    <div className="mt-8 space-y-4">
                      {/* Intersection Observer Trigger */}
                      <div ref={loadMoreRef} className="h-1" />

                      <div className="flex flex-col items-center justify-center gap-4 py-6 border-t">
                        {isLoadingMore ? (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Memuat lebih banyak...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">
                              Menampilkan {visibleCounts[category.id]} dari {items.length} item
                            </p>
                            {/* Manual Load More Button (fallback) */}
                            <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                              Muat{' '}
                              {Math.min(ITEMS_PER_BATCH, items.length - visibleCounts[category.id])}{' '}
                              Item Lagi
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* All items loaded */}
                  {visibleCounts[category.id] >= items.length && items.length > 0 && (
                    <div className="flex items-center justify-center gap-2 py-8 mt-6 text-sm text-muted-foreground border-t">
                      <Check className="h-4 w-4" />
                      <span>Semua data telah dimuat ({items.length} item)</span>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
