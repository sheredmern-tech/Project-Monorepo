// ============================================
// FILE: app/home/_components/ui/section-heading.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ReactNode } from 'react'

interface SectionHeadingProps {
  badge?: string
  title: string | ReactNode
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionHeading({ 
  badge, 
  title, 
  subtitle, 
  centered = true,
  className = ''
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${centered ? 'text-center' : ''} mb-16 ${className}`}
    >
      {badge && (
        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1.5">
          {badge}
        </Badge>
      )}
      
      <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}