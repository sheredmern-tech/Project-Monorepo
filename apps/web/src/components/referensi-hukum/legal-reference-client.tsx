'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Copy, Share2, Check, Loader2 } from 'lucide-react'
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

interface LegalReferenceClientProps {
  data: Record<LegalCategory, ProcessedLegalData>
}

export function LegalReferenceClient({ data }: LegalReferenceClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<LegalCategory>('pancasila')
  const [displayCounts, setDisplayCounts] = useState<Record<LegalCategory, number>>({
    pancasila: 20,
    uud1945: 20,
    kuhp: 20,
    kuhperdata: 20,
    kuhd: 20,
    kuhap: 20
  })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const ITEMS_PER_PAGE = 20

  // ========== PINDAHIN filteredData KE SINI (SEBELUM dipake) ==========
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    const filtered: Record<LegalCategory, ProcessedLegalData> = {} as any

    Object.entries(data).forEach(([category, processedData]) => {
      const filteredItems = processedData.items.filter((item) => {
        const isPancasila = 'butir' in item

        if (isPancasila) {
          const pancasilaItem = item as PancasilaItem
          const searchText = [
            pancasilaItem.nama,
            pancasilaItem.isi,
            ...pancasilaItem.butir
          ].join(' ').toLowerCase()
          return searchText.includes(query)
        } else {
          const legalItem = item as LegalDataItem
          const searchText = [
            legalItem.nama,
            legalItem.isi
          ].join(' ').toLowerCase()
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
    const currentCount = displayCounts[activeTab]
    const totalItems = filteredData[activeTab]?.items.length || 0

    if (currentCount < totalItems) {
      setIsLoadingMore(true)
      setTimeout(() => {
        setDisplayCounts(prev => ({
          ...prev,
          [activeTab]: Math.min(currentCount + ITEMS_PER_PAGE, totalItems)
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
  }, [activeTab, isLoadingMore, displayCounts])

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

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCounts({
      pancasila: 20,
      uud1945: 20,
      kuhp: 20,
      kuhperdata: 20,
      kuhd: 20,
      kuhap: 20
    })
  }, [searchQuery])

  // Filter data based on search query


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

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari sila, pasal, ayat, atau konten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground">
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
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex-col h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className="font-semibold text-xs">{category.label}</span>
                {searchQuery && (
                  <Badge variant="secondary" className="mt-1 text-xs">
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

          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        {category.label}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                      {metadata?.uu && (
                        <p className="text-sm text-muted-foreground">
                          {metadata.uu}
                        </p>
                      )}
                      {metadata?.keterangan && (
                        <p className="text-xs text-muted-foreground">
                          {metadata.keterangan}
                        </p>
                      )}
                    </div>
                    <Badge className={category.color} variant="secondary">
                      {items.length} Item
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Tidak ada hasil ditemukan
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Coba ubah kata kunci pencarian Anda
                      </p>
                    </div>
                  ) : (
                    <>
                      <Accordion type="single" collapsible className="w-full">
                        {items.slice(0, displayCounts[category.id]).map((item, index) => {
                          const itemId = `${category.id}-${index}`
                          const title = getItemTitle(item)
                          const content = getItemContent(item)
                          const isCopied = copiedId === itemId
                          const isPancasila = 'butir' in item

                          return (
                            <AccordionItem key={itemId} value={itemId}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-start gap-3 text-left w-full">
                                  <Badge variant="outline" className="mt-0.5 shrink-0">
                                    {index + 1}
                                  </Badge>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold">{title}</p>
                                    {isPancasila && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {(item as PancasilaItem).isi}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pl-12">
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="text-foreground/90 whitespace-pre-wrap">
                                      {content}
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
                                          <Check className="h-3.5 w-3.5" />
                                          Tersalin
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3.5 w-3.5" />
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
                                      <Share2 className="h-3.5 w-3.5" />
                                      Bagikan
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>

                      {/* Infinite Scroll Trigger & Status */}
                      {displayCounts[category.id] < items.length && (
                        <div
                          ref={loadMoreRef}
                          className="flex items-center justify-center py-8"
                        >
                          {isLoadingMore ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Memuat lebih banyak...</span>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Menampilkan {displayCounts[category.id]} dari {items.length} item
                            </div>
                          )}
                        </div>
                      )}

                      {/* All items loaded */}
                      {displayCounts[category.id] >= items.length && items.length > 0 && (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground border-t">
                          ✓ Semua data telah dimuat ({items.length} item)
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