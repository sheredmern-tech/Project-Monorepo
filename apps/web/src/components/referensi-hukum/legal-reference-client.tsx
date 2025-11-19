'use client'

import { useState, useMemo } from 'react'
import { Search, Copy, Share2, Check, ExternalLink } from 'lucide-react'
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

export function LegalReferenceClient({ data }: LegalReferenceClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pasal, ayat, atau konten..."
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
      <Tabs defaultValue="pancasila" className="w-full">
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
          const items = filteredData[category.id] || []

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
                    <Accordion type="single" collapsible className="w-full">
                      {items.map((item, index) => {
                        const itemId = String(item.id || index)
                        const title = getItemTitle(item)
                        const content = getItemContent(item)
                        const isCopied = copiedId === itemId

                        return (
                          <AccordionItem key={itemId} value={itemId}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-start gap-3 text-left">
                                <Badge variant="outline" className="mt-0.5">
                                  {index + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-semibold">{title}</p>
                                  {item.pasal && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Pasal {item.pasal}
                                      {item.ayat && ` Ayat ${item.ayat}`}
                                    </p>
                                  )}
                                  {item.bab && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Bab {item.bab}
                                      {item.bagian && ` - ${item.bagian}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pl-12">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <p className="text-foreground/90 whitespace-pre-wrap">
                                    {content}
                                  </p>
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
