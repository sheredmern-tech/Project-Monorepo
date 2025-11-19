'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Accordion } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  LegalCategory,
  LEGAL_CATEGORIES,
  ProcessedLegalData,
  PancasilaItem,
  LegalDataItem
} from '@/types/external-data'
import { SearchBar } from './search-bar'
import { TabNavigation } from './tab-navigation'
import { LegalItem } from './legal-item'
import { InfinityScrollTrigger } from './infinity-scroll-trigger'

interface LegalReferenceClientProps {
  data: Record<LegalCategory, ProcessedLegalData>
}

const ITEMS_PER_BATCH = 30

export function LegalReferenceClient({ data }: LegalReferenceClientProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<LegalCategory>('pancasila')
  const [visibleCounts, setVisibleCounts] = useState<Record<LegalCategory, number>>({
    pancasila: ITEMS_PER_BATCH,
    uud1945: ITEMS_PER_BATCH,
    kuhp: ITEMS_PER_BATCH,
    kuhperdata: ITEMS_PER_BATCH,
    kuhd: ITEMS_PER_BATCH,
    kuhap: ITEMS_PER_BATCH
  })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    const filtered: Record<LegalCategory, ProcessedLegalData> = {} as Record<
      LegalCategory,
      ProcessedLegalData
    >

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
  const loadMore = useCallback(() => {
    if (isLoadingMore) return

    const currentCount = visibleCounts[activeTab]
    const totalItems = filteredData[activeTab]?.items.length || 0

    if (currentCount < totalItems) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setVisibleCounts((prev) => ({
          ...prev,
          [activeTab]: Math.min(prev[activeTab] + ITEMS_PER_BATCH, totalItems)
        }))
        setIsLoadingMore(false)
      }, 400)
    }
  }, [activeTab, visibleCounts, filteredData, isLoadingMore])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          loadMore()
        }
      },
      {
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: '300px 0px'
      }
    )

    observer.observe(currentRef)

    return () => {
      observer.disconnect()
    }
  }, [loadMore, activeTab])

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCounts({
      pancasila: ITEMS_PER_BATCH,
      uud1945: ITEMS_PER_BATCH,
      kuhp: ITEMS_PER_BATCH,
      kuhperdata: ITEMS_PER_BATCH,
      kuhd: ITEMS_PER_BATCH,
      kuhap: ITEMS_PER_BATCH
    })
  }, [searchQuery])

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Teks berhasil disalin')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Gagal menyalin teks')
    }
  }, [])

  // Share functionality
  const handleShare = useCallback(async (title: string, content: string) => {
    const shareText = `${title}\n\n${content}\n\nSumber: Referensi Hukum - Firma App`

    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText })
        toast.success('Berhasil dibagikan')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(shareText)
            toast.success('Teks disalin ke clipboard')
          } catch {
            toast.error('Gagal membagikan')
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success('Teks disalin ke clipboard')
      } catch {
        toast.error('Gagal membagikan')
      }
    }
  }, [])

  // Get result count for category
  const getResultCount = useCallback(
    (category: LegalCategory): number => {
      return filteredData[category]?.items.length || 0
    },
    [filteredData]
  )

  return (
    <div className="space-y-0" style={{ scrollBehavior: 'auto' }}>
      {/* Sticky Search & Navigation Bar */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="space-y-4 py-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            getResultCount={getResultCount}
          />
        </div>
      </div>

      {/* Content Area */}
      <Tabs value={activeTab} className="w-full">
        {LEGAL_CATEGORIES.map((category) => {
          const processedData = filteredData[category.id]
          const items = processedData?.items || []
          const metadata = processedData?.metadata
          const visibleItems = items.slice(0, visibleCounts[category.id])
          const hasMore = visibleCounts[category.id] < items.length

          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              {/* Category Header */}
              <motion.div
                initial={mounted ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 pb-6 border-b"
              >
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
              </motion.div>

              {/* Items List */}
              {items.length === 0 ? (
                <motion.div
                  initial={mounted ? { opacity: 0, scale: 0.95 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Tidak ada hasil ditemukan
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coba ubah kata kunci pencarian Anda
                  </p>
                </motion.div>
              ) : (
                <div className="relative">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {visibleItems.map((item, index) => (
                      <LegalItem
                        key={`${category.id}-${index}`}
                        item={item}
                        itemId={`${category.id}-${index}`}
                        index={index}
                        isCopied={copiedId === `${category.id}-${index}`}
                        onCopy={handleCopy}
                        onShare={handleShare}
                      />
                    ))}
                  </Accordion>

                  {/* Infinity Scroll Trigger */}
                  {hasMore && (
                    <InfinityScrollTrigger
                      loadMoreRef={loadMoreRef}
                      isLoadingMore={isLoadingMore}
                      itemsPerBatch={ITEMS_PER_BATCH}
                      totalItems={items.length}
                      visibleCount={visibleCounts[category.id]}
                      categoryId={category.id}
                      onLoadMore={loadMore}
                    />
                  )}

                  {/* All items loaded */}
                  {!hasMore && items.length > 0 && (
                    <motion.div
                      initial={mounted ? { opacity: 0, y: 20 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center gap-2 py-8 mt-6 text-sm text-muted-foreground border-t"
                    >
                      <Check className="h-4 w-4" />
                      <span>Semua data telah dimuat ({items.length} item)</span>
                    </motion.div>
                  )}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
