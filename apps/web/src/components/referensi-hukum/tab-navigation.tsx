'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import {
  Flag,
  ScrollText,
  Scale,
  FileText,
  Briefcase,
  Landmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LegalCategory, LEGAL_CATEGORIES } from '@/types/external-data'

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Flag,
  ScrollText,
  Scale,
  FileText,
  Briefcase,
  Landmark
}

interface TabNavigationProps {
  activeTab: LegalCategory
  onTabChange: (tab: LegalCategory) => void
  searchQuery: string
  getResultCount: (category: LegalCategory) => number
}

export function TabNavigation({
  activeTab,
  onTabChange,
  searchQuery,
  getResultCount
}: TabNavigationProps) {
  const [mounted, setMounted] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check scroll position and update button states
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  // Scroll handlers
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: -200, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: 200, behavior: 'smooth' })
  }, [])

  // Update scroll state on mount and scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollPosition()
    container.addEventListener('scroll', checkScrollPosition)
    window.addEventListener('resize', checkScrollPosition)

    return () => {
      container.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [checkScrollPosition])

  const getIconComponent = (iconName: string): LucideIcon => {
    return CATEGORY_ICONS[iconName] || FileText
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as LegalCategory)} className="w-full">
      {/* Desktop: Grid Layout */}
      <TabsList className="hidden lg:grid w-full grid-cols-6 h-auto gap-2 bg-transparent p-0">
        {LEGAL_CATEGORIES.map((category, idx) => {
          const count = getResultCount(category.id)
          const IconComponent = getIconComponent(category.iconName)
          return (
            <motion.div
              key={category.id}
              initial={mounted ? { opacity: 0, y: -20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: mounted ? idx * 0.05 : 0 }}
            >
              <TabsTrigger
                value={category.id}
                className="flex items-center gap-2 h-10 px-4 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">{category.label}</span>
                {searchQuery && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            </motion.div>
          )
        })}
      </TabsList>

      {/* Mobile & Tablet: Horizontal Scroll with Navigation */}
      <div className="lg:hidden relative">
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto scrollbar-hide scroll-smooth"
        >
          <TabsList className="inline-flex h-auto gap-2 bg-transparent p-0 w-max">
            {LEGAL_CATEGORIES.map((category, idx) => {
              const count = getResultCount(category.id)
              const IconComponent = getIconComponent(category.iconName)
              return (
                <motion.div
                  key={category.id}
                  initial={mounted ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: mounted ? idx * 0.05 : 0 }}
                >
                  <TabsTrigger
                    value={category.id}
                    className="flex items-center gap-2 h-10 px-4 whitespace-nowrap data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{category.label}</span>
                    {searchQuery && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                </motion.div>
              )
            })}
          </TabsList>
        </div>

        {/* Chevron Navigation Buttons */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-md bg-background/95 backdrop-blur z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-md bg-background/95 backdrop-blur z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Tabs>
  )
}
