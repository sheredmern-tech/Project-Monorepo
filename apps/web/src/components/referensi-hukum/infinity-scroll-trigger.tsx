'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LegalCategory } from '@/types/external-data'

interface InfinityScrollTriggerProps {
  loadMoreRef: React.RefObject<HTMLDivElement>
  isLoadingMore: boolean
  itemsPerBatch: number
  totalItems: number
  visibleCount: number
  categoryId: LegalCategory
  onLoadMore: () => void
}

export function InfinityScrollTrigger({
  loadMoreRef,
  isLoadingMore,
  itemsPerBatch,
  totalItems,
  visibleCount,
  onLoadMore
}: InfinityScrollTriggerProps) {
  return (
    <div className="relative mt-8">
      {/* Spacer to ensure scrollability */}
      <div className="h-40" />

      {/* Intersection Observer Trigger - positioned for optimal detection */}
      <div ref={loadMoreRef} className="absolute top-0 left-0 right-0 h-1" />

      {/* Loading State */}
      <AnimatePresence>
        {isLoadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 right-0 h-full flex items-center justify-center"
          >
            {/* Minimalist White Blur Fade Effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)'
              }}
            />
            {/* Loading Indicator */}
            <div className="relative flex items-center gap-3 text-muted-foreground backdrop-blur-sm bg-background/80 px-6 py-3 rounded-full border shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Memuat...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback Manual Button (appears if auto-loading seems stuck) */}
      {!isLoadingMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.5 }}
          className="absolute top-0 left-0 right-0 flex items-center justify-center h-full"
        >
          <Button variant="outline" onClick={onLoadMore} className="gap-2 shadow-md">
            <Loader2 className="h-4 w-4" />
            Muat {Math.min(itemsPerBatch, totalItems - visibleCount)} Item Lagi
          </Button>
        </motion.div>
      )}
    </div>
  )
}
