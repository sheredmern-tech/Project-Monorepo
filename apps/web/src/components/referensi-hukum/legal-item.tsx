'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Share2, Check } from 'lucide-react'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PancasilaItem, LegalDataItem } from '@/types/external-data'

interface LegalItemProps {
  item: PancasilaItem | LegalDataItem
  itemId: string
  index: number
  isCopied: boolean
  onCopy: (content: string, id: string) => void
  onShare: (title: string, content: string) => void
}

export function LegalItem({ item, itemId, index, isCopied, onCopy, onShare }: LegalItemProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isPancasila = 'butir' in item
  const title = item.nama || 'Untitled'

  const getContent = (): string => {
    if (isPancasila) {
      const pancasilaItem = item as PancasilaItem
      return `${pancasilaItem.isi}\n\nButir-butir:\n${pancasilaItem.butir.map((b, i) => `${i + 1}. ${b}`).join('\n')}`
    }
    return (item as LegalDataItem).isi || 'Konten tidak tersedia'
  }

  const content = getContent()

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: mounted ? Math.min(index * 0.02, 0.5) : 0
      }}
    >
      <AccordionItem value={itemId} className="border rounded-lg px-4 hover:bg-muted/50 transition-colors">
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
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(content, itemId)}
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
                onClick={() => onShare(title, content)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Bagikan
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  )
}
