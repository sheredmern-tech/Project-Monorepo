// ============================================
// FILE: app/home/_components/ui/section-heading.tsx
// UPDATED: PHASE 3 - Fixed gradient visibility, use solid B&W
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
        <Badge
          variant="secondary"
          className="mb-4 text-sm px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
        >
          {badge}
        </Badge>
      )}

      {/* Solid B&W Typography - No Gradient */}
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
