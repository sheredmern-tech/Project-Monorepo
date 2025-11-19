'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import {
  Flag,
  ScrollText,
  Scale,
  FileText,
  Briefcase,
  Landmark
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const getIconComponent = (iconName: string): LucideIcon => {
    return CATEGORY_ICONS[iconName] || FileText
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as LegalCategory)} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
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
                className="flex items-center gap-2 h-10 px-3 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{category.label}</span>
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
    </Tabs>
  )
}
